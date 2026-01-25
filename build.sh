#!/usr/bin/env bash
set -o errexit

# Install Python deps
pip install -r requirements.txt

# Run migrations
python manage.py migrate --no-input

# Collect static
python manage.py collectstatic --no-input --clear

# Populate test data
python manage.py shell -c "
from jobs.models import Company, Job
Company.objects.get_or_create(name='Google', location='Kyiv')
Company.objects.get_or_create(name='EPAM', location='Lviv')
print('Test data ready!')
"
