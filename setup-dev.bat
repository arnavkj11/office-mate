@echo off
REM Office Mate Development Setup Script for Windows

echo 🚀 Setting up Office Mate development environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create environment file for backend if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating backend environment file...
    copy "backend\.env.example" "backend\.env"
    echo ✅ Created backend/.env from template
)

REM Build and start development environment
echo 🔨 Building and starting development environment...
docker-compose -f docker-compose.dev.yml up --build -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 0 (
    echo ✅ Backend is running at http://localhost:8000
    echo 📚 API documentation available at http://localhost:8000/docs
) else (
    echo ❌ Backend is not responding
)

curl -f http://localhost:3000 >nul 2>&1
if errorlevel 0 (
    echo ✅ Frontend is running at http://localhost:3000
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 🎉 Office Mate development environment is ready!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo 🗄️  Database: localhost:5432 (user: user, password: password, db: officemate)
echo.
echo To stop the environment: docker-compose -f docker-compose.dev.yml down
echo To view logs: docker-compose -f docker-compose.dev.yml logs -f

pause
