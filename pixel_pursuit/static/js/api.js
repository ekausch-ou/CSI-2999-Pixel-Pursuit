// CSRF helper
function getCSRFToken() {
    const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];

    if (!token) {
        console.warn("CSRF token not found");
    }

    return token;
}

// Submit score
export function submitScore(gameName, score) {
    return fetch("/api/submit_score/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({
            game: gameName,
            score: score
        })
    }).then(res => res.json());
}

// Unlock achievement
export function unlockAchievement(achievementId) {
    return fetch("/api/unlock_achievement/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({
            achievement_id: achievementId
        })
    }).then(res => res.json());
}