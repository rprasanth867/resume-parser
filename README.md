# Resume Parser Application - Setup Guide

## 🚀 Complete Full-Stack Resume Parser with ATS Scoring

A production-ready resume parser application with:
- **Backend**: Flask + MySQL 8 + spaCy NLP
- **Frontend**: React + Material-UI
- **Features**: Resume parsing, JD-based ATS scoring, feedback generation

---

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- Git

---

## 🛠️ Installation & Setup

### Option 1: Using Docker (Recommended)

```bash
# Clone or navigate to project directory
cd resume-parser

# Start all services
docker-compose up -d

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env file
cp .env.example .env

# Edit .env and configure your MySQL database
# DATABASE_URL=mysql+pymysql://resume_user:resume_pass@localhost:3306/resume_parser

# Create MySQL database
mysql -u root -p
CREATE DATABASE resume_parser;
CREATE USER 'resume_user'@'localhost' IDENTIFIED BY 'resume_pass';
GRANT ALL PRIVILEGES ON resume_parser.* TO 'resume_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Run the backend
python run.py
```

Backend will run on `http://localhost:5000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The default configuration should work:
# VITE_API_BASE_URL=http://localhost:5000/api/v1

# Run the frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🗄️ Database Schema

The application uses MySQL 8 with the following tables:

1. **users** - User authentication and profiles
2. **resumes** - Uploaded resume files and metadata
3. **analysis_results** - Resume analysis, scores, and feedback
4. **job_descriptions** - Job descriptions for ATS matching
5. **resume_matches** - ATS match results between resumes and JDs

---

## 🎯 Features

### Core Features
- ✅ User registration and authentication (JWT)
- ✅ Resume upload (PDF, DOCX)
- ✅ Automatic text extraction
- ✅ NLP-based information extraction (skills, experience, education)
- ✅ Resume scoring (overall, formatting, content, keywords)
- ✅ Detailed feedback (strengths, weaknesses, suggestions)
- ✅ Upload history management

### ATS Features
- ✅ Job description creation
- ✅ Resume-JD matching
- ✅ Skills gap analysis
- ✅ Match scoring (overall, skills, experience, education)
- ✅ Personalized recommendations

---

## 📱 Application Flow

1. **Register/Login** → Create account or sign in
2. **Upload Resume** → Drag & drop PDF/DOCX file
3. **View Analysis** → See scores, extracted data, and feedback
4. **Create Job Description** → Add JD with required skills
5. **Match Resume to JD** → Get ATS score and recommendations
6. **View Match Results** → See detailed matching analysis

---

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Resumes
- `POST /api/v1/resumes/upload` - Upload resume
- `GET /api/v1/resumes/{id}/analysis` - Get resume analysis
- `GET /api/v1/resumes` - List all resumes
- `DELETE /api/v1/resumes/{id}` - Delete resume
- `GET /api/v1/resumes/{id}/download` - Download resume

### Job Descriptions
- `POST /api/v1/job-descriptions` - Create JD
- `GET /api/v1/job-descriptions` - List all JDs
- `GET /api/v1/job-descriptions/{id}` - Get specific JD
- `POST /api/v1/job-descriptions/{jd_id}/match/{resume_id}` - Match resume to JD
- `GET /api/v1/job-descriptions/matches` - Get all matches
- `DELETE /api/v1/job-descriptions/{id}` - Delete JD

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile

---

## 🧪 Testing

### Test the Backend

```bash
cd backend

# Test registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Test login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test the Frontend

1. Open `http://localhost:3000`
2. Register a new account
3. Upload a sample resume
4. View the analysis results
5. Create a job description
6. Match your resume to the JD

---

## 📊 Technology Stack

### Backend
- **Framework**: Flask 3.0
- **Database**: MySQL 8.0 with SQLAlchemy ORM
- **Authentication**: JWT (Flask-JWT-Extended)
- **NLP**: spaCy for text analysis
- **ML**: scikit-learn for TF-IDF similarity
- **File Processing**: PyPDF2, pdfplumber, python-docx

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **File Upload**: React Dropzone

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Token refresh mechanism
- CORS protection
- File type validation
- File size limits
- SQL injection prevention (ORM)
- XSS protection

---

## 📈 Scoring Algorithm

### Resume Scoring
- **Overall Score** = Formatting (30%) + Content (50%) + Keywords (20%)
- **Formatting Score**: Based on structure and sections
- **Content Score**: Based on completeness and quality
- **Keyword Score**: Based on relevant skills

### ATS Matching
- **Overall Match** = Skills (40%) + Experience (25%) + Education (15%) + Text Similarity (20%)
- **Skills Match**: Required vs. present skills
- **Experience Match**: Years and relevance
- **Education Match**: Degree level comparison
- **Text Similarity**: TF-IDF cosine similarity

---

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - Set strong SECRET_KEY and JWT_SECRET_KEY
   - Configure production DATABASE_URL
   - Set FLASK_ENV=production

2. **Database**
   - Use managed MySQL service (AWS RDS, etc.)
   - Enable SSL connections
   - Set up automated backups

3. **File Storage**
   - Use S3 or similar for file storage
   - Configure CDN for static assets

4. **Security**
   - Enable HTTPS
   - Set up rate limiting
   - Configure firewall rules
   - Enable CORS for specific domains only

5. **Monitoring**
   - Set up application logging
   - Configure error tracking (Sentry)
   - Monitor database performance

---

## 🐛 Troubleshooting

### Backend Issues

**spaCy model not found**
```bash
python -m spacy download en_core_web_sm
```

**MySQL connection error**
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in .env file
- Ensure database exists

**Import errors**
- Activate virtual environment
- Reinstall requirements: `pip install -r requirements.txt`

### Frontend Issues

**Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API connection error**
- Check backend is running on port 5000
- Verify VITE_API_BASE_URL in .env

---

## 📝 Sample Data

### Sample Job Description

```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced full stack developer...",
  "required_skills": ["Python", "React", "MySQL", "AWS", "Docker"],
  "preferred_skills": ["Kubernetes", "Redis", "GraphQL"],
  "experience_required": "5+ years",
  "education_required": "Bachelor's degree in Computer Science"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🆘 Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Check backend logs: `backend/logs/`
4. Check browser console for frontend errors

---

## 🎉 Next Steps

After setup, you can:
1. Customize the NLP analysis in `backend/app/services/nlp_analyzer.py`
2. Adjust scoring algorithms in `backend/app/services/feedback_generator.py`
3. Modify ATS matching logic in `backend/app/services/ats_scorer.py`
4. Enhance UI in frontend pages
5. Add more features like:
   - Resume templates
   - Export to PDF
   - Email notifications
   - Team collaboration
   - Analytics dashboard

---

**Happy Resume Parsing! 🎯**
