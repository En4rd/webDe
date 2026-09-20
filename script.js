const button = document.getElementById("openButton");
const intro = document.querySelector(".intro");
const garden = document.getElementById("garden");
const field = document.getElementById("field");
const petalsContainer = document.getElementById("petals");
const firefliesContainer = document.getElementById("fireflies");
const message = document.querySelector(".message");
const messageToggle = document.getElementById("messageToggle");
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
    const isMobile = window.innerWidth < 700;
    const flowerCount = isMobile ? 20 : 70;

    for (let index = 0; index < flowerCount; index += 1) {
        const flower = createFlower();

        if (isMobile) {
            const spacing = 100 / flowerCount;
            flower.style.left = `${(index + .5) * spacing + randomBetween(-1.4, 1.4)}%`;
        }

        fragment.appendChild(flower);
    }

    field.replaceChildren(fragment);
}

function createFireflies() {
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < 16; index += 1) {
        const firefly = document.createElement("i");
        firefly.className = "firefly";
        firefly.style.cssText = `left:${randomBetween(0, 100)}%;top:${randomBetween(15, 85)}%;animation-delay:${randomBetween(0, 5)}s;animation-duration:${randomBetween(5, 10)}s`;
        fragment.appendChild(firefly);
    }

    firefliesContainer.replaceChildren(fragment);
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
    });

    if (reduceMotion) {
        lines.forEach(({ element, text }) => {
            element.textContent = text;
        });
        return;
    }

    await wait(700);
    message.classList.add("is-typing");

    for (const { element, text } of lines) {
        for (const character of text) {
            element.textContent += character;
            await wait(character === " " ? 18 : 32);
        }
        await wait(220);
    }

    message.classList.remove("is-typing");
}

function openGarden() {
    if (isOpen) return;
    isOpen = true;
    button.disabled = true;
    intro.classList.add("is-hidden");
    garden.classList.add("show");
    createField();
    createFireflies();
    startPetals();
    typeMessage();
    window.setTimeout(() => intro.remove(), 1200);
}

function toggleMessage() {
    const isHidden = message.classList.toggle("is-hidden");
    messageToggle.setAttribute("aria-pressed", String(isHidden));
    messageToggle.textContent = isHidden ? "Mostrar mensaje" : "Ocultar mensaje";
}

button.addEventListener("click", openGarden, { once: true });
messageToggle.addEventListener("click", toggleMessage);
window.addEventListener("pagehide", () => window.clearInterval(petalsTimer), { once: true });
createStars();
