# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SeqUOH is a full-stack genomic platform project with a React frontend and Django REST API backend. The application provides user authentication and genomic data analysis capabilities.

## Architecture

### Frontend (`/frontend`)
- **Framework**: React 19 with Vite for development
- **Routing**: React Router v7 with hash-based routing for landing page sections
- **Styling**: TailwindCSS v4 with custom CSS modules per component
- **Main Structure**:
  - `src/App.jsx`: Main application with dynamic navbar theme switching based on scroll position
  - `src/components/`: Modular components (Hero, Login, Register, Navbar, Descubre)
  - `src/routes/Routes.js`: Route definitions (partially unused, uses inline routing in App.jsx)

### Backend (`/backend/sequoh`)
- **Framework**: Django 5.2.6 with Django REST Framework
- **Database**: SQLite (development)
- **Authentication**: Custom authentication app with DRF views
- **Apps**:
  - `autenticacion`: User authentication and login functionality
  - Main project: `sequoh` (settings, URLs, WSGI/ASGI)

### Key Architectural Patterns
- **Component-based frontend**: Each React component has its own directory with JSX and CSS files
- **Dynamic theme switching**: Navbar automatically changes theme (dark/light) based on scroll position and page sections
- **Modular backend**: Django apps for separation of concerns
- **API-first approach**: Backend designed as REST API for frontend consumption

## Development Commands

### Frontend Development
Navigate to frontend directory first: `cd frontend`

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Run linting**: `npm run lint`
- **Preview production build**: `npm run preview`
- **Install dependencies**: `npm install`

### Backend Development
Navigate to backend directory first: `cd backend`

#### Python Environment Setup
- **Activate virtual environment**: `.\.venv\Scripts\Activate.ps1` (Windows PowerShell) or `.\.venv\Scripts\activate` (Windows Command Prompt)
- **Deactivate virtual environment**: `deactivate`

#### Django Commands (from `/backend/sequoh` directory)
- **Start development server**: `python manage.py runserver`
- **Run migrations**: `python manage.py migrate`
- **Create migrations**: `python manage.py makemigrations`
- **Create superuser**: `python manage.py createsuperuser`
- **Django shell**: `python manage.py shell`
- **Collect static files**: `python manage.py collectstatic`

#### Testing Commands
- **Run tests**: `python manage.py test`
- **Run specific app tests**: `python manage.py test autenticacion`
- **Run with verbose output**: `python manage.py test --verbosity=2`

## Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app with routing and theme logic
│   │   ├── components/      # Reusable components
│   │   │   ├── Hero/       # Landing page hero section
│   │   │   ├── Login/      # Authentication login form
│   │   │   ├── Register/   # User registration form
│   │   │   ├── Navbar/     # Navigation with dynamic theming
│   │   │   └── Descubre/   # Discovery/information section
│   │   └── routes/         # Route definitions (legacy)
│   ├── public/             # Static assets (logos, images)
│   └── package.json        # Dependencies and scripts
└── backend/
    └── sequoh/             # Django project
        ├── manage.py       # Django management script
        ├── autenticacion/  # Authentication app
        │   ├── models.py   # Database models
        │   ├── views.py    # API views
        │   ├── urls.py     # URL routing
        │   └── ...
        └── sequoh/         # Project settings
            ├── settings.py # Django configuration
            ├── urls.py     # Main URL routing
            └── ...
```

## Key Configuration

### Frontend Configuration
- **Vite Config**: Uses React plugin and TailwindCSS integration
- **ESLint**: Configured for React development with hooks support
- **Dependencies**: FontAwesome icons, React Router with hash-link support

### Backend Configuration
- **Django Apps**: `autenticacion`, `rest_framework`, `corsheaders` enabled
- **CORS**: Configured for cross-origin requests from frontend
- **Database**: SQLite for development (see `DATABASES` in settings.py)
- **Static Files**: Standard Django configuration

### Environment Setup
- **Frontend**: Node.js project with npm package management
- **Backend**: Python virtual environment in `/backend/.venv/`

## Development Notes

### Frontend Considerations
- The app uses sophisticated scroll-based theme switching in `App.jsx`
- Navigation uses both standard React Router and hash-based routing
- Components are self-contained with CSS modules
- Login form includes placeholder backend integration (see TODO comments)

### Backend Considerations  
- The `autenticacion` app is set up but views are incomplete
- Django REST Framework is configured but API endpoints need implementation
- CORS is enabled for frontend-backend communication
- SQLite database files exist but schema may need initialization

### Common Workflows
1. **Full-stack development**: Run both frontend (`npm run dev`) and backend (`python manage.py runserver`) simultaneously
2. **Frontend-only development**: Use frontend dev server with mocked backend calls
3. **Backend API development**: Use Django admin and DRF browsable API for testing

### Security Notes
- Django secret key is exposed in settings.py (development only)
- DEBUG mode is enabled (development configuration)
- CORS settings should be configured for production deployment