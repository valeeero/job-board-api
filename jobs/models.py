from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class CandidateProfile(models.Model):
    """Profile for job candidates with skills and preferences."""

    EXPERIENCE_CHOICES = [
        ('lt1', '< 1 year'),
        ('1_2', '1–2 years'),
        ('2_3', '2–3 years'),
        ('3_5', '3–5 years'),
        ('5_8', '5–8 years'),
        ('8plus', '8+ years'),
    ]

    ENGLISH_LEVEL_CHOICES = [
        ('A1', 'A1'),
        ('A2', 'A2'),
        ('B1', 'B1'),
        ('B2', 'B2'),
        ('C1', 'C1'),
        ('C2', 'C2'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='candidate_profile'
    )
    skills = models.JSONField(default=list, blank=True)
    experience_range = models.CharField(
        max_length=20,
        choices=EXPERIENCE_CHOICES,
        blank=True,
        default=''
    )
    salary_expectation = models.IntegerField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    english_level = models.CharField(
        max_length=20,
        choices=ENGLISH_LEVEL_CHOICES,
        blank=True
    )
    bio = models.TextField(blank=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Candidate Profile'
        verbose_name_plural = 'Candidate Profiles'

    def __str__(self):
        return f"{self.user.username} - Candidate"


class Company(models.Model):
    """Company that posts job listings."""

    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='logos/', blank=True)

    class Meta:
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name


class Job(models.Model):
    """Job posting by a company."""

    title = models.CharField(max_length=200)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    description = models.TextField()
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    skills = models.TextField(
        help_text="Comma-separated skills (e.g., Python, Django, SQL)")
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} @ {self.company.name}"


class Application(models.Model):
    """Job application from a candidate to a job."""

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='applications',
        null=True,
        blank=True
    )
    cover_letter = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'candidate')
        ordering = ['-created_at']

    def __str__(self):
        candidate_name = self.candidate.user.username if self.candidate else 'Unknown'
        return f"{candidate_name} → {self.job.title}"
