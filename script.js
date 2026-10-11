const button = document.getElementById("openButton");
const intro = document.querySelector(".intro");
const garden = document.getElementById("garden");
const field = document.getElementById("field");
const petalsContainer = document.getElementById("petals");
const insectsContainer = document.getElementById("insects");
const message = document.querySelector(".message");
const hideMessageButton = document.getElementById("hideMessageButton");
const themeToggle = document.getElementById("themeToggle");
const musicToggle = document.getElementById("musicToggle");
const backgroundMusic = document.getElementById("backgroundMusic");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let isOpen = false;
let petalsTimer;
let typingRun = 0;
const messageLines = [...message.querySelectorAll("h2, p, span")].map((element) => ({
    element,
    text: element.textContent.trim(),
}));

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function createStars() {
    document.querySelectorAll(".stars").forEach((container) => {
        const fragment = document.createDocumentFragment();

        for (let index = 0; index < 60; index += 1) {
            const star = document.createElement("i");
            const size = randomBetween(1, 4);
            star.className = "star";
            star.style.cssText = `left:${randomBetween(0, 100)}%;top:${randomBetween(0, 100)}%;width:${size}px;height:${size}px;animation-delay:${randomBetween(0, 3)}s;animation-duration:${randomBetween(1, 3)}s`;
            fragment.appendChild(star);
        }

        container.appendChild(fragment);
    });
}

function createFlower() {
    const flower = document.createElement("div");
    const scale = randomBetween(0.5, 1.2);
    const delay = randomBetween(0, 4);
    flower.className = "flower";
    flower.style.cssText = `left:${randomBetween(-3, 98)}%;--scale:${scale};--layer:${Math.floor(scale * 10) + 10};--flower-bottom:${randomBetween(-12, 28)}px;--sway-duration:${randomBetween(3, 5)}s;--delay:${delay}s`;

    flower.innerHTML = `
        <div class="flower-stem"></div>
        <div class="flower-leaf left"></div>
        <div class="flower-leaf right"></div>
        <div class="flower-head">
            ${"<div class=\"flower-petal\"></div>".repeat(8)}
            <div class="flower-center"></div>
        </div>`;
    return flower;
}

function createField() {
    const fragment = document.createDocumentFragment();
    const flowerCount = window.innerWidth < 700 ? 36 : 56;

    for (let index = 0; index < flowerCount; index += 1) {
        fragment.appendChild(createFlower());
    }

    field.replaceChildren(fragment);
}

function createInsects() {
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 10; index += 1) {
        const insect = document.createElement("i");
        insect.className = `insect ${index % 2 === 0 ? "bee" : "butterfly"}`;
        insect.style.cssText = `left:${randomBetween(0, 100)}%;top:${randomBetween(20, 82)}%;animation-delay:${randomBetween(0, 5)}s;animation-duration:${randomBetween(5, 10)}s`;
        fragment.appendChild(insect);
    }

    insectsContainer.replaceChildren(fragment);
}

function createPetal() {
    // Limita los nodos animados para evitar que se acumulen en sesiones largas.
    if (petalsContainer.childElementCount >= 12) return;
    const petal = document.createElement("i");
    const duration = randomBetween(5, 10);
    const size = randomBetween(8, 20);
    petal.className = "falling-petal";
    petal.style.cssText = `left:${randomBetween(0, 100)}%;width:${size}px;height:${size * 1.5}px;animation-duration:${duration}s`;
    petal.addEventListener("animationend", () => petal.remove(), { once: true });
    petalsContainer.appendChild(petal);
}

function startPetals() {
    if (reduceMotion) return;
    createPetal();
    petalsTimer = window.setInterval(createPetal, 1200);
}

function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function typeMessage() {
    const run = ++typingRun;

    messageLines.forEach(({ element }) => {
        element.textContent = "";
        element.classList.remove("typing-line");
    });

    if (reduceMotion) {
        messageLines.forEach(({ element, text }) => {
            element.textContent = text;
        });
        hideMessageButton.hidden = false;
        return;
    }

    await wait(700);
    if (run !== typingRun) return;
    message.classList.add("is-typing");

    for (const { element, text } of messageLines) {
        element.classList.add("typing-line");
        for (const character of text) {
            if (run !== typingRun) return;
            element.textContent += character;
            await wait(character === " " ? 18 : 32);
        }
        if (run !== typingRun) return;
        element.classList.remove("typing-line");
        await wait(220);
        if (run !== typingRun) return;
    }

    message.classList.remove("is-typing");
    hideMessageButton.hidden = false;
}

function hideMessage() {
    // Cancela el efecto de escritura y conserva el mensaje completo al volver a mostrarlo.
    typingRun += 1;
    message.classList.remove("is-typing");
    messageLines.forEach(({ element, text }) => {
        element.textContent = text;
        element.classList.remove("typing-line");
    });

    const isHidden = message.classList.toggle("is-hidden");
    hideMessageButton.textContent = isHidden ? "Mostrar mensaje" : "Ver el paisaje";
}

function toggleTheme() {
    const isNightMode = garden.classList.toggle("night-mode");
    themeToggle.setAttribute("aria-pressed", String(isNightMode));
    themeToggle.setAttribute("aria-label", isNightMode ? "Activar modo de día" : "Activar modo nocturno");
    themeToggle.textContent = isNightMode ? "☀️" : "🌙";
}

function toggleMusic() {
    backgroundMusic.muted = !backgroundMusic.muted;
    const isMuted = backgroundMusic.muted;
    musicToggle.textContent = isMuted ? "🔇" : "🔊";
    musicToggle.setAttribute("aria-pressed", String(isMuted));
    musicToggle.setAttribute("aria-label", isMuted ? "Activar sonido" : "Silenciar música");
    musicToggle.title = isMuted ? "Activar sonido" : "Silenciar música";
}

function startBackgroundMusic() {
    // El navegador permite mejor la reproducción si se solicita desde el clic de «Abrir».
    backgroundMusic.volume = 0.35;
    const playback = backgroundMusic.play();
    if (playback && typeof playback.catch === "function") {
        playback.catch((error) => {
            // La canción debe existir en audio/cancion.mp3; no interrumpir la experiencia si falta.
            console.warn("No se pudo iniciar la música. Verifica audio/cancion.mp3.", error);
        });
    }
}

function openGarden() {
    if (isOpen) return;
    isOpen = true;
    button.disabled = true;
    intro.classList.add("is-hidden");
    garden.classList.add("show");
    createField();
    createInsects();
    startPetals();
    hideMessageButton.hidden = false;
    hideMessageButton.textContent = "Ver el paisaje";
    themeToggle.hidden = false;
    musicToggle.hidden = false;
    startBackgroundMusic();
    typeMessage();
    window.setTimeout(() => intro.remove(), 1200);
}

button.addEventListener("click", openGarden, { once: true });
hideMessageButton.addEventListener("click", hideMessage);
themeToggle.addEventListener("click", toggleTheme);
musicToggle.addEventListener("click", toggleMusic);
window.addEventListener("pagehide", () => {
    window.clearInterval(petalsTimer);
    backgroundMusic.pause();
}, { once: true });
createStars();
