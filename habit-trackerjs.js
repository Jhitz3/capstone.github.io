//points
function getUserPoints(user) {
    return parseInt(localStorage.getItem(`points_v1:${user}`) || "0", 10);
}

function setUserPoints(user, value) {
    localStorage.setItem(`points_v1:${user}`, value);
}

function addUserPoints(user, amount) {
    const curr = getUserPoints(user);
    setUserPoints(user, curr + amount);
}

function deductUserPoints(user, amount) {
    const curr = getUserPoints(user);
    setUserPoints(user, Math.max(0, curr - amount));
}

(function () {

    //account
    const currentUser = localStorage.getItem("currentUser");
    const loginLinkBtn = document.getElementById("loginLinkBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const topMenu = document.getElementById("topMenu");
    const menuToggle = document.getElementById("menuToggle");

    function showMessage(text, timeout = 2000) {
        const n = document.createElement("div");
        n.className = "alert";
        n.textContent = text;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), timeout);
    }

    function updateSignedState(user) {
        const userBar = document.querySelector(".user-bar");
        const topMenuUser = topMenu.querySelector(".top-menu-user");

        if (user) {
            topMenuUser.innerHTML = `Signed in as <strong>${user}</strong>`;
            userBar.innerHTML = `<span class="muted">Signed in as <strong>${user}</strong></span>`;
            loginLinkBtn.style.display = "none";
            logoutBtn.style.display = "block";
        } else {
            topMenuUser.innerHTML = '<a href="login.html" class="muted">Not signed in</a>';
            userBar.innerHTML = '<a href="login.html" class="muted">Not signed in</a>';
            loginLinkBtn.style.display = "inline-block";
            logoutBtn.style.display = "none";
        }
    }

    updateSignedState(currentUser);

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");

            updateSignedState(null);

            const habitListEl = document.getElementById("habitList");
            if (habitListEl) habitListEl.innerHTML = "";

            const newInput = document.getElementById("newHabitInput");
            const addBtn = document.getElementById("addHabitBtn");
            newInput.disabled = true;
            addBtn.disabled = true;

            showMessage("Logged out");
        });
    }

    //hamburger menu
    if (menuToggle && topMenu) {
        menuToggle.addEventListener("click", (e) => {
            const opened = topMenu.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", opened);
            e.stopPropagation();
        });

        document.addEventListener("click", (e) => {
            if (!topMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                topMenu.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    if (!currentUser) {
        document.getElementById("habitList").innerHTML = "";
        document.getElementById("newHabitInput").disabled = true;
        document.getElementById("addHabitBtn").disabled = true;
        return;
    }

    //save data
    const STORAGE_KEY = `habitData_v1:${currentUser}`;
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    function loadData() {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (!saved || !Array.isArray(saved.items)) {
            saved = { items: [] }; 
            saveData();
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }

    function localDateString(d) {
        return d.toISOString().split("T")[0];
    }

    const today = localDateString(new Date());

    //confetti
    function spawnConfetti(x, y, container) {
        for (let i = 0; i < 12; i++) {
            const c = document.createElement("div");
            c.className = "confetti";

            const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#ff92c2"];
            c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            c.style.setProperty("--x-move", (Math.random() * 40 - 20) + "px");

            c.style.left = x + "px";
            c.style.top = y + "px";

            container.appendChild(c);

            setTimeout(() => c.remove(), 700);
        }
    }

    //create habit
    function createHabitElement(item) {
        const el = document.createElement("div");
        el.className = "periwinklebox habit-item";
        el.dataset.id = item.id;

        const titleEl = document.createElement("h2");
        titleEl.textContent = item.title;
        titleEl.style.margin = "0";

        const actions = document.createElement("div");
        actions.className = "actions";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "habit-toggle";
        checkbox.checked = item.checked;

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "✏️";

        const delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.textContent = "🗑️";

        actions.appendChild(checkbox);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        el.appendChild(titleEl);
        el.appendChild(actions);

  //checkbox
    checkbox.addEventListener("change", () => {
        const it = saved.items.find(x => x.id === item.id);

        if (it.lastCompletedDate === today) {
            checkbox.checked = true; 
            showMessage("You've already completed this habit today!");
            return;
        }

        if (checkbox.checked) {
            it.checked = true;
            it.lastCompletedDate = today;

            const boxRect = el.getBoundingClientRect();
            const checkRect = checkbox.getBoundingClientRect();
            const x = checkRect.left - boxRect.left + checkRect.width / 2;
            const y = checkRect.top - boxRect.top + checkRect.height / 2;

            spawnConfetti(x, y, el);

            addUserPoints(currentUser, 1);
            showMessage("+1 point!");
        } else {
            checkbox.checked = true;
            showMessage("You can only complete a habit once per day!");
            return;
        }

    saveData();
});

        //edit button
        editBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.className = "habit-edit-input";
            input.value = item.title;

            el.replaceChild(input, titleEl);
            input.focus();

            input.addEventListener("blur", () => {
                item.title = input.value.trim() || "Untitled Habit";
                saveData();
                renderHabits();
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") input.blur();
                if (e.key === "Escape") renderHabits();
            });
        });

        //delete button
        delBtn.addEventListener("click", () => {
            if (!confirm("Delete this habit?")) return;
            saved.items = saved.items.filter(x => x.id !== item.id);
            saveData();
            renderHabits();
        });

        return el;
    }

    //habits
    function renderHabits() {
        const habitListEl = document.getElementById("habitList");
        habitListEl.innerHTML = "";
        loadData();

        saved.items.forEach(item => {
            habitListEl.appendChild(createHabitElement(item));
        });
    }

    function addHabit(title) {
        saved.items.push({
            id: "habit-" + Date.now(),
            title: title || "New Habit",
            checked: false,
            lastCompletedDate: null
        });

        saveData();
        renderHabits();
    }

    document.getElementById("addHabitBtn").addEventListener("click", () => {
        const val = document.getElementById("newHabitInput").value.trim();
        if (!val) return;
        addHabit(val);
        document.getElementById("newHabitInput").value = "";
    });

    document.getElementById("newHabitInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addHabit(document.getElementById("newHabitInput").value.trim());
            document.getElementById("newHabitInput").value = "";
        }
    });

    //daily reset (11:59pm local time)
    renderHabits();

    function resetAllCompletions() {
        saved.items.forEach(item => {
            item.checked = false;
            item.lastCompletedDate = null;
        });
        saveData();
        renderHabits();
        setUserPoints(currentUser, 0);
    }

    const now = new Date();
    const target = new Date(now);
    target.setHours(23, 59, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    setTimeout(() => {
        resetAllCompletions();
        setInterval(resetAllCompletions, 24 * 60 * 60 * 1000);
    }, target - now);

})();
