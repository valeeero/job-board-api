from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import render
from .models import Job
from .serializers import JobSerializer


def job_list(request):
    jobs = Job.objects.filter(is_active=True).select_related('company')
    return render(request, 'jobs/jobs.html', {'jobs': jobs})


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True).select_related('company')
    serializer_class = JobSerializer
    # read=все, write=JWT
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Search + filter"""
        queryset = Job.objects.filter(is_active=True).select_related('company')
        title = self.request.query_params.get('title')
        location = self.request.query_params.get('location')
        if title:
            queryset = queryset.filter(title__icontains=title)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset.order_by('-created_at')

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
            'headers': dict(request.headers.items()[:5]),
        })
