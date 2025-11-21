# 🤝 NSS Portal - National Service Scheme Management System

A comprehensive web application for managing National Service Scheme (NSS) activities at Vignan University.

## 🌟 Features

### 👥 **User Management**
- **Multi-role system**: Admin, Faculty, Student
- **Secure authentication** with JWT tokens
- **Email verification** for new registrations
- **Profile management** with role-based access

### 📅 **Event Management**
- **Create and manage events** (Admin/Faculty)
- **Event registration** for students
- **Event status tracking** (Upcoming, Ongoing, Completed)
- **Photo uploads** with Cloudinary integration
- **Automated event reminders** via email

### 📊 **Participation Tracking**
- **Student registration** for events
- **Participation report submission** with photos
- **Admin approval workflow** for participations
- **Hours tracking** for each student
- **Performance monitoring**

### 🏆 **Certificate System**
- **Individual event certificates** for approved participations
- **Final completion certificates** for 60+ hours (Admin-only)
- **Performance-based ratings** (Excellent, Good, Satisfactory)
- **Professional PDF generation** with NSS branding
- **Unique certificate IDs** for verification

### 📈 **Analytics & Reports**
- **Dashboard statistics** for all user roles
- **Student progress tracking** with visual indicators
- **Top volunteers leaderboard**
- **Comprehensive reporting** system
- **Excel export** for annual summaries

### 📧 **Communication**
- **Automated email notifications** for registrations and approvals
- **Event reminder system** with scheduled emails
- **Welcome emails** for new users
- **Certificate generation notifications**

## 🚀 Technology Stack

### **Backend**
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Nodemailer** for email services
- **PDFKit** for certificate generation
- **Cloudinary** for image storage

### **Frontend**
- **React** with Vite build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Toastify** for notifications
- **React Icons** for UI icons

## 📁 Project Structure

```
nss-portal/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── api/           # API configuration
│   │   └── assets/        # Static assets
├── server/                # Backend Node.js application
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
├── .env                  # Environment variables
└── package.json          # Project dependencies
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Gmail account (for email services)

### **1. Clone Repository**
```bash
git clone <repository-url>
cd nss-portal
```

### **2. Install Dependencies**
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### **3. Environment Configuration**
Create `.env` file in root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### **4. Start Application**
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
# Backend: npm run server
# Frontend: npm run client
```

### **5. Access Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 👤 User Roles & Permissions

### **🔧 Admin**
- Full system access
- User management
- Event creation and management
- Participation approval
- Final certificate generation
- System analytics and reports

### **👨‍🏫 Faculty**
- Event creation and management
- Student management
- Participation approval
- Event certificates generation
- Analytics access

### **🎓 Student**
- Event registration
- Participation report submission
- Progress tracking
- Certificate downloads
- Profile management

## 📋 Key Workflows

### **Event Participation Workflow**
1. **Admin/Faculty** creates event
2. **Student** registers for event
3. **Event** takes place
4. **Student** submits participation report with photos
5. **Admin/Faculty** reviews and approves participation
6. **System** generates individual event certificate
7. **Student** downloads certificate

### **Final Certificate Workflow**
1. **Student** completes 60+ hours of service
2. **Admin** reviews student performance
3. **Admin** marks student as eligible with performance rating
4. **Admin** generates final completion certificate
5. **System** tracks certificate generation
6. **Student** receives recognition for completion

## 🎨 Design Features

### **Visual Theme**
- **NSS Colors**: Orange and Green branding
- **Service-themed backgrounds** with university imagery
- **Modern glassmorphism** design elements
- **Responsive design** for all devices
- **Professional certificate** layouts

### **User Experience**
- **Intuitive navigation** with role-based menus
- **Real-time notifications** for all actions
- **Progress indicators** for student achievements
- **Visual feedback** for all interactions
- **Clean, professional interface**

## 📊 Database Schema

### **User Model**
- Personal information and credentials
- Role and permissions
- Hours tracking and performance
- Certificate management fields

### **Event Model**
- Event details and metadata
- Status and scheduling
- Coordinator and faculty assignments
- Image and venue information

### **Participation Model**
- Student-event relationships
- Report submissions and approvals
- Hours contributed tracking
- Certificate generation status

## 🔐 Security Features

- **JWT-based authentication**
- **Password hashing** with bcrypt
- **Role-based access control**
- **Input validation** and sanitization
- **Secure file uploads**
- **Certificate verification** with unique IDs

## 📧 Email Integration

- **Welcome emails** for new registrations
- **Event reminders** sent automatically
- **Participation notifications** for approvals
- **Certificate generation** confirmations
- **Customizable email templates**

## 🏆 Certificate System

### **Individual Event Certificates**
- Generated automatically upon participation approval
- Professional NSS-themed design
- Event details and student information
- Unique certificate ID for verification

### **Final Completion Certificates**
- Admin-controlled generation for 60+ hour students
- Performance-based recognition
- Comprehensive achievement summary
- Official university signatures

## 📈 Analytics & Reporting

- **Real-time dashboard** statistics
- **Student progress** tracking
- **Event participation** metrics
- **Top performers** leaderboard
- **Excel export** capabilities
- **Annual summary** reports

## 🚀 Deployment

### **Production Setup**
1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set up production email service
4. Configure Cloudinary for production
5. Build frontend: `cd client && npm run build`
6. Deploy to hosting service (Heroku, AWS, etc.)

## 🆘 Support & Maintenance

### **Common Issues**
- Check environment variables configuration
- Verify database connection
- Ensure Cloudinary credentials are correct
- Check email service configuration

### **Monitoring**
- Application logs for error tracking
- Database performance monitoring
- Email delivery status
- Certificate generation tracking

## 📝 License

This project is developed for Vignan University's National Service Scheme unit.

## 🤝 Contributing

For contributions and improvements:
1. Follow existing code structure
2. Maintain consistent styling
3. Add appropriate error handling
4. Update documentation as needed

---

**"Not Me, But You" - NSS Motto**

*Empowering students through community service and social responsibility.*