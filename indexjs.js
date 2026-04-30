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

let currentPet = localStorage.getItem("selectedPet") || "black";

function getPet() {
    return localStorage.getItem("selectedPet") || "black";
}

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
document.addEventListener("DOMContentLoaded", () => {
    const petContainer = document.getElementById("petContainer");
    if (petContainer) {
        petContainer.classList.add("idle-animation");
    }
});

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
    const petImg = document.getElementById("petImage");

    const base = currentPet || "black";

    pet.classList.remove("eat-animation");
    void pet.offsetWidth;
    pet.classList.add("eat-animation");

    let frame = 0;

    const interval = setInterval(() => {    
        petImg.src = (frame % 2 === 0)
            ? `${base}_eat.png`
            : `${base}_idle.png`;

        frame++;

        if (frame >= 5) {
            clearInterval(interval);
            petImg.src = `${base}_idle.png`;
        }
    }, 150);
}

document.addEventListener("DOMContentLoaded", () => {
    startIdleLoop();

    const petContainer = document.getElementById("petContainer");
    if (!petContainer) return; 
    petContainer.classList.add("idle-animation");

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

//idle loop
function startIdleLoop() {
    const petImg = document.getElementById("petImage");

    let state = "idle";

    function getBase() {
        const pet = currentPet;
        return pet || "black";
    }

    function setSprite(type) {
        currentPet
        const img = document.getElementById("petImage");

        if (!img || !base) return;

        img.src = `${base}_${type}.png`;
    }

    setInterval(() => {
        if (state === "sleep" || state === "sad") return;

        const rand = Math.random();

    if (rand < 0.10) {
        state = "sleep";
        setSprite("sleep");

        document.getElementById("sleepZ").classList.add("show");

        setTimeout(() => {
            state = "idle";
            setSprite("idle");
            document.getElementById("sleepZ").classList.remove("show");
        }, 10000);

        } else if (rand < 0.15) {
            state = "sad";
            setSprite("sad");

            setTimeout(() => {
                state = "idle";
                setSprite("idle");
            }, 4000);

        } else {
            state = "idle";
            setSprite("idle");
        }

    }, 4000);
}

//pet selection
document.addEventListener("DOMContentLoaded", () => {
    const petChoices = document.querySelectorAll(".petChoice");

    console.log("PET CHOICES FOUND:", petChoices.length);

    petChoices.forEach(img => {
        img.addEventListener("click", () => {
            const selectedPet = img.dataset.pet;

            console.log("CLICKED:", selectedPet);

            currentPet = selectedPet;
            
            const petImg = document.getElementById("petImage");
            if (petImg) {
                petImg.src = `${selectedPet}_idle.png`;
            }
        });
    });
});

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

