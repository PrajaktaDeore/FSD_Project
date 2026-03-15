# FSD Project (Milky Basket / Milkman)

Full-stack web application for managing a dairy/milk delivery business. The project includes:

- `backend/`: Django + Django REST Framework API (SQLite by default)
- `frontend/`: React (Vite) admin panel + customer panel

## Features

### Admin / Staff
- Staff authentication (token-based; stored in `localStorage` on the frontend)
- Staff management (CRUD)
- Customer management (CRUD + customer register/login APIs)
- Category management (CRUD)
- Product management (CRUD + public product listing)
- Subscription management (CRUD)

### Customer Panel
- Browse products and categories
- Add to cart / wishlist (client-side persistence)
- Place and review orders (client-side persistence)
- Manage subscriptions (uses backend subscription APIs)

## Technologies Used

### Frontend
- React (Vite)
- React Router (`HashRouter` + protected routes)
- Axios (API calls + token handling)
- Bootstrap 5 + Font Awesome (UI styling)

### Backend
- Python + Django
- Django REST Framework (API endpoints)
- `django-cors-headers` (CORS for the React frontend)
- SQLite (development database: `backend/db.sqlite3`)

## Installation & Setup

### Backend (Python / Django)

1. Go to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows (PowerShell)
   .\\.venv\\Scripts\\Activate.ps1
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000`.

### Frontend (React / Vite)

1. Open a new terminal and go to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

Vite will print the local URL (commonly `http://localhost:5173`).

## Production (Ubuntu + nginx + gunicorn)

This repo supports deployments where nginx serves the built React app and proxies Django under `/api/`.

### Backend environment

- Copy `backend/.env.example` and set values for production (at minimum `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_DEBUG=0`).
- Run Django behind gunicorn (example):
  ```bash
  cd backend
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  python manage.py migrate
  gunicorn milkman.wsgi:application --bind 127.0.0.1:8000
  ```

### Frontend environment + build

Vite env vars are applied at build time:

- Copy `frontend/.env.production.example` to `frontend/.env.production`
- Build:
  ```bash
  cd frontend
  npm ci
  npm run build
  ```

### nginx routing (summary)

- Serve the SPA from `frontend/dist`
- Proxy Django API under `/api/`

## Notes

- Protected staff APIs expect an `Authorization` header like: `Token <token>`.
- A Postman collection is available at `backend/staff.postman_collection.json`.
