from rest_framework import serializers
from .models import Job, Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'location']

class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True
    )

    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'company_id', 'description', 
                  'salary_min', 'salary_max', 'skills', 'location', 
                  'created_at', 'is_active']
        read_only_fields = ['created_at']
