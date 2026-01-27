from django.core.management.commands import createsuperuser
from django.core import management

class Command(createsuperuser.Command):
    help = "Auto-create superuser if not exists"

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--username', default='admin')
        parser.add_argument('--email', default='admin@example.com')

    def handle(self, *args, **options):
        if not self.UserModel().objects.filter(username=options['username']).exists():
            super().handle(*args, **options)
            self.stdout.write(
                self.style.SUCCESS(f'Superuser created: {options["username"]}')
            )
        else:
            self.stdout.write('Superuser already exists')
