.PHONY: help install pipeline test backend frontend up down clean

help:
	@echo "AtlasEstate 3D - Management Commands:"
	@echo "  make install    Install Python and Node dependencies"
	@echo "  make pipeline   Execute data ingestion, validation, and ML training"
	@echo "  make test       Run automated backend and data tests"
	@echo "  make backend    Launch FastAPI backend server"
	@echo "  make frontend   Launch React + Vite development server"
	@echo "  make up         Start Docker Compose stack"
	@echo "  make down       Stop Docker Compose stack"

install:
	pip install -r requirements.txt
	cd frontend && npm install

pipeline:
	python -m backend.app.services.pipeline

test:
	pytest backend/tests -v --durations=10

backend:
	uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev

up:
	docker compose up -d

down:
	docker compose down

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
