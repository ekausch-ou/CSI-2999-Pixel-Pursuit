from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

# Email for user registration
@receiver(post_save, sender=User) # On new User
def send_welcome_email(sender, instance, created, **kwargs):
    if created:
        send_mail(
            subject="Welcome to Pixel Pursuit",
            message=(
                f"Hi {instance.username},\n\n"
                "Welcome to Pixel Pursuit!\n"
                "We're excited to have you on board.\n\n"
                "Happy gaming!\n"
                "- Pixel Pursuit Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
            fail_silently=False,
        )
