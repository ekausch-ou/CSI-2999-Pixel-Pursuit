export function burstConfetti() {
    playConfettiSound(); // play sound when burst starts
    createBurst(document.querySelector(".confetti-container.left"), 1);
    createBurst(document.querySelector(".confetti-container.right"), -1);
}

function playConfettiSound() {
    const audio = new Audio("/static/sounds/achieve.mp3"); // adjust path to your sound file
    audio.volume = 0.5; // optional: adjust volume
    audio.play();
}

function createBurst(container, direction) {
  const colors = ["#ff4d4d","#ffd24d","#4dff88","#4db8ff","#b84dff"];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti");

    piece.style.background = colors[Math.floor(Math.random()*colors.length)];

    const x = (Math.random()*500 + 300) * direction;
    const y = -(Math.random()*600 + 300);

    piece.style.setProperty("--x", `${x}px`);
    piece.style.setProperty("--y", `${y}px`);

    container.appendChild(piece);

    setTimeout(() => piece.remove(), 2000);
  }
}

export function showAchievement(name, description, duration = 3000) {
    // Create container if it doesn't exist
    let container = document.getElementById("achievementToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "achievementToastContainer";
        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.left = "50%";
        container.style.transform = "translateX(-50%)";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `<strong>${name}</strong><br>${description}`;

    container.appendChild(toast);

    // Trigger fade-in
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Auto-fade after duration
    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => toast.remove());
    }, duration);
}