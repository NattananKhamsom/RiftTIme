// --- ตั้งค่าเวลาคงที่ (ใช้ร่วมกันทั้งหมด) ---
const TOTAL_CYCLE_TIME = 90 * 60 * 1000; // 1 ชั่วโมง 30 นาที
const GREEN_LIGHT_DURATION = 8 * 60 * 1000;  // 8 นาที

// --- เลือก "server-card" ทั้งหมดในหน้าเว็บ ---
const allServerCards = document.querySelectorAll('.server-card');

// --- วนลูปเพื่อกำหนดการทำงานให้แต่ละการ์ดแยกกัน ---
allServerCards.forEach(card => {
    // --- 1. ดึง Elements ภายใน "การ์ดนี้" เท่านั้น ---
    const startBtn = card.querySelector('.start-btn');
    const resetBtn = card.querySelector('.reset-btn');
    const statusLight = card.querySelector('.status-light-box');
    const countdownTimer = card.querySelector('.countdown-timer');
    const progressBar = card.querySelector('.progress-bar');

    // --- 2. สร้างตัวแปรสำหรับเก็บสถานะของ "การ์ดนี้" เท่านั้น ---
    let mainCycleInterval;
    let countdownInterval;
    let nextGreenTime;
    let isRunning = false;

    // --- 3. สร้างฟังก์ชันการทำงานสำหรับ "การ์ดนี้" ---
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

        if (remainingMs <= 0) {
            countdownTimer.textContent = "00:00:00";
            return;
        }

        const totalSeconds = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        countdownTimer.textContent = 
            `${String(hours).padStart(2, '0')}:` +
            `${String(minutes).padStart(2, '0')}:` +
            `${String(seconds).padStart(2, '0')}`;

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
        countdownTimer.textContent = "00:00:00";
        progressBar.style.width = '0%';
        nextGreenTime = undefined;
    }

    // --- 4. เชื่อมฟังก์ชันเข้ากับปุ่มของ "การ์ดนี้" ---
    startBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
});