from rest_framework import viewsets, permissions, status, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from drf_spectacular.utils import extend_schema
from .models import Job, CandidateProfile, Application
from .serializers import JobSerializer, CandidateProfileSerializer, ApplicationSerializer, MyApplicationSerializer


def job_list(request):
    """HTML view: render jobs list."""
    jobs = Job.objects.filter(is_active=True).select_related('company')
    return render(request, 'jobs/jobs.html', {'jobs': jobs})


class JobPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class JobViewSet(viewsets.ModelViewSet):
    """API: CRUD for Job model with search/filter."""
    queryset = Job.objects.filter(is_active=True).select_related('company')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = JobPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']

    def get_queryset(self):
        """Search + filter by title, location, salary."""
        queryset = super().get_queryset()
        params = self.request.query_params

        if title := params.get('title'):
            queryset = queryset.filter(title__icontains=title)
        if location := params.get('location'):
            queryset = queryset.filter(location__icontains=location)
        if min_salary := params.get('min_salary'):
            queryset = queryset.filter(salary_min__gte=min_salary)
        if max_salary := params.get('max_salary'):
            queryset = queryset.filter(salary_max__lte=max_salary)

        return queryset


class CandidateProfileViewSet(viewsets.GenericViewSet):
    """API: Candidate profile management."""
    queryset = CandidateProfile.objects.all()
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """GET/PUT/PATCH /api/profile/me/ — current user profile."""
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        if request.method == 'GET':
            serializer = CandidateProfileSerializer(profile)
            return Response(serializer.data)

        # PUT/PATCH
        serializer = CandidateProfileSerializer(
            profile,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplyView(APIView):
    """POST /api/jobs/<id>/apply/ — apply to job."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ApplicationSerializer,
        responses={201: ApplicationSerializer, 400: {
            'description': 'Already applied'}},
        description="Apply to a job. Creates an application record."
    )

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)
        candidate, _ = CandidateProfile.objects.get_or_create(
            user=request.user)

        application, created = Application.objects.get_or_create(
            job=job,
            candidate=candidate,
            defaults={'cover_letter': request.data.get('cover_letter', '')},
        )

        if not created:
            return Response(
                {'detail': 'Already applied'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyApplicationsView(APIView):
    """GET /api/my_applications/ — list user applications."""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: MyApplicationSerializer(many=True)},
        description="Get all applications for current user."
    )

    def get(self, request):
        candidate = CandidateProfile.objects.filter(user=request.user).first()
        if not candidate:
            return Response({'results': []})

        qs = Application.objects.filter(
            candidate=candidate).select_related('job__company')
        serializer = MyApplicationSerializer(qs, many=True)
        return Response({'results': serializer.data})
