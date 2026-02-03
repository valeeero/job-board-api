from rest_framework import serializers
from .models import Job, Company, CandidateProfile


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
        """Автоматически ставим user из request.user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Для update тоже"""
        validated_data['user'] = instance.user
        return super().update(instance, validated_data)
