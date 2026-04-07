from django.urls import path
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path("", views.home, name="home"), # Homepage URL
    path("achievements", views.achievements, name="achievements"), # Achievements URL
    path("leaderboard", views.leaderboard, name="leaderboard"), # Leaderboard URL
    path("register", views.register, name="register"), # User Registration URL

    #Games
    path("2048", views.game2048, name="game_2048"), 
    path("tidal_tap", views.game_tidal, name="game_tidal"),
    path("yahtzee", views.yahtzee, name="yahtzee"),
    path("food_fight", views.food_fight, name="food_fight"),
    path("minesweeper", views.game_minesweeper, name="game_minesweeper"),

    #API
    path("api/submit_score/", views.submit_score, name="submit_score"),
    path("api/unlock_achievement/", views.unlock_achievement, name="unlock_achievement"),
]