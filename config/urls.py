from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.generic import TemplateView
from jobs.views import JobViewSet, job_list, CandidateProfileViewSet, ApplyView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet)
router.register(r'profile', CandidateProfileViewSet, basename='profile')


urlpatterns = [
    path('', job_list, name='job_list'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/jobs/<int:job_id>/apply/', ApplyView.as_view(), name='job-apply'),

    path('profile/', TemplateView.as_view(template_name='profile/profile.html')),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'),
         name='swagger-ui'),

    path('api/auth/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
