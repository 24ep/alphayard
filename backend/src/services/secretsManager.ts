import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface SecretMetadata {
  name: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  description?: string;
  tags: string[];
  environment: string;
}

interface SecretValue {
  data: string; // encrypted
  checksum: string;
  algorithm: string;
  keyId: string;
}

interface Secret {
  metadata: SecretMetadata;
  value: SecretValue;
}

class SecretsManager {
  private static instance: SecretsManager;
  private secretsPath: string;
  private masterKey: string;
  private algorithm = 'aes-256-gcm';
  private keyDerivationInfo = 'bondarys-secrets-manager-v1';

  private constructor(secretsPath: string = './secrets') {
    this.secretsPath = secretsPath;
    this.masterKey = this.getOrCreateMasterKey();
  }

  static getInstance(secretsPath?: string): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager(secretsPath);
    }
    return SecretsManager.instance;
  }

  /**
   * Get or create master key
   */
  private getOrCreateMasterKey(): string {
    const keyPath = path.join(this.secretsPath, '.master-key');
    
    try {
      // Try to read existing master key
      const keyData = fs.readFileSync(keyPath, 'utf8');
      return keyData.trim();
    } catch {
      // Generate new master key
      const masterKey = crypto.randomBytes(32).toString('hex');
      
      // Ensure secrets directory exists
      fs.mkdirSync(this.secretsPath, { recursive: true });
      
      // Save master key
      fs.writeFileSync(keyPath, masterKey, 'utf8');
      
      // Set restrictive permissions
      fs.chmodSync(keyPath, 0o600);
      
      return masterKey;
    }
  }

  /**
   * Derive encryption key from master key
   */
  private deriveKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(this.masterKey, salt, 100000, 32, 'sha256');
  }

  /**
   * Encrypt secret value
   */
  private encrypt(value: string): { encrypted: string; salt: string; iv: string; tag: string } {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);
    const key = this.deriveKey(salt);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from(this.keyDerivationInfo));
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt secret value
   */
  private decrypt(encryptedData: string, salt: string, iv: string, tag: string): string {
    const key = this.deriveKey(Buffer.from(salt, 'hex'));
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from(this.keyDerivationInfo));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Store a secret
   */
  async storeSecret(
    name: string,
    value: string,
    options: {
      description?: string;
      tags?: string[];
      expiresAt?: Date;
      environment?: string;
    } = {}
  ): Promise<void> {
    const environment = options.environment || process.env.NODE_ENV || 'development';
    const secretPath = path.join(this.secretsPath, `${name}.${environment}.json`);
    
    // Encrypt the value
    const { encrypted, salt, iv, tag } = this.encrypt(value);
    const checksum = this.generateChecksum(value);
    
    const secret: Secret = {
      metadata: {
        name,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options.expiresAt,
        description: options.description,
        tags: options.tags || [],
        environment,
      },
      value: {
        data: encrypted,
        checksum,
        algorithm: this.algorithm,
        keyId: this.generateKeyId(),
      },
    };
    
    // Add encryption details
    (secret.value as any).salt = salt;
    (secret.value as any).iv = iv;
    (secret.value as any).tag = tag;
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(secretPath), { recursive: true });
    
    // Write secret file
    await fs.writeFile(secretPath, JSON.stringify(secret, null, 2), 'utf8');
    
    // Set restrictive permissions
    await fs.chmod(secretPath, 0o600);
    
    console.log(`✅ Secret stored: ${name} (${environment})`);
  }

  /**
   * Retrieve a secret
   */
  async getSecret(name: string, environment?: string): Promise<string | null> {
    const env = environment || process.env.NODE_ENV || 'development';
    const secretPath = path.join(this.secretsPath, `${name}.${env}.json`);
    
    try {
      const secretData = await fs.readFile(secretPath, 'utf8');
      const secret: Secret = JSON.parse(secretData);
      
      // Check if secret has expired
      if (secret.metadata.expiresAt && new Date() > secret.metadata.expiresAt) {
        console.warn(`⚠️  Secret ${name} has expired`);
        return null;
      }
      
      // Decrypt the value
      const { data, salt, iv, tag, checksum } = secret.value as any;
      const decrypted = this.decrypt(data, salt, iv, tag);
      
      // Verify checksum
      const computedChecksum = this.generateChecksum(decrypted);
      if (computedChecksum !== checksum) {
        throw new Error('Secret integrity check failed');
      }
      
      return decrypted;
      
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update a secret
   */
  async updateSecret(
    name: string,
    value: string,
    options: {
      description?: string;
      tags?: string[];
      expiresAt?: Date;
      environment?: string;
    } = {}
  ): Promise<void> {
    const environment = options.environment || process.env.NODE_ENV || 'development';
    const secretPath = path.join(this.secretsPath, `${name}.${environment}.json`);
    
    try {
      // Read existing secret
      const secretData = await fs.readFile(secretPath, 'utf8');
      const existingSecret: Secret = JSON.parse(secretData);
      
      // Encrypt new value
      const { encrypted, salt, iv, tag } = this.encrypt(value);
      const checksum = this.generateChecksum(value);
      
      // Update secret
      existingSecret.metadata.updatedAt = new Date();
      existingSecret.metadata.version += 1;
      existingSecret.metadata.expiresAt = options.expiresAt;
      existingSecret.metadata.description = options.description || existingSecret.metadata.description;
      existingSecret.metadata.tags = options.tags || existingSecret.metadata.tags;
      
      existingSecret.value = {
        data: encrypted,
        checksum,
        algorithm: this.algorithm,
        keyId: this.generateKeyId(),
      };
      
      // Add encryption details
      (existingSecret.value as any).salt = salt;
      (existingSecret.value as any).iv = iv;
      (existingSecret.value as any).tag = tag;
      
      // Write updated secret
      await fs.writeFile(secretPath, JSON.stringify(existingSecret, null, 2), 'utf8');
      await fs.chmod(secretPath, 0o600);
      
      console.log(`✅ Secret updated: ${name} (${environment}) - version ${existingSecret.metadata.version}`);
      
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // Secret doesn't exist, create it
        await this.storeSecret(name, value, options);
      } else {
        throw error;
      }
    }
  }

  /**
   * Delete a secret
   */
  async deleteSecret(name: string, environment?: string): Promise<void> {
    const env = environment || process.env.NODE_ENV || 'development';
    const secretPath = path.join(this.secretsPath, `${name}.${env}.json`);
    
    try {
      await fs.unlink(secretPath);
      console.log(`🗑️  Secret deleted: ${name} (${env})`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * List all secrets
   */
  async listSecrets(environment?: string): Promise<Array<SecretMetadata & { name: string }>> {
    const env = environment || process.env.NODE_ENV || 'development';
    const secrets: Array<SecretMetadata & { name: string }> = [];
    
    try {
      const files = await fs.readdir(this.secretsPath);
      const secretFiles = files.filter(file => file.endsWith(`.${env}.json`));
      
      for (const file of secretFiles) {
        try {
          const secretPath = path.join(this.secretsPath, file);
          const secretData = await fs.readFile(secretPath, 'utf8');
          const secret: Secret = JSON.parse(secretData);
          
          secrets.push({
            name: file.replace(`.${env}.json`, ''),
            ...secret.metadata,
          });
        } catch (error) {
          console.warn(`Failed to read secret file ${file}:`, error);
        }
      }
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
    
    return secrets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Rotate master key
   */
  async rotateMasterKey(): Promise<void> {
    console.log('🔄 Rotating master key...');
    
    // Get all secrets
    const secrets = await this.listSecrets();
    
    // Decrypt all secrets with old key
    const decryptedSecrets: Array<{ name: string; value: string; environment: string }> = [];
    
    for (const secret of secrets) {
      const value = await this.getSecret(secret.name, secret.environment);
      if (value) {
        decryptedSecrets.push({
          name: secret.name,
          value,
          environment: secret.environment,
        });
      }
    }
    
    // Generate new master key
    this.masterKey = crypto.randomBytes(32).toString('hex');
    const keyPath = path.join(this.secretsPath, '.master-key');
    await fs.writeFile(keyPath, this.masterKey, 'utf8');
    await fs.chmod(keyPath, 0o600);
    
    // Re-encrypt all secrets with new key
    for (const { name, value, environment } of decryptedSecrets) {
      const secretPath = path.join(this.secretsPath, `${name}.${environment}.json`);
      const secretData = await fs.readFile(secretPath, 'utf8');
      const secret: Secret = JSON.parse(secretData);
      
      // Re-encrypt
      const { encrypted, salt, iv, tag } = this.encrypt(value);
      const checksum = this.generateChecksum(value);
      
      secret.value = {
        data: encrypted,
        checksum,
        algorithm: this.algorithm,
        keyId: this.generateKeyId(),
      };
      
      (secret.value as any).salt = salt;
      (secret.value as any).iv = iv;
      (secret.value as any).tag = tag;
      
      await fs.writeFile(secretPath, JSON.stringify(secret, null, 2), 'utf8');
    }
    
    console.log(`✅ Master key rotated. Re-encrypted ${decryptedSecrets.length} secrets.`);
  }

  /**
   * Generate key ID
   */
  private generateKeyId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Export secrets (for backup)
   */
  async exportSecrets(environment?: string): Promise<string> {
    const env = environment || process.env.NODE_ENV || 'development';
    const secrets = await this.listSecrets(env);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      environment: env,
      secrets: secrets.map(secret => ({
        name: secret.name,
        metadata: secret.metadata,
      })),
      // Note: Actual secret values are not exported for security
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Validate secret integrity
   */
  async validateSecret(name: string, environment?: string): Promise<boolean> {
    try {
      const value = await this.getSecret(name, environment);
      return value !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get secrets that are expiring soon
   */
  async getExpiringSecrets(days: number = 30, environment?: string): Promise<Array<SecretMetadata & { name: string }>> {
    const env = environment || process.env.NODE_ENV || 'development';
    const secrets = await this.listSecrets(env);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return secrets.filter(secret => 
      secret.expiresAt && secret.expiresAt <= cutoffDate
    );
  }
}

export const secretsManager = SecretsManager.getInstance();
export default secretsManager;
