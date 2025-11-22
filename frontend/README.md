# Frontend README

## React Resume Parser UI

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run development server
npm run dev
```

### Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── auth/
│   │       └── ProtectedRoute.jsx
│   ├── context/             # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/               # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── UploadPage.jsx
│   │   ├── AnalysisPage.jsx
│   │   ├── HistoryPage.jsx
│   │   ├── JobDescriptionsPage.jsx
│   │   └── MatchResultsPage.jsx
│   ├── services/            # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── resumeService.js
│   │   └── jobDescriptionService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000/api/v1)
