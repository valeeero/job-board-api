# Job Board API 🚀

A production-ready Django REST API for job listings. Full CRUD, search, PostgreSQL + Docker. Portfolio project built in 3 hours.

## ✨ Features

- **Full CRUD** for Jobs & Companies
- **Search & Filter** by title, location (`?title=Python&location=Kyiv`)
- **Django Admin** with custom filters
- **PostgreSQL** + **Docker Compose**
- **DRF ViewSets** + Serializers
- **Responsive API** (browsable interface)

## 📱 Live Demo

...


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
