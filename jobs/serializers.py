from rest_framework import serializers
from .models import Job, Company, CandidateProfile, Application


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


class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['user'] = instance.user
        return super().update(instance, validated_data)


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'job', 'candidate', 'cover_letter', 'created_at']
        read_only_fields = ['id', 'candidate', 'created_at']


class MyApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(
        source='job.company.name', read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'company_name', 'created_at']
        read_only_fields = fields
