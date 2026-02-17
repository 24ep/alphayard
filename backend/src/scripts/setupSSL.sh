#!/bin/bash

# SSL Certificate Setup Script for Bondarys
# This script sets up Let's Encrypt SSL certificates for production

set -e

# Configuration
DOMAIN=${1:-bondarys.com}
EMAIL=${2:-admin@bondarys.com}
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
SSL_CERT_DIR="/etc/ssl/certs"
SSL_KEY_DIR="/etc/ssl/private"
CERTBOT_DIR="/etc/letsencrypt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Update package list
    apt-get update
    
    # Install required packages
    apt-get install -y \
        nginx \
        certbot \
        python3-certbot-nginx \
        openssl \
        curl \
        wget \
        software-properties-common
    
    log "Dependencies installed successfully"
}

# Create SSL directories
create_ssl_directories() {
    log "Creating SSL directories..."
    
    mkdir -p $SSL_CERT_DIR
    mkdir -p $SSL_KEY_DIR
    mkdir -p $CERTBOT_DIR
    
    chmod 755 $SSL_CERT_DIR
    chmod 700 $SSL_KEY_DIR
    
    log "SSL directories created"
}

# Generate self-signed certificate for initial setup
generate_self_signed_cert() {
    log "Generating self-signed certificate for initial setup..."
    
    # Create self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout $SSL_KEY_DIR/bondarys-selfsigned.key \
        -out $SSL_CERT_DIR/bondarys-selfsigned.crt \
        -subj "/C=US/ST=State/L=City/O=Bondarys/OU=IT/CN=$DOMAIN"
    
    log "Self-signed certificate generated"
}

# Setup Nginx configuration
setup_nginx_config() {
    log "Setting up Nginx configuration..."
    
    # Create Nginx config directory
    mkdir -p $NGINX_CONFIG_DIR
    
    # Copy Nginx configuration
    if [ -f "/app/nginx/nginx.conf" ]; then
        cp /app/nginx/nginx.conf $NGINX_CONFIG_DIR/bondarys.conf
    else
        warn "Nginx configuration not found, creating basic config"
        create_basic_nginx_config
    fi
    
    # Enable site
    ln -sf $NGINX_CONFIG_DIR/bondarys.conf /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    nginx -t
    
    log "Nginx configuration setup completed"
}

# Create basic Nginx configuration
create_basic_nginx_config() {
    cat > $NGINX_CONFIG_DIR/bondarys.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuration
    ssl_certificate $SSL_CERT_DIR/bondarys-selfsigned.crt;
    ssl_certificate_key $SSL_KEY_DIR/bondarys-selfsigned.key;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to backend
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
}

# Start Nginx
start_nginx() {
    log "Starting Nginx..."
    
    systemctl enable nginx
    systemctl start nginx
    
    log "Nginx started"
}

# Obtain Let's Encrypt certificate
obtain_letsencrypt_cert() {
    log "Obtaining Let's Encrypt certificate for $DOMAIN..."
    
    # Stop Nginx temporarily
    systemctl stop nginx
    
    # Obtain certificate
    certbot certonly \
        --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --domain $DOMAIN \
        --domain www.$DOMAIN \
        --rsa-key-size 2048 \
        --must-staple \
        --force-renewal
    
    # Update Nginx configuration to use Let's Encrypt certificates
    sed -i "s|$SSL_CERT_DIR/bondarys-selfsigned.crt|$CERTBOT_DIR/live/$DOMAIN/fullchain.pem|g" $NGINX_CONFIG_DIR/bondarys.conf
    sed -i "s|$SSL_KEY_DIR/bondarys-selfsigned.key|$CERTBOT_DIR/live/$DOMAIN/privkey.pem|g" $NGINX_CONFIG_DIR/bondarys.conf
    
    # Test and restart Nginx
    nginx -t
    systemctl start nginx
    
    log "Let's Encrypt certificate obtained and Nginx updated"
}

# Setup automatic renewal
setup_auto_renewal() {
    log "Setting up automatic certificate renewal..."
    
    # Create renewal hook
    cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << EOF
#!/bin/bash
systemctl reload nginx
EOF
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
    
    # Add cron job for renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook '/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh'") | crontab -
    
    log "Automatic renewal setup completed"
}

# Test SSL configuration
test_ssl() {
    log "Testing SSL configuration..."
    
    # Test SSL certificate
    if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null > /dev/null 2>&1; then
        log "SSL certificate is valid"
    else
        error "SSL certificate test failed"
        return 1
    fi
    
    # Test HTTPS redirect
    if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" | grep -q "301"; then
        log "HTTP to HTTPS redirect is working"
    else
        warn "HTTP to HTTPS redirect may not be working"
    fi
    
    # Test HTTPS response
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200"; then
        log "HTTPS is responding correctly"
    else
        warn "HTTPS may not be responding correctly"
    fi
}

# Create SSL monitoring script
create_ssl_monitoring() {
    log "Creating SSL monitoring script..."
    
    cat > /usr/local/bin/ssl-monitor.sh << 'EOF'
#!/bin/bash

# SSL Certificate Monitoring Script

DOMAIN=${1:-bondarys.com}
DAYS_WARNING=${2:-30}

# Get certificate expiration date
EXPIRY_DATE=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt $DAYS_WARNING ]; then
    echo "WARNING: SSL certificate for $DOMAIN expires in $DAYS_LEFT days"
    # Send notification (you can add email/slack notification here)
    exit 1
else
    echo "SSL certificate for $DOMAIN is valid for $DAYS_LEFT more days"
    exit 0
fi
EOF
    
    chmod +x /usr/local/bin/ssl-monitor.sh
    
    # Add monitoring cron job
    (crontab -l 2>/dev/null; echo "0 8 * * * /usr/local/bin/ssl-monitor.sh $DOMAIN 30") | crontab -
    
    log "SSL monitoring script created"
}

# Main execution
main() {
    log "Starting SSL setup for $DOMAIN"
    
    # Check prerequisites
    check_root
    
    # Install dependencies
    install_dependencies
    
    # Create directories
    create_ssl_directories
    
    # Generate self-signed certificate
    generate_self_signed_cert
    
    # Setup Nginx
    setup_nginx_config
    
    # Start Nginx
    start_nginx
    
    # Wait for DNS propagation
    log "Waiting for DNS propagation..."
    sleep 30
    
    # Test domain resolution
    if nslookup $DOMAIN > /dev/null 2>&1; then
        log "Domain $DOMAIN resolves correctly"
        
        # Obtain Let's Encrypt certificate
        obtain_letsencrypt_cert
        
        # Setup auto-renewal
        setup_auto_renewal
        
        # Test SSL
        test_ssl
        
        # Create monitoring
        create_ssl_monitoring
        
        log "SSL setup completed successfully!"
        log "Your site is now available at: https://$DOMAIN"
        
    else
        error "Domain $DOMAIN does not resolve. Please check your DNS configuration."
        error "Skipping Let's Encrypt certificate generation."
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [DOMAIN] [EMAIL]"
        echo "Example: $0 bondarys.com admin@bondarys.com"
        exit 0
        ;;
    --test)
        test_ssl
        exit 0
        ;;
    --renew)
        certbot renew --quiet --deploy-hook '/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh'
        exit 0
        ;;
    "")
        main
        ;;
    *)
        main
        ;;
esac
