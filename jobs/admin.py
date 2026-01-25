from django.contrib import admin
from .models import Company, Job

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'location']
    search_fields = ['name']

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'created_at', 'is_active']
    list_filter = ['company', 'is_active', 'created_at']
    search_fields = ['title', 'skills']
    raw_id_fields = ['company']  # Для больших списков
