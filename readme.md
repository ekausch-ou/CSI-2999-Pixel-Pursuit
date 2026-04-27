# Pixel Pursuit

Pixel Pursuit is a web-based, arcade-style gaming platform that brings together a collection of engaging mini-games in one accessible online space. It offers a variety of browser-playable games where players can earn achievements, track their performance, and compete through high scores, leaderboards, and user profiles. The platform is fully web-based and includes mini-games with diverse mechanics, integrated achievement and scoring systems, and user management features such as authentication and profiles. Pixel Pursuit is designed for gamers who enjoy casual yet competitive experiences, especially those drawn to quick, replayable games and motivated by progression, achievements, and leaderboard rankings.

## Setup & Installation

The best practice for working with this project is to use a Python virtual environment (venv) so that dependencies are isolated from your system Python.

### Create a virtual environment

From the repository root:
```
python3 -m venv venv
```
#### macOS / Linux
```
source venv/bin/activate
```
#### Windows (PowerShell)
```
.\venv\Scripts\Activate.ps1
```
### Install Dependencies

Install the required Python packages from the requirements.txt file:
```
pip install -r requirements.txt
```

### Running the Program
From the pixel_pursuit folder run:
```
python manage.py runserver 0.0.0.0:8000
```
### View the Application
To view the application
[http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## Docker Setup (Recommended)
Pixel Pursuit can also be run using Docker, which removes the need to install Python or dependencies manually.
### Prerequisites

Make sure you have:
- Docker installed → https://www.docker.com/get-started
- Docker Compose installed (included with Docker Desktop)

### Running with Docker:
### Build and start the app
```
docker-compose up --build
```

### Open the application
http://localhost

### Run migrations (first time only)
```
docker-compose exec web python manage.py migrate
```

### Create a superuser (optional)
```
docker-compose exec web python manage.py createsuperuser
```

## Stopping the containers
```
docker-compose down
```