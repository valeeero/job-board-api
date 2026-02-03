from rest_framework import viewsets, permissions, status, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import render
from .models import Job, CandidateProfile
from .serializers import JobSerializer, CandidateProfileSerializer


def job_list(request):
    jobs = Job.objects.filter(is_active=True).select_related('company')
    return render(request, 'jobs/jobs.html', {'jobs': jobs})


class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True).select_related('company')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # 🔹 pagination + ordering
    pagination_class = JobPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']

    def get_queryset(self):
        """Search + filter by title, location, salary."""
        queryset = Job.objects.filter(is_active=True).select_related('company')

        params = self.request.query_params
        title = params.get('title')
        location = params.get('location')
        min_salary = params.get('min_salary')
        max_salary = params.get('max_salary')

        if title:
            queryset = queryset.filter(title__icontains=title)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if min_salary:
            queryset = queryset.filter(salary_min__gte=min_salary)
        if max_salary:
            queryset = queryset.filter(salary_max__lte=max_salary)

        return queryset

    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        """🔒 Protected: User profile + stats"""
        user = request.user

        return Response({
            'status': 'success',
            'is_authenticated': user.is_authenticated,
            'user_id': user.id if user.is_authenticated else None,
            'username': user.username if user.is_authenticated else 'Anonymous',
            'user_email': getattr(user, 'email', 'No email') if user.is_authenticated else None,
            'total_jobs': Job.objects.count(),
            'active_jobs': Job.objects.filter(is_active=True).count(),
        })

    @action(detail=False, methods=['get'])
    def debug_auth(self, request):
        return Response({
            'user': request.user.username,
            'is_authenticated': request.user.is_authenticated,
            'headers': dict(list(request.headers.items())[:5]),
        })


class CandidateProfileViewSet(viewsets.ModelViewSet):
    queryset = CandidateProfile.objects.all()
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CandidateProfile.objects.filter(user=self.request.user)

    def get_object(self):
        profile, created = CandidateProfile.objects.get_or_create(
            user=self.request.user)
        return profile
