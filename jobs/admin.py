from django.contrib import admin
from .models import Company, Job, CandidateProfile, Application


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'location']
    search_fields = ['name']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'created_at', 'is_active']
    list_filter = ['company', 'is_active', 'created_at']
    search_fields = ['title', 'skills']
    raw_id_fields = ['company']


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'experience_range', 'created_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('experience_range', 'english_level')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'job', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('candidate__user__username', 'job__title')
