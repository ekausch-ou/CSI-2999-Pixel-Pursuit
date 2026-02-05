from django.shortcuts import render, redirect
from .forms import RegisterForm
import random
import copy

# Homepage View
def home(request):

    return render(request, "games/home.html")

# Leaderboard View
def leaderboard(request):

    return render(request, "games/leaderboard.html")

# Achievement Page View
def achievements(request):

    # Demo Achivements w/ randomized completion for demo purposes
    #To be integrated into the database following game creation
    achievements = [
        {'name': 'Achievement 1', 'description': 'This is a short description of the achievement.', 'achieved': True},
        {'name': 'Achievement 2', 'description': 'This is a short description of the achievement.', 'achieved': False},
        {'name': 'Achievement 3', 'description': 'This is a short description of the achievement.', 'achieved': True},
        {'name': 'Achievement 4', 'description': 'This is a short description of the achievement.', 'achieved': False},
        {'name': 'Achievement 5', 'description': 'This is a short description of the achievement.', 'achieved': True},
    ]

    achievements_1 = copy.deepcopy(achievements)
    achievements_2 = copy.deepcopy(achievements)
    achievements_3 = copy.deepcopy(achievements)
    achievements_4 = copy.deepcopy(achievements)

    for ach_list in [achievements_1, achievements_2, achievements_3, achievements_4]:
        for a in ach_list:
            a['achieved'] = random.choice([True, False])

    print(achievements_1)
    return render(request, "games/achievements.html", {
        "achievements_1": achievements_1,
        "achievements_2": achievements_2,
        "achievements_3": achievements_3,
        "achievements_4": achievements_4,
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