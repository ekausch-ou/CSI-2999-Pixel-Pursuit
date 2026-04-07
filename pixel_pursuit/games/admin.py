from django.contrib import admin
from .models import Game, Achievement, UserAchievement, HighScore

admin.site.register(Game)
admin.site.register(Achievement)
admin.site.register(UserAchievement)
admin.site.register(HighScore)