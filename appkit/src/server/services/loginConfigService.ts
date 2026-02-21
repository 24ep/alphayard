import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LoginConfig {
  [key: string]: any;
}

export interface LoginConfigValidation {
  valid: boolean;
  errors: string[];
}

class LoginConfigService {
  async getLoginConfig(applicationId: string): Promise<LoginConfig | null> {
    const config = await prisma.loginConfig.findFirst({
      where: { applicationId }
    });
    return config ? (config.configData as LoginConfig) : null;
  }

  validateLoginConfig(config: any): LoginConfigValidation {
    // Basic validation for now - check if its a non-null object
    if (!config || typeof config !== 'object') {
      return { valid: false, errors: ['Configuration must be a valid object'] };
    }
    return { valid: true, errors: [] };
  }

  async updateLoginConfig(applicationId: string, config: LoginConfig): Promise<LoginConfig> {
    const existing = await prisma.loginConfig.findFirst({
      where: { applicationId }
    });

    if (existing) {
      const updated = await prisma.loginConfig.update({
        where: { id: existing.id },
        data: { configData: config }
      });
      return updated.configData as LoginConfig;
    } else {
      const created = await prisma.loginConfig.create({
        data: { 
          applicationId,
          configData: config 
        }
      });
      return created.configData as LoginConfig;
    }
  }

  async cloneLoginConfig(sourceId: string, targetId: string): Promise<LoginConfig> {
    const source = await this.getLoginConfig(sourceId);
    if (!source) return {};
    return this.updateLoginConfig(targetId, source);
  }

  async resetLoginConfig(applicationId: string): Promise<LoginConfig> {
    const defaultConfig = { theme: 'light', allowRegistration: true };
    return this.updateLoginConfig(applicationId, defaultConfig);
  }
}

export const loginConfigService = new LoginConfigService();
export default loginConfigService;
