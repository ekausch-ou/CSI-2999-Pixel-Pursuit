from django.db import models
from django.contrib.auth.models import User

# Game Object
class Game(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='game_icons/', blank=True, null=True, default='game_icons/blank.png') # Thumbnail
    
    def __str__(self):
        return self.name

# Achievement Object
class Achievement(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE) # Link to Game
    name = models.CharField(max_length=100, unique=False)
    description = models.TextField()
    
    def __str__(self):
        return f"{self.name}: {self.description}"

# User Record for Achievements
class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # Link to User
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE) # Link to Achievement
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement') # Can't earn an achievement more than once

    def __str__(self):
        return f"{self.user.username} unlocked {self.achievement.name}"

# User Record for Scores
class HighScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE) # Link to User
    game = models.ForeignKey(Game, on_delete=models.CASCADE) # Link to Game
    score = models.PositiveIntegerField()
    achieved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', 'achieved_at']
        indexes = [
            models.Index(fields=['game', 'score']),  
        ]

    def __str__(self):
        return f"{self.user.username}: {self.score} in {self.game.name}"