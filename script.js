// --- ส่วนที่ 1: การทำงานของ SERVER CARDS ---

const allServerCards = document.querySelectorAll('.server-card');
allServerCards.forEach(card => {
    const startBtn = card.querySelector('.start-btn');
    const resetBtn = card.querySelector('.reset-btn');
    const statusLight = card.querySelector('.status-light-box');
    const countdownTimer = card.querySelector('.countdown-timer');
    const progressBar = card.querySelector('.progress-bar');

    const TOTAL_CYCLE_TIME = 90 * 60 * 1000;
    const GREEN_LIGHT_DURATION = 8 * 60 * 1000;

    let mainCycleInterval;
    let countdownInterval;
    let nextGreenTime;
    let isRunning = false;

    function formatTime(ms) {
        if (ms <= 0) return "00:00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    // ตั้งค่าเวลาเริ่มต้นให้ถูกต้อง
    countdownTimer.textContent = formatTime(TOTAL_CYCLE_TIME);

    function runStatusCycle() {
        statusLight.classList.add('green');
        statusLight.classList.remove('red');
        setTimeout(() => {
            statusLight.classList.remove('green');
            statusLight.classList.add('red');
        }, GREEN_LIGHT_DURATION);
        nextGreenTime = Date.now() + TOTAL_CYCLE_TIME;
    }

    function updateCountdown() {
        if (!nextGreenTime) return;
        const remainingMs = nextGreenTime - Date.now();
        countdownTimer.textContent = formatTime(remainingMs);
        const progressPercent = ((TOTAL_CYCLE_TIME - remainingMs) / TOTAL_CYCLE_TIME) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        runStatusCycle();
        mainCycleInterval = setInterval(runStatusCycle, TOTAL_CYCLE_TIME);
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function resetTimer() {
        isRunning = false;
        startBtn.disabled = false;
        clearInterval(mainCycleInterval);
        clearInterval(countdownInterval);
        statusLight.classList.remove('green', 'red');
        countdownTimer.textContent = formatTime(TOTAL_CYCLE_TIME);
        progressBar.style.width = '0%';
        nextGreenTime = undefined;
    }

    startBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
});

// --- ## ส่วนที่ 2: การทำงานของ TIMER CARDS (เพิ่มใหม่) ## ---

const allTimerCards = document.querySelectorAll('.timer-card');
allTimerCards.forEach(card => {
    const startBtn = card.querySelector('.start-btn');
    const resetBtn = card.querySelector('.reset-btn');
    const timerDisplay = card.querySelector('.timer-display');
    
    // ตรวจสอบจาก h2 เพื่อกำหนดเวลาเริ่มต้นของการ์ดแต่ละใบ
    const title = card.querySelector('h2').textContent;
    let initialTime;
    if (title.includes('2 Hours')) {
        initialTime = 2 * 60 * 60 * 1000;
    } else if (title.includes('30 Minutes')) {
        initialTime = 30 * 60 * 1000;
    }

    let countdownInterval;
    let endTime;
    let isRunning = false;
    
    function formatTime(ms) {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        const remainingMs = endTime - Date.now();
        timerDisplay.textContent = formatTime(remainingMs);
        if (remainingMs < 0) {
            clearInterval(countdownInterval);
            isRunning = false;
            startBtn.disabled = false;
        }
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        endTime = Date.now() + initialTime;
        countdownInterval = setInterval(updateTimerDisplay, 1000);
    }

    function resetTimer() {
        isRunning = false;
        startBtn.disabled = false;
        clearInterval(countdownInterval);
        timerDisplay.textContent = formatTime(initialTime);
    }

    startBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
});