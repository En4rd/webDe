const button = document.getElementById("openButton");
const intro = document.querySelector(".intro");
const garden = document.getElementById("garden");
const field = document.getElementById("field");
const petalsContainer = document.getElementById("petals");
const insectsContainer = document.getElementById("insects");
const message = document.querySelector(".message");
const hideMessageButton = document.getElementById("hideMessageButton");
const themeToggle = document.getElementById("themeToggle");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let isOpen = false;
let petalsTimer;

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
    const flowerCount = window.innerWidth < 700 ? 42 : 70;

    for (let index = 0; index < flowerCount; index += 1) {
        fragment.appendChild(createFlower());
    }

    field.replaceChildren(fragment);
}

function createInsects() {
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 16; index += 1) {
        const insect = document.createElement("i");
        insect.className = `insect ${index % 2 === 0 ? "bee" : "butterfly"}`;
        insect.style.cssText = `left:${randomBetween(0, 100)}%;top:${randomBetween(20, 82)}%;animation-delay:${randomBetween(0, 5)}s;animation-duration:${randomBetween(5, 10)}s`;
        fragment.appendChild(insect);
    }

    insectsContainer.replaceChildren(fragment);
}

function createPetal() {
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
    petalsTimer = window.setInterval(createPetal, 750);
}

function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function typeMessage() {
    const lines = [...message.querySelectorAll("h2, p, span")].map((element) => ({
        element,
        text: element.textContent.trim(),
    }));

    lines.forEach(({ element }) => {
        element.textContent = "";
        element.classList.remove("typing-line");
    });

    if (reduceMotion) {
        lines.forEach(({ element, text }) => {
            element.textContent = text;
        });
        hideMessageButton.hidden = false;
        return;
    }

    await wait(700);
    message.classList.add("is-typing");

    for (const { element, text } of lines) {
        element.classList.add("typing-line");
        for (const character of text) {
            element.textContent += character;
            await wait(character === " " ? 18 : 32);
        }
        element.classList.remove("typing-line");
        await wait(220);
    }

    message.classList.remove("is-typing");
    hideMessageButton.hidden = false;
}

function hideMessage() {
    message.classList.add("is-hidden");
    hideMessageButton.hidden = true;
}

function toggleTheme() {
    const isNightMode = garden.classList.toggle("night-mode");
    themeToggle.setAttribute("aria-pressed", String(isNightMode));
    themeToggle.textContent = isNightMode ? "Ver versión de día ☀️" : "Ver versión nocturna 🌙";
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
    // Mantiene una salida visible mientras se escribe el mensaje, algo que en
    // pantallas pequeñas puede tardar varios segundos.
    hideMessageButton.hidden = false;
    themeToggle.hidden = false;
    typeMessage();
    window.setTimeout(() => intro.remove(), 1200);
}

button.addEventListener("click", openGarden, { once: true });
hideMessageButton.addEventListener("click", hideMessage, { once: true });
themeToggle.addEventListener("click", toggleTheme);
window.addEventListener("pagehide", () => window.clearInterval(petalsTimer), { once: true });
createStars();
