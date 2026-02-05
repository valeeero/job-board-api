from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'jobs', views.JobViewSet, basename='job')
router.register(r'profile', views.CandidateProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),  # /api/jobs/, /api/profile/
    path('jobs/<int:job_id>/apply/', views.ApplyView.as_view(), name='job-apply'),
    path('my_applications/', views.MyApplicationsView.as_view(),
         name='my-applications'),
]
