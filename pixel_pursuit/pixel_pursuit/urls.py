from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name='registration/password_form.html', email_template_name='registration/password_email.html', subject_template_name="registration/password_subject.html"), name='password_reset'),
    path("password_reset/done/", auth_views.PasswordResetDoneView.as_view(template_name="registration/password_sent.html"), name="password_reset_done"),
    path("reset/<uidb64>/<token>/", auth_views.PasswordResetConfirmView.as_view(template_name="registration/password_confirm.html"), name="password_reset_confirm"),
    path("reset/done/", auth_views.PasswordResetCompleteView.as_view(template_name="registration/password_complete.html"), name="password_reset_complete"),

    path("password_change/", auth_views.PasswordChangeView.as_view(template_name="registration/change_form.html"), name="password_change"),
    path("password_change/done/", auth_views.PasswordChangeDoneView.as_view(template_name="registration/change_done.html"), name="password_change_done"),
    
    path('', include('django.contrib.auth.urls')),
    path("", include("games.urls")),
]
