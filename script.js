document.addEventListener('DOMContentLoaded', () => {

    // --- ส่วนที่ 1: การตั้งค่าทั่วไปและ Dark Mode ---

    // << เพิ่มใหม่: สร้าง Object เสียงสำหรับแจ้งเตือน (ใช้ซ้ำได้)
    const notificationSound = new Audio('DrinkingWater.mp3');
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    let dashboardState = {
        theme: 'light-theme',
        cards: {}
    };

    function saveState() {
        localStorage.setItem('dashboardState', JSON.stringify(dashboardState));
    }

    function toggleTheme() {
        const isLightTheme = body.classList.contains('light-theme');
        dashboardState.theme = isLightTheme ? 'dark-theme' : 'light-theme';
        body.className = dashboardState.theme;
        themeToggle.textContent = isLightTheme ? '☀️ สลับโหมด' : '🌙 สลับโหมด';
        saveState();
    }

    themeToggle.addEventListener('click', toggleTheme);

    // --- ส่วนที่ 2: การทำงานของ SERVER CARDS ---
    const allServerCards = document.querySelectorAll('.server-card');
    allServerCards.forEach(card => {
        const id = card.dataset.id;
        const startBtn = card.querySelector('.start-btn');
        const resetBtn = card.querySelector('.reset-btn');
        const statusLight = card.querySelector('.status-light-box');
        const countdownTimer = card.querySelector('.countdown-timer');
        const progressBar = card.querySelector('.progress-bar');

        const TOTAL_CYCLE_TIME = 90 * 60 * 1000;
        const GREEN_LIGHT_DURATION = 8 * 60 * 1000;

        let mainCycleTimeout, countdownInterval;

        dashboardState.cards[id] = { isRunning: false, endTime: null, type: 'server' };

        function formatTime(ms) {
            if (ms <= 0) return "00:00:00";
            const s = Math.floor((ms / 1000) % 60);
            const m = Math.floor((ms / (1000 * 60)) % 60);
            const h = Math.floor((ms / (1000 * 60 * 60)));
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        countdownTimer.textContent = formatTime(TOTAL_CYCLE_TIME);

        function triggerGreenLightCycle() {
            notificationSound.play();
            statusLight.classList.add('green');
            statusLight.classList.remove('red');
            setTimeout(() => {
                statusLight.classList.remove('green');
                statusLight.classList.add('red');
            }, GREEN_LIGHT_DURATION);

            dashboardState.cards[id].endTime = Date.now() + TOTAL_CYCLE_TIME;
            saveState();
            mainCycleTimeout = setTimeout(triggerGreenLightCycle, TOTAL_CYCLE_TIME);
        }

        function updateCountdown() {
            const state = dashboardState.cards[id];
            if (!state.isRunning) return;
            const remainingMs = state.endTime - Date.now();
            countdownTimer.textContent = formatTime(remainingMs);
            const progressPercent = ((TOTAL_CYCLE_TIME - remainingMs) / TOTAL_CYCLE_TIME) * 100;
            progressBar.style.width = `${progressPercent}%`;
            if (remainingMs < 0) {
                progressBar.style.width = '100%';
            }
        }

        function startTimer() {
            const state = dashboardState.cards[id];
            if (state.isRunning) return;
            state.isRunning = true;
            startBtn.disabled = true;

            statusLight.classList.add('red');
            statusLight.classList.remove('green');

            state.endTime = Date.now() + TOTAL_CYCLE_TIME;
            saveState();

            mainCycleTimeout = setTimeout(triggerGreenLightCycle, TOTAL_CYCLE_TIME);
            countdownInterval = setInterval(updateCountdown, 1000);
            updateCountdown();
        }

        function resetTimer() {
            const state = dashboardState.cards[id];
            state.isRunning = false;
            state.endTime = null;
            saveState();

            startBtn.disabled = false;
            clearTimeout(mainCycleTimeout);
            clearInterval(countdownInterval);
            statusLight.classList.remove('green', 'red');
            countdownTimer.textContent = formatTime(TOTAL_CYCLE_TIME);
            progressBar.style.width = '0%';
        }

        startBtn.addEventListener('click', startTimer);
        resetBtn.addEventListener('click', resetTimer);
    });

    // --- ส่วนที่ 3: การทำงานของ TIMER CARDS ---
    const allTimerCards = document.querySelectorAll('.timer-card');
    allTimerCards.forEach(card => {
        const id = card.dataset.id;
        const startBtn = card.querySelector('.start-btn');
        const resetBtn = card.querySelector('.reset-btn');
        const timerDisplay = card.querySelector('.timer-display');

        const title = card.querySelector('h2').textContent;
        const initialTime = title.includes('2 Hours') ? 2 * 60 * 60 * 1000 : 30 * 60 * 1000;


        let countdownInterval;
        dashboardState.cards[id] = { isRunning: false, endTime: null, type: 'timer' };

        function formatTime(ms) {
            if (ms < 0) ms = 0;
            const s = Math.floor((ms / 1000) % 60);
            const m = Math.floor((ms / (1000 * 60)) % 60);
            const h = Math.floor((ms / (1000 * 60 * 60)));
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        timerDisplay.textContent = formatTime(initialTime);

        function updateTimerDisplay() {
            const state = dashboardState.cards[id];
            if (!state.isRunning) return;
            const remainingMs = state.endTime - Date.now();
            timerDisplay.textContent = formatTime(remainingMs);

            if (remainingMs < 0) {
                notificationSound.play(); // << เพิ่มใหม่: เล่นเสียงแจ้งเตือน
                resetTimer(); // เรียก reset เพื่อหยุด timer และคืนค่าปุ่ม
            }
        }

        function startTimer() {
            const state = dashboardState.cards[id];
            if (state.isRunning) return;
            state.isRunning = true;
            startBtn.disabled = true;
            state.endTime = Date.now() + initialTime;
            saveState();
            countdownInterval = setInterval(updateTimerDisplay, 1000);
            updateTimerDisplay();
        }

        function resetTimer() {
            const state = dashboardState.cards[id];
            state.isRunning = false;
            state.endTime = null;
            saveState();

            startBtn.disabled = false;
            clearInterval(countdownInterval);
            timerDisplay.textContent = formatTime(initialTime);
        }

        startBtn.addEventListener('click', startTimer);
        resetBtn.addEventListener('click', resetTimer);
    });

    // --- ส่วนที่ 4: โหลดสถานะทั้งหมดเมื่อเปิดหน้าเว็บ ---
    function loadState() {
        const savedState = localStorage.getItem('dashboardState');
        if (!savedState) {
            body.className = dashboardState.theme;
            themeToggle.textContent = '🌙 สลับโหมด';
            return;
        }

        dashboardState = JSON.parse(savedState);

        body.className = dashboardState.theme || 'light-theme';
        themeToggle.textContent = body.className === 'dark-theme' ? '☀️ สลับโหมด' : '🌙 สลับโหมด';

        Object.keys(dashboardState.cards).forEach(id => {
            const state = dashboardState.cards[id];
            const cardElement = document.querySelector(`[data-id="${id}"]`);
            if (!cardElement || !state.isRunning || !state.endTime) return;

            const remainingMs = state.endTime - Date.now();
            if (remainingMs > 0) {
                if (state.type === 'server' || state.type === 'timer') {
                    cardElement.querySelector('.start-btn').click();
                }
            }
        });
    }

    loadState();
});