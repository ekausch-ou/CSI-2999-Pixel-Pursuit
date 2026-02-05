from django.shortcuts import render, redirect
from .forms import RegisterForm

def home(request):

    return render(request, "games/home.html")

def play_2048(request):

    return render(request, "games/2048.html")

def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
        else:
            return render(request, "registration/register.html", {"form": form})

    else:
        form = RegisterForm()

    return render(request, "registration/register.html", {"form": form})