const button = document.getElementById("openButton");

const intro = document.querySelector(".intro");

const garden = document.getElementById("garden");

const starsContainer =
    document.querySelector(".stars");

const petalsContainer =
    document.getElementById("petals");

const firefliesContainer =
    document.getElementById("fireflies");


// ============================
// BOTÓN ABRIR
// ============================

button.addEventListener("click", () => {

    intro.style.opacity = "0";

    intro.style.transform =
        "scale(1.1)";

    intro.style.pointerEvents =
        "none";


    setTimeout(() => {

        intro.style.display =
            "none";

    }, 1200);


    garden.classList.add("show");


    // Crear campo

    createField();


    // Pétalos

    startPetals();


    // Luciérnagas

    createFireflies();

});


function createField() {

    const amount = 80;

    for (let i = 0; i < amount; i++) {

        createFlower(i);

    }

}

// ============================
// ESTRELLAS
// ============================

for (let i = 0; i < 120; i++) {

    const star =
        document.createElement("div");

    star.classList.add("star");

    star.style.left =
        Math.random() * 100 + "%";

    star.style.top =
        Math.random() * 100 + "%";

    const size =
        Math.random() * 3 + 1;

    star.style.width =
        size + "px";

    star.style.height =
        size + "px";

    star.style.animationDelay =
        Math.random() * 3 + "s";

    star.style.animationDuration =
        Math.random() * 2 + 1 + "s";

    starsContainer.appendChild(star);

}


// ============================
// PÉTALOS
// ============================

function createPetal() {

    const petal =
        document.createElement("div");

    petal.classList.add("falling-petal");

    petal.style.left =
        Math.random() * 100 + "vw";

    const duration =
        Math.random() * 5 + 5;

    petal.style.animationDuration =
        duration + "s";

    const size =
        Math.random() * 12 + 8;

    petal.style.width =
        size + "px";

    petal.style.height =
        size * 1.5 + "px";

    petalsContainer.appendChild(petal);

    setTimeout(() => {

        petal.remove();

    }, duration * 1000);

}


function startPetals() {

    setInterval(() => {

        createPetal();

    }, 500);

}


// ============================
// LUCIÉRNAGAS
// ============================

function createFireflies() {

    for (let i = 0; i < 20; i++) {

        const firefly =
            document.createElement("div");

        firefly.classList.add("firefly");

        firefly.style.left =
            Math.random() * 100 + "%";

        firefly.style.top =
            Math.random() * 100 + "%";

        firefly.style.animationDelay =
            Math.random() * 5 + "s";

        firefly.style.animationDuration =
            Math.random() * 5 + 5 + "s";

        firefliesContainer.appendChild(
            firefly
        );

    }

}

const field =
    document.getElementById("field");


function createFlower(index) {

    const flower =
        document.createElement("div");

    flower.classList.add("flower");


    // =========================
    // POSICIÓN
    // =========================

    const x =
        Math.random() * 100;

    flower.style.left =
        x + "%";


    // =========================
    // TAMAÑO
    // =========================

    const scale =
        Math.random() * 0.7 + 0.5;

    flower.style.transform =
        `scale(${scale})`;


    // =========================
    // PROFUNDIDAD
    // =========================

    const layer =
        Math.floor(scale * 10);

    flower.style.setProperty(
        "--layer",
        layer
    );


    // =========================
    // VELOCIDAD DEL VIENTO
    // =========================

    const swayDuration =
        Math.random() * 2 + 3;

    flower.style.setProperty(
        "--sway-duration",
        swayDuration + "s"
    );


    // =========================
    // RETRASO
    // =========================

    const delay =
        Math.random() * 4;

    flower.style.setProperty(
        "--delay",
        delay + "s"
    );


    // =========================
    // TALLO
    // =========================

    const stem =
        document.createElement("div");

    stem.classList.add(
        "flower-stem"
    );


    // =========================
    // HOJAS
    // =========================

    const leafLeft =
        document.createElement("div");

    leafLeft.classList.add(
        "flower-leaf",
        "left"
    );


    const leafRight =
        document.createElement("div");

    leafRight.classList.add(
        "flower-leaf",
        "right"
    );


    // =========================
    // CABEZA
    // =========================

    const head =
        document.createElement("div");

    head.classList.add(
        "flower-head"
    );


    // =========================
    // PÉTALOS
    // =========================

    for (let i = 0; i < 8; i++) {

        const petal =
            document.createElement("div");

        petal.classList.add(
            "flower-petal"
        );

        head.appendChild(petal);

    }


    // =========================
    // CENTRO
    // =========================

    const center =
        document.createElement("div");

    center.classList.add(
        "flower-center"
    );

    head.appendChild(center);


    // =========================
    // ARMAR FLOR
    // =========================

    flower.appendChild(stem);

    flower.appendChild(leafLeft);

    flower.appendChild(leafRight);

    flower.appendChild(head);


    field.appendChild(flower);

    
}