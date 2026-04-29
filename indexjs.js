//nav
(function initMenu() {
    const currentUser = localStorage.getItem("currentUser");
    const loginBtn = document.getElementById("loginLinkBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const menuToggle = document.getElementById("menuToggle");
    const topMenu = document.getElementById("topMenu");
    const topMenuUser = topMenu.querySelector(".top-menu-user");

    function updateMenu(user) {
        if (user) {
            topMenuUser.innerHTML = `Signed in as <strong>${user}</strong>`;
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
        } else {
            topMenuUser.textContent = "Not signed in";
            loginBtn.style.display = "inline-block";
            logoutBtn.style.display = "none";
        }
    }

    updateMenu(currentUser);
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        updateMenu(null);
        alert("Logged out!");
    });

    //hamburger menu
    menuToggle.addEventListener("click", (e) => {
        const open = topMenu.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", open);
        e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
        if (!topMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            topMenu.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
})();

//points
function getUserPoints(user) {
    return parseInt(localStorage.getItem(`points_v1:${user}`) || "0", 10);
}

function setUserPoints(user, value) {
    localStorage.setItem(`points_v1:${user}`, value);
}

function deductUserPoints(user, amt) {
    setUserPoints(user, Math.max(0, getUserPoints(user) - amt));
}

//pet page interaction
(function initPetPage() {
    const currentUser = localStorage.getItem("currentUser");
    const pointDisplay = document.getElementById("pointDisplay");

    function updatePointUI() {
        pointDisplay.textContent = currentUser
            ? `Points: ${getUserPoints(currentUser)}`
            : "Points: 0";
    }

    function trySpend(amount) {
        if (!currentUser) {
            alert("Please sign in!");
            return false;
        }

        if (getUserPoints(currentUser) < amount) {
            alert("Not enough points!");
            return false;
        }

        deductUserPoints(currentUser, amount);
        updatePointUI();
        return true;
    }

    document.getElementById("feedBtn").addEventListener("click", () => {
    if (trySpend(2)) runEatingAnimation();
    });

    document.getElementById("playBtn").addEventListener("click", () => {
        if (trySpend(2)) runPetAnimation("play-animation");
    });

    document.getElementById("groomBtn").addEventListener("click", () => {
        if (trySpend(2)) runPetAnimation("groom-animation");
    });

    updatePointUI();
})();


//pet animations
const petContainer = document.getElementById("petContainer");
petContainer.classList.add("idle-animation");

function runPetAnimation(className) {
    petContainer.classList.remove("idle-animation", "sleep-animation");
    petContainer.classList.remove("feed-animation", "play-animation", "groom-animation");
    void petContainer.offsetWidth;
    petContainer.classList.add(className);
}

petContainer.addEventListener("animationend", () => {
    petContainer.classList.remove("feed-animation", "play-animation", "groom-animation");
    if (!petContainer.classList.contains("sleep-animation")) {
        petContainer.classList.add("idle-animation");
    }
});

function runEatingAnimation() {
    const pet = document.getElementById("petContainer");
    pet.classList.remove("eat-animation");
    void pet.offsetWidth;
    pet.classList.add("eat-animation");
    const bowl = document.createElement("div");
    bowl.className = "eat-bowl";
    bowl.textContent = "🍲";
    pet.appendChild(bowl);
    setTimeout(() => bowl.remove(), 1000);

    for (let i = 0; i < 2; i++) {
        const nom = document.createElement("div");
        nom.className = "eat-noms";
        nom.textContent = "nom";
        const baseY = 60;              
        const randomYOffset = Math.random() * 25;
        nom.style.top = (baseY + randomYOffset) + "px";
        const baseX = 70;
        const spread = 70;             
        const randomXOffset = Math.random() * 20;
        nom.style.left = (baseX + i * spread + randomXOffset) + "px";
        pet.appendChild(nom);
        setTimeout(() => nom.remove(), 900 + i);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const petContainer = document.getElementById("petContainer");
    if (!petContainer) return; 
    petContainer.classList.add("idle-animation");

    function runPetAnimation(className) {
        petContainer.classList.remove("idle-animation", "sleep-animation");
        petContainer.classList.remove("feed-animation", "play-animation", "groom-animation");
        void petContainer.offsetWidth;
        petContainer.classList.add(className);
    }

    petContainer.addEventListener("animationend", () => {
        petContainer.classList.remove("feed-animation", "play-animation", "groom-animation");

        if (!petContainer.classList.contains("sleep-animation")) {
            petContainer.classList.add("idle-animation");
        }
    });

    function spawnHeart(x, y) {
        const rect = petContainer.getBoundingClientRect();

        const heart = document.createElement("div");
        heart.className = "petting-heart";
        heart.textContent = "❤️";

        heart.style.left = (x - rect.left - 10) + "px";
        heart.style.top = (y - rect.top - 20) + "px";

        petContainer.appendChild(heart);

        setTimeout(() => heart.remove(), 900);
    }

    petContainer.addEventListener("click", (event) => {
        spawnHeart(event.clientX, event.clientY);
    });

});

//pet selection
document.querySelectorAll(".petChoice").forEach(img => {
    img.addEventListener("click", () => {
        const selectedPet = img.dataset.pet;
        document.getElementById("petImage").src = selectedPet;
        localStorage.setItem("selectedPet", selectedPet);
    });
});

const savedPet = localStorage.getItem("selectedPet");
if (savedPet) {
    document.getElementById("petImage").src = savedPet;
}

//debug panel
(function initDebugTools() {
    const panel = document.getElementById("debugPanel");
    const currentUser = localStorage.getItem("currentUser");
    let keySequence = "";

    document.addEventListener("keydown", (e) => {
        keySequence += e.key.toLowerCase();
        if (keySequence.endsWith("dev")) {
            panel.style.display = "block";
            alert("Debug panel activated!");
        }
        if (keySequence.length > 10) keySequence = keySequence.slice(-3);
    });

    function updateUI() {
        document.getElementById("pointDisplay").textContent =
            `Points: ${getUserPoints(currentUser)}`;
    }

    if (currentUser) {
        document.getElementById("dbgAdd5").addEventListener("click", () => {
            setUserPoints(currentUser, getUserPoints(currentUser) + 5);
            updateUI();
        });
        document.getElementById("dbgAdd10").addEventListener("click", () => {
            setUserPoints(currentUser, getUserPoints(currentUser) + 10);
            updateUI();
        });
        document.getElementById("dbgAdd50").addEventListener("click", () => {
            setUserPoints(currentUser, getUserPoints(currentUser) + 50);
            updateUI();
        });
        document.getElementById("dbgSet").addEventListener("click", () => {
            const val = prompt("Enter new point value:");
            if (val !== null && !isNaN(val)) {
                setUserPoints(currentUser, parseInt(val));
                updateUI();
            }
        });
    }
})();