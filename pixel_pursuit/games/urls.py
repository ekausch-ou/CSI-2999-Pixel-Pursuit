from django.urls import path
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path("", views.home, name="home"), # Homepage URL
    path("achievements", views.achievements, name="achievements"), # Achievements URL
    path("leaderboard", views.leaderboard, name="leaderboard"), # Leaderboard URL
    path("register", views.register, name="register"), # User Registration URL
]