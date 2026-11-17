# MailVault – Production Deployment & DevOps Architecture Guide

This guide details how to deploy **MailVault** to a Linux VPS (Ubuntu/Debian), cloud platforms (Docker, Render, Railway), or Vercel with high availability, HTTPS, and automated database backups.

---

## 1. System Requirements & Architecture

- **Operating System:** Ubuntu 22.04 LTS / 24.04 LTS or Debian 12
- **Node.js:** v20.x or v22.x LTS
- **Database:** MongoDB Atlas (M0 Free Tier or M10+ Dedicated Cluster)
- **Reverse Proxy:** Nginx with HTTP/2 and Let's Encrypt SSL
- **Process Manager:** PM2 or Systemd

```
Internet (HTTPS) 
      │
      ▼
┌─────────────── Nginx (Port 80/443) ───────────────┐
│                                                   │
│   /api/* ────────► Node.js / Express (Port 5000)   │
│   /*     ────────► Next.js Frontend (Port 3000)   │
└───────────────────────────────────────────────────┘
      │
      ▼
MongoDB Atlas (Replica Set with SSL/TLS)
```

---

## 2. Environment Variables Configuration

Create `/backend/.env` on the production server (Never commit real `.env` files to Git):

```ini
NODE_ENV=production
PORT=5000
API_PREFIX=/api

# MongoDB Atlas Multi-Shard Cluster URI
MONGODB_URI=mongodb://<db_user>:<db_pass>@ac-abovynf-shard-00-00.msunl0c.mongodb.net:27017,ac-abovynf-shard-00-01.msunl0c.mongodb.net:27017,ac-abovynf-shard-00-02.msunl0c.mongodb.net:27017/mailvault?ssl=true&replicaSet=atlas-new9wt-shard-0&authSource=admin

# Security Secrets (Generate using: openssl rand -hex 32)
JWT_SECRET=your_production_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_production_refresh_jwt_secret_min_32_chars
COOKIE_SECRET=your_production_cookie_secret_min_32_chars
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Domain & CORS
FRONTEND_URL=https://yourdomain.com

# Transactional Email (Resend API + Nodemailer fallback)
RESEND_API_KEY=re_your_resend_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=noreply@yourdomain.com

# Google Cloud OAuth 2.0
GOOGLE_CLIENT_ID=474689305894-dlgv3e770r5dm1sag9ltnofat9o6ja6t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Default Initial Administrator
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=StrongAdminPassword2026!
```

---

## 3. Server Setup on Ubuntu Linux

### Step 1: Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: Clone & Build Application
```bash
cd /var/www
git clone https://github.com/SojibTechHub/Gmail_Backup.git mailvault
cd mailvault

# Build Backend
cd backend
npm ci
npm run build

# Build Frontend
cd ../frontend
npm ci
npm run build
```

### Step 3: Run with PM2 Process Manager
Create `/var/www/mailvault/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'mailvault-backend',
      cwd: '/var/www/mailvault/backend',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'mailvault-frontend',
      cwd: '/var/www/mailvault/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Start PM2 and configure startup on boot:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 4. Nginx Reverse Proxy & SSL Configuration

Create `/etc/nginx/sites-available/mailvault`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    # Frontend Reverse Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable configuration and generate SSL:
```bash
sudo ln -s /etc/nginx/sites-available/mailvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 5. Automated Encrypted MongoDB Backup Strategy

Create `/root/backup-mailvault.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mailvault"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MONGODB_URI="<your_mongodb_uri>"
PASSPHRASE="your_backup_encryption_passphrase"

mkdir -p $BACKUP_DIR

# 1. Dump database
mongodump --uri="$MONGODB_URI" --archive="$BACKUP_DIR/dump_$TIMESTAMP.archive" --gzip

# 2. Encrypt archive using OpenSSL AES-256-CBC
openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/dump_$TIMESTAMP.archive" -out "$BACKUP_DIR/mailvault_backup_$TIMESTAMP.enc" -k "$PASSPHRASE"
rm "$BACKUP_DIR/dump_$TIMESTAMP.archive"

# 3. Retain only last 14 days of backups
find $BACKUP_DIR -type f -name "*.enc" -mtime +14 -delete
```

Add cron job (`crontab -e`) to run every midnight:
```cron
0 0 * * * /bin/bash /root/backup-mailvault.sh >> /var/log/mailvault_backup.log 2>&1
```
