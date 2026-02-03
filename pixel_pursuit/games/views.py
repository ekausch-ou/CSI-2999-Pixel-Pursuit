from django.shortcuts import render

def home(request):

    return render(request, "games/home.html")

def play_2048(request):

    return render(request, "games/2048.html")
