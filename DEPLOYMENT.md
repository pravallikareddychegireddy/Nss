# 🚀 NSS Portal - Deployment Guide

## 📋 Repository Information
- **GitHub Repository**: https://github.com/pravallikareddychegireddy/Nss
- **Branch**: main
- **Status**: ✅ All files successfully pushed

## 🔧 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/pravallikareddychegireddy/Nss.git
cd Nss
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 4. Start Development Server
```bash
npm run dev
```

## 🌐 Production Deployment Options

### Option 1: Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Steps
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create nss-portal-vignan

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_USER=your_email@gmail.com
heroku config:set EMAIL_PASSWORD=your_app_password

# Deploy
git push heroku main
```

### Option 2: Vercel Deployment (Frontend)

#### For Frontend Only
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd client
vercel --prod
```

#### Backend on Railway/Render
- Deploy backend separately on Railway or Render
- Update API URLs in frontend

### Option 3: VPS/Cloud Server

#### Requirements
- Ubuntu/CentOS server
- Node.js 16+
- MongoDB
- Nginx (optional)
- PM2 for process management

#### Setup Steps
```bash
# Clone repository
git clone https://github.com/pravallikareddychegireddy/Nss.git
cd Nss

# Install dependencies
npm install
cd client && npm install && cd ..

# Build frontend
cd client && npm run build && cd ..

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name "nss-portal"
pm2 startup
pm2 save
```

## 🔐 Environment Variables

### Required Variables
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nss-portal

# Security
JWT_SECRET=your_secure_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Frontend URL
CLIENT_URL=https://your-frontend-domain.com
```

## 📊 Database Setup

### MongoDB Atlas (Recommended)
1. Create MongoDB Atlas account
2. Create new cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for production)
5. Get connection string
6. Update MONGODB_URI in environment

### Local MongoDB
```bash
# Install MongoDB
# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Connection string
MONGODB_URI=mongodb://localhost:27017/nss-portal
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → App passwords
   - Select "Mail" and generate password
3. Use generated password in EMAIL_PASSWORD

### Alternative Email Services
- **SendGrid**: For production email delivery
- **Mailgun**: Alternative email service
- **AWS SES**: Amazon email service

## 🖼️ Image Storage Setup

### Cloudinary Configuration
1. Create Cloudinary account
2. Get credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Update environment variables

### Alternative Storage
- **AWS S3**: Amazon cloud storage
- **Google Cloud Storage**: Google cloud storage
- **Local Storage**: For development only

## 🔒 Security Considerations

### Production Security
- Use strong JWT secret (32+ characters)
- Enable HTTPS/SSL certificates
- Set secure CORS origins
- Use environment variables for all secrets
- Regular security updates

### Database Security
- Use MongoDB Atlas with authentication
- Whitelist specific IP addresses
- Regular backups
- Monitor access logs

## 📈 Performance Optimization

### Frontend Optimization
```bash
# Build optimized frontend
cd client
npm run build
```

### Backend Optimization
- Use PM2 for process management
- Enable gzip compression
- Set up caching headers
- Monitor memory usage

## 🔍 Monitoring & Logging

### Application Monitoring
- Use PM2 for process monitoring
- Set up error logging
- Monitor API response times
- Track user activity

### Health Checks
- Database connection monitoring
- Email service status
- File upload functionality
- Certificate generation

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Check MongoDB URI format
- Verify network connectivity
- Check IP whitelist settings

#### 2. Email Not Sending
- Verify Gmail app password
- Check email configuration
- Test with different email service

#### 3. File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Test with different image formats

#### 4. Certificate Generation Failed
- Check PDFKit dependencies
- Verify file permissions
- Test with sample data

## 📞 Support

### Repository Information
- **GitHub**: https://github.com/pravallikareddychegireddy/Nss
- **Issues**: Create GitHub issues for bugs
- **Documentation**: Check README.md for details

### Quick Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs nss-portal

# Restart application
pm2 restart nss-portal

# Update from repository
git pull origin main
npm install
cd client && npm install && npm run build
pm2 restart nss-portal
```

---

## ✅ Deployment Checklist

- [ ] Repository cloned successfully
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Email service configured
- [ ] Cloudinary setup complete
- [ ] Application starts without errors
- [ ] All features tested in production
- [ ] SSL certificate installed (production)
- [ ] Domain configured (production)
- [ ] Monitoring setup complete

**Your NSS Portal is ready for deployment! 🎉**