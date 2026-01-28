from rest_framework import viewsets, permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import render
from .models import Job
from .serializers import JobSerializer


def job_list(request):
    jobs = Job.objects.all()
    return render(request, 'jobs.html', {'jobs': jobs})


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True).select_related('company')
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True).select_related('company')
        title = self.request.query_params.get('title')
        location = self.request.query_params.get('location')
        if title:
            queryset = queryset.filter(title__icontains=title)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset.order_by('-created_at')
