from django.contrib import admin

from .models import Application, CandidateProfile, Company, Job


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'location']
    search_fields = ['name', 'location']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'is_active', 'created_at']
    list_filter = ['is_active', 'company', 'created_at']
    search_fields = ['title', 'skills', 'description']
    raw_id_fields = ['company']
    date_hierarchy = 'created_at'
    list_editable = ['is_active']


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'location',
                    'experience_range', 'english_level', 'created_at']
    search_fields = ['user__username', 'user__email', 'location']
    list_filter = ['experience_range', 'english_level', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['get_candidate_name', 'job', 'created_at']
    list_filter = ['created_at']
    search_fields = ['candidate__user__username',
                     'candidate__user__email', 'job__title']
    raw_id_fields = ['candidate', 'job']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

    def get_candidate_name(self, obj):
        return obj.candidate.user.username if obj.candidate else 'N/A'
    get_candidate_name.short_description = 'Candidate'
    get_candidate_name.admin_order_field = 'candidate__user__username'
