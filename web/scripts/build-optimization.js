#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build optimization script for Next.js production deployment

console.log('🚀 Starting optimized build process...');

// Clean previous build
console.log('🧹 Cleaning previous build...');
try {
  execSync('rm -rf .next out dist', { stdio: 'inherit' });
} catch (error) {
  console.log('No previous build to clean');
}

// Run type checking
console.log('🔍 Running type checking...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Type checking failed');
  process.exit(1);
}

// Run linting
console.log('🔧 Running linting...');
try {
  execSync('npx next lint', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ Linting warnings found');
}

// Optimized production build
console.log('📦 Building for production...');
const buildEnv = {
  ...process.env,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  ANALYZE: process.env.ANALYZE || 'false',
};

try {
  execSync('npx next build', { 
    stdio: 'inherit',
    env: buildEnv 
  });
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Generate sitemap if needed
console.log('🗺️ Generating sitemap...');
try {
  execSync('npx next-sitemap', { stdio: 'inherit' });
} catch (error) {
  console.log('Sitemap generation skipped (next-sitemap not installed)');
}

// Optimize images
console.log('🖼️ Optimizing images...');
try {
  execSync('npx next-optimized-images', { stdio: 'inherit' });
} catch (error) {
  console.log('Image optimization skipped (next-optimized-images not installed)');
}

// Generate bundle analysis if requested
if (process.env.ANALYZE === 'true') {
  console.log('📊 Analyzing bundle size...');
  try {
    execSync('npx @next/bundle-analyzer', { stdio: 'inherit' });
  } catch (error) {
    console.log('Bundle analysis skipped');
  }
}

// Create deployment manifest
console.log('📋 Creating deployment manifest...');
const manifest = {
  buildTime: new Date().toISOString(),
  version: process.env.npm_package_version || '1.0.0',
  nodeVersion: process.version,
  nextVersion: require('next/package.json').version,
  buildSize: getDirectorySize('.next'),
  environment: process.env.NODE_ENV,
};

fs.writeFileSync(
  path.join(process.cwd(), '.next', 'build-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Performance optimizations
console.log('⚡ Applying performance optimizations...');

// Create .htaccess for Apache servers (if needed)
const htaccess = `
# Next.js static files caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header always set X-Frame-Options DENY
  Header always set X-Content-Type-Options nosniff
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:"
</IfModule>
`;

fs.writeFileSync(path.join(process.cwd(), 'out', '.htaccess'), htaccess);

// Create nginx configuration
const nginxConfig = `
# Next.js nginx configuration
server {
    listen 80;
    server_name localhost;
    root /var/www/html/out;
    index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Cache static files
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Handle Next.js routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

fs.writeFileSync(path.join(process.cwd(), 'nginx.conf'), nginxConfig);

// Create deployment scripts
const deployScript = `#!/bin/bash

# Deployment script for Next.js application

echo "🚀 Deploying Next.js application..."

# Copy files to deployment directory
cp -r out/* /var/www/html/

# Set correct permissions
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/

# Restart nginx
systemctl reload nginx

echo "✅ Deployment complete!"
`;

fs.writeFileSync(path.join(process.cwd(), 'deploy.sh'), deployScript);
fs.chmodSync(path.join(process.cwd(), 'deploy.sh'), '755');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  } catch (error) {
    return 0;
  }
  
  return totalSize;
}

console.log('✅ Build optimization complete!');
console.log(`📊 Build size: ${(manifest.buildSize / 1024 / 1024).toFixed(2)} MB`);
console.log('📋 Deployment files created:');
console.log('   - .next/build-manifest.json');
console.log('   - out/.htaccess (Apache)');
console.log('   - nginx.conf (Nginx)');
console.log('   - deploy.sh (Deployment script)');
