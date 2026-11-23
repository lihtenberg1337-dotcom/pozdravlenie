const flames = document.querySelectorAll('.flame');
const smokes = document.querySelectorAll('.smoke');
const micBtn = document.getElementById('mic-btn');
const micStatus = document.getElementById('mic-status');
const cake = document.getElementById('cake');
let candlesBlown = false;
let audioContext, analyser, microphone;

function blowOutCandles() {
    if (candlesBlown) return;
    candlesBlown = true;

    flames.forEach(f => f.classList.add('out'));
    smokes.forEach(s => s.classList.add('rising'));

    micStatus.textContent = "Ура! Желание загадано и обязательно сбудется ✨";
    micBtn.disabled = true;
    micBtn.innerHTML = "<span>🎉 Свечи задуты!</span>";

    launchConfetti();

    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
    }
}

cake.addEventListener('click', blowOutCandles);

micBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        micBtn.disabled = true;
        micBtn.innerHTML = "<span>🌬️ Дуй в микрофон!</span>";
        micStatus.textContent = "Микрофон слушает... Подуй прямо сейчас!";

        function detectBlow() {
            if (candlesBlown) return;
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            let average = sum / bufferLength;

            if (average > 48) {
                blowOutCandles();
            } else {
                requestAnimationFrame(detectBlow);
            }
        }
        detectBlow();

    } catch (err) {
        micStatus.textContent = "Не удалось включить микрофон — просто нажми на сам торт, чтобы задуть свечи!";
    }
});

const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const petals = [];
const confetti = [];
const petalColors = ['rgba(255, 183, 197, 0.55)', 'rgba(255, 218, 224, 0.65)', 'rgba(246, 198, 195, 0.5)'];

for (let i = 0; i < 28; i++) {
    petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 5,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.random() * 0.6 - 0.3,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.02 - 0.01,
        color: petalColors[Math.floor(Math.random() * petalColors.length)]
    });
}

function launchConfetti() {
    const colors = ['#d97b84', '#e6b86a', '#f3c6c3', '#ff9a9e', '#a1c4fd'];
    for (let i = 0; i < 120; i++) {
        confetti.push({
            x: width / 2,
            y: height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 16 - 4,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            gravity: 0.35,
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 10
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    petals.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.angle) * 0.3;
        p.angle += p.spin;

        if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.rotation += c.vRot;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation * Math.PI / 180);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        ctx.restore();

        if (c.y > height + 30) {
            confetti.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

animate();
