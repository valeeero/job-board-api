from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from jobs.views import JobViewSet, job_list

router = DefaultRouter()
router.register(r'jobs', JobViewSet)

urlpatterns = [
    path('', job_list, name='job_list'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
