from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class CandidateProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='candidate_profile')
    skills = models.JSONField(default=list, blank=True)
    experience_range = models.CharField(
        max_length=20,
        choices=[
            ('lt1', '< 1 year'),
            ('1_2', '1–2 years'),
            ('2_3', '2–3 years'),
            ('3_5', '3–5 years'),
            ('5_8', '5–8 years'),
            ('8plus', '8+ years'),
        ],
        blank=True,
        default=''
    )
    salary_expectation = models.IntegerField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    english_level = models.CharField(max_length=20, choices=[
        ('A1', 'A1'),
        ('A2', 'A2'),
        ('B1', 'B1'),
        ('B2', 'B2'),
        ('C1', 'C1'),
        ('C2', 'C2')
    ], blank=True)
    bio = models.TextField(blank=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Candidate Profile'
        verbose_name_plural = 'Candidate Profiles'

    def __str__(self):
        return f"{self.user.username} - Candidate"


class Company(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='logos/', blank=True)

    def __str__(self):
        return self.name


class Job(models.Model):
    title = models.CharField(max_length=200)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    description = models.TextField()
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    skills = models.TextField()  # "Python, Django, SQL"
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} @ {self.company.name}"
