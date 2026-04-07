import random
import copy
import json

from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from django.http import JsonResponse

from .forms import RegisterForm
from .models import Achievement, UserAchievement, HighScore, Game

# Homepage View
def home(request):

    return render(request, "pages/home.html")

# 2048 Game View
def game2048(request):

    return render(request, "games/2048.html")

# Yahtzee Game View
def yahtzee(request):

    return render(request, "games/yahtzee.html")

# Food Fighters Game View
def food_fight(request):

    return render(request, "games/food_fighter.html")

# Tidal Tap Game View
def game_tidal(request):

    return render(request, "games/tidal_tap.html")

# Minesweeper Game View
def game_minesweeper(request):

    return render(request, "games/minesweeper.html")

# Next Move Game View
def game_minesweeper(request):

    return render(request, "games/minesweeper.html")

# Leaderboard View
def leaderboard(request):
    games = Game.objects.all()
    leaderboards = {}

    for game in games:
        # Get top 5 scores for this game
        top_scores = HighScore.objects.filter(game=game).order_by('-score', 'achieved_at')[:5]

        leaderboard = []
        for i, hs in enumerate(top_scores, start=1):
            leaderboard.append({
                'rank': i,
                'username': hs.user.username,
                'score': hs.score,
                'profile_pic': hs.user.profile.profile_pic.url if hasattr(hs.user, 'profile') and hs.user.profile.profile_pic else 'profile.png'
            })

        # Fill remaining slots if less than 5
        while len(leaderboard) < 5:
            leaderboard.append({
                'rank': len(leaderboard) + 1,
                'username': '',
                'score': '',
                'profile_pic': 'profile.png'
            })

        leaderboards[game] = leaderboard

    return render(request, 'pages/leaderboard.html', {
        'leaderboards': leaderboards
    })

# Achievement Page View
def achievements(request):
    games = Game.objects.all()
    allAchievements = {}

    for game in games:
        aObj = Achievement.objects.filter(game=game.id)
        gameAchievements = []
        for achive in aObj:
            achieved = UserAchievement.objects.filter(user=request.user, achievement=achive.id).exists()
            gameAchievements.append({
                'name': achive.name,
                'description': achive.description,
                'achieved': achieved
            })
        allAchievements[game] = gameAchievements
    print(allAchievements)
    return render(request, "pages/achievements.html", {
        "achievements": allAchievements,
        })

# User Registration View
def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
        else:
            return render(request, "registration/register.html", {
                "form": form,
                })

    else:
        form = RegisterForm()

    return render(request, "registration/register.html", {
        "form": form,
        })

@require_POST
def submit_score(request):
    try:
        data = json.loads(request.body)

        game_name = data.get("game")
        score = int(data.get("score"))

        game = Game.objects.get(name=game_name)
        existing = HighScore.objects.filter(user=request.user, game=game).first()

        if not existing or score > existing.score:
            HighScore.objects.update_or_create(
                user=request.user,
                game=game,
                defaults={"score": score}
            )

        return JsonResponse({"status": "success"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)

@require_POST
def unlock_achievement(request):
    try:
        data = json.loads(request.body)
        achievement_id = data.get("achievement_id")

        achievement = Achievement.objects.get(id=achievement_id)

        user_achievement, created = UserAchievement.objects.get_or_create(
            user=request.user,
            achievement=achievement
        )

        if not created:
            return JsonResponse({
                "status": "exists",
                "message": "Achievement already unlocked",
                "name": achievement.name,
                "description": achievement.description
            }, status=200)

        return JsonResponse({
            "status": "success",
            "message": "Achievement unlocked!",
            "name": achievement.name,
            "description": achievement.description
        })

    except Achievement.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Invalid achievement"}, status=404)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)