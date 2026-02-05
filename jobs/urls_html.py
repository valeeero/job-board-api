from django.urls import path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('', views.job_list, name='job_list'),
    path('profile/', TemplateView.as_view(template_name='profile/profile.html'), name='profile'),
]
