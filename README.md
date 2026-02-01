# **Job Board API** 🚀

**Production Django DRF + JWT Auth MVP**

[
[
[

## **✨ Features**

```
✅ JWT Authentication: Login → Bearer token → Protected API
✅ Responsive Frontend: Bootstrap + localStorage + Profile
✅ Swagger OpenAPI: Interactive docs + Bearer auth
✅ Search/Filter: ?title=Python&location=Remote
✅ Production: Render + PostgreSQL
✅ Local Dev: Docker Postgres
```

## **🎮 Live Demo**

```
🌐 Frontend: https://job-board-api-kajq.onrender.com
📋 API Docs: https://job-board-api-kajq.onrender.com/api/docs/
🧪 Test: admin / admin123
```

**Demo Flow**:

1. **🔐 Login** → Token saved in localStorage
2. **👤 My Jobs** → Username + Stats (protected)
3. **🚪 Logout** → Clear token

## **📁 Project Structure**

```
job_board/                 # Django project root
├── config/               # Django settings
│   └── settings/
├── jobs/                 # Main app
│   ├── migrations/
│   ├── templates/jobs/   # Frontend HTML
│   ├── tests.py          # pytest
│   ├── models.py         # Job + Company
│   ├── views.py          # DRF ViewSet
│   └── serializers.py
├── docker-compose.yml    # Postgres dev
├── requirements.txt
└── manage.py
```

## **🚀 Quick Start**

### **Local Development**

```bash
git clone https://github.com/valeeero/job-board-api.git
cd job_board

# Start Postgres
docker-compose up -d

# Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # admin/admin123
python manage.py runserver
```

**Open**:

- `http://localhost:8000` → Frontend
- `http://localhost:8000/api/docs/` → Swagger

### **Production**

```
✅ Render: GitHub → Auto-deploy (main branch)
✅ Database: Managed PostgreSQL
✅ HTTPS: Automatic SSL
```

## **🌐 API Endpoints**

```
📋 GET  /api/jobs/?title=Python → Job list + search
👤 GET  /api/jobs/my_jobs/ → Profile + stats (Bearer required)
🔐 POST /api/auth/ → {"username": "admin", "password": "admin123"}
🔄 POST /api/auth/refresh/ → Token refresh
📄 GET  /api/docs/ → Swagger UI
```

## **🧪 Testing**

```bash
pytest jobs/tests.py
```

## **📊 Deployment Status**

| Feature          | Local | Render |
| ---------------- | ----- | ------ |
| JWT Auth Cycle   | ✅    | ✅     |
| Frontend Profile | ✅    | ✅     |
| Swagger Bearer   | ✅    | ✅     |
| Job Search       | ✅    | ✅     |
| Docker Postgres  | ✅    | N/A    |

## **📈 Roadmap**

```
✅ MVP: Auth + Jobs + Profile
⏳ Owner companies (user → jobs)
⏳ Job applications
⏳ Redis cache + rate limit
```

## **💼 Skills Demonstrated**

```
• Django 5 + DRF ViewSets
• SimpleJWT: Full auth cycle
• Swagger (drf-spectacular)
• Bootstrap 5 + Vanilla JS
• Docker + Render deploy
• PostgreSQL production
```

---

⭐ **Star if useful** | 👨‍💻 **Fork & deploy** | 💬 **Issues welcome**

```
# Portfolio → Interview ready
# Junior Django/DRF → Remote OK
# Made by @valeeero
```

---
