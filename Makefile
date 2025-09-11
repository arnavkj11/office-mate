# Makefile for Office Mate project

.PHONY: help install-dev start-dev stop-dev build-prod start-prod stop-prod clean test lint

help: ## Show this help message
	@echo "Office Mate Project Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-dev: ## Install development dependencies
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

start-dev: ## Start development environment with Docker
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build -d
	@echo "Services starting... Backend: http://localhost:8000, Frontend: http://localhost:3000"

stop-dev: ## Stop development environment
	@echo "Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

build-prod: ## Build production images
	@echo "Building production images..."
	docker-compose build

start-prod: ## Start production environment
	@echo "Starting production environment..."
	docker-compose up -d
	@echo "Production environment started at http://localhost"

stop-prod: ## Stop production environment
	@echo "Stopping production environment..."
	docker-compose down

clean: ## Clean up Docker resources
	@echo "Cleaning up Docker resources..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	docker system prune -f

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd backend && python -m pytest

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd frontend && npm test

lint-backend: ## Lint backend code
	@echo "Linting backend code..."
	cd backend && python -m flake8 .

lint-frontend: ## Lint frontend code
	@echo "Linting frontend code..."
	cd frontend && npm run lint

logs-dev: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

logs-prod: ## Show production logs
	docker-compose logs -f

shell-backend: ## Open shell in backend container
	docker-compose -f docker-compose.dev.yml exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker-compose -f docker-compose.dev.yml exec frontend /bin/sh

backup-db: ## Backup database
	docker-compose exec db pg_dump -U user officemate > backup_$(date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database (requires BACKUP_FILE variable)
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Please specify BACKUP_FILE=filename.sql"; exit 1; fi
	docker-compose exec -T db psql -U user officemate < $(BACKUP_FILE)
