# Job Board API 🚀

A production-ready Django REST API for job listings. Full CRUD, search, PostgreSQL + Docker. Portfolio project built in 3 hours.

## ✨ Features

- **Full CRUD** for Jobs & Companies
- **Search & Filter** by title, location (`?title=Python&location=Kyiv`)
- **Django Admin** with custom filters
- **PostgreSQL** + **Docker Compose**
- **DRF ViewSets** + Serializers
- **Responsive API** (browsable interface)

## ✨ Live Demo

| Feature | URL |
|---------|-----|
| **Frontend** | https://job-board-api-kajq.onrender.com |
| **API Docs** | https://job-board-api-kajq.onrender.com/api/jobs/ |
| **Admin** | https://job-board-api-kajq.onrender.com/admin/ (admin/admin_admin123) |

## 🛠️ Tech Stack

Backend: Django REST Framework + PostgreSQL
Frontend: Bootstrap 5
Deploy: Render + Docker
Tests: pytest (3/3 passed)

## 🛠 Quick Start

```bash
# Clone & Setup
git clone https://github.com/valeeero/job-board-api.git
cd job-board-api
python -m venv venv && source venv/bin/activate  # Mac/Linux

# Docker Postgres
docker compose up -d db

# Python deps
pip install -r requirements.txt

# Migrate & Run
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

## 🧪 Tests
```bash
python manage.py test jobs.tests -v 2
# 3 passed in 0.1s ✅
