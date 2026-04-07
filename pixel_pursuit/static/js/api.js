// CSRF helper
function getCSRFToken() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];
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

//Game file
//import { submitScore, unlockAchievement } from "/static/js/api.js";

//Implementation
/*
unlockAchievement(3).then(data => {
    if (data.status === "success") {
        console.log("🎉 Achievement unlocked!");
    } else if (data.status === "exists") {
        console.log("Already unlocked");
    }
});
*/