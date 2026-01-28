from jobs.models import Job, Company
from django.test import TestCase
from django.urls import reverse


class JobTests(TestCase):

    def setUp(self):
        self.company = Company.objects.create(name="Test Company")
        self.job = Job.objects.create(
            title="Test Job",
            company=self.company,
            description="Test desc"
        )

    def test_job_model(self):
        self.assertEqual(self.job.title, "Test Job")

    def test_job_list_view(self):
        response = self.client.get(reverse('job_list'))
        self.assertEqual(response.status_code, 200)

    def test_admin(self):
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 302)
