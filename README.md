# Office Mate

A modern office management application built with FastAPI (Python) backend and React + Vite frontend.

## Project Structure

```
office-mate/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend Docker configuration
│   ├── test_main.py        # API tests
│   └── .env.example        # Environment variables template
├── frontend/               # React + Vite frontend
│   ├── src/                # Source code
│   │   ├── App.jsx         # Main React component
│   │   ├── main.jsx        # React entry point
│   │   ├── index.css       # Global styles
│   │   └── App.css         # Component styles
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── Dockerfile          # Production frontend Docker config
│   ├── Dockerfile.dev      # Development frontend Docker config
│   └── nginx.conf          # Nginx configuration
├── docker-compose.yml      # Production Docker Compose
├── docker-compose.dev.yml  # Development Docker Compose
└── README.md              # This file
```

## Features

- **Backend (FastAPI)**:

  - RESTful API with automatic documentation
  - User management endpoints
  - CORS configuration for frontend integration
  - PostgreSQL database integration ready
  - Comprehensive test suite

- **Frontend (React + Vite)**:
  - Modern React with hooks
  - React Router for navigation
  - Axios for API communication
  - Responsive design with CSS Grid/Flexbox
  - Dark/Light theme support

## Quick Start

### Using Docker (Recommended)

1. **Development Environment**:

   ```bash
   # Start all services in development mode
   docker-compose -f docker-compose.dev.yml up --build

   # Access the application:
   # Frontend: http://localhost:3000
   # Backend API: http://localhost:8000
   # API Docs: http://localhost:8000/docs
   ```

2. **Production Environment**:

   ```bash
   # Start all services in production mode
   docker-compose up --build

   # Access the application:
   # Frontend: http://localhost
   # Backend API: http://localhost:8000
   ```

### Local Development

#### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Create virtual environment:

   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:

   ```bash
   copy .env.example .env  # Windows
   # cp .env.example .env  # Linux/Mac
   ```

5. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/{user_id}` - Get user by ID
- `DELETE /api/users/{user_id}` - Delete user

## Database

The application uses PostgreSQL as the database. In development, it runs in a Docker container. For production, you may want to use a managed database service.

### Database Schema

Currently using in-memory storage for simplicity. To add PostgreSQL:

1. Update the database connection in `backend/main.py`
2. Add SQLAlchemy models
3. Set up Alembic migrations

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Deployment

### Using Docker

1. Build and push images to a container registry
2. Update `docker-compose.yml` with production configurations
3. Deploy using Docker Compose or orchestration tools like Kubernetes

### Environment Variables

Backend environment variables (`.env`):

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `DEBUG` - Debug mode (True/False)

Frontend environment variables:

- `VITE_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
