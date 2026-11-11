const button = document.getElementById("openButton");
const intro = document.querySelector(".intro");
const garden = document.getElementById("garden");
const field = document.getElementById("field");
const petalsContainer = document.getElementById("petals");
const insectsContainer = document.getElementById("insects");
const message = document.querySelector(".message");
const hideMessageButton = document.getElementById("hideMessageButton");
const settingsToggle = document.getElementById("settingsToggle");
const storyToggle = document.getElementById("storyToggle");
const memoriesToggle = document.getElementById("memoriesToggle");
const memoriesPage = document.getElementById("memoriesPage");
const memoriesBackButton = document.getElementById("memoriesBackButton");
const memoryAlbumGrid = document.getElementById("memoryAlbumGrid");
const memoryGallery = document.getElementById("memoryGallery");
const memoryGalleryBack = document.getElementById("memoryGalleryBack");
const memoryGalleryTitle = document.getElementById("memoryGalleryTitle");
const memoryGalleryDate = document.getElementById("memoryGalleryDate");
const memoryGalleryDescription = document.getElementById("memoryGalleryDescription");
const memoryPhotoGrid = document.getElementById("memoryPhotoGrid");
const memoryEmptyNote = document.getElementById("memoryEmptyNote");
const settingsMenu = document.getElementById("settingsMenu");
const lovePage = document.getElementById("lovePage");
const loveBackButton = document.getElementById("loveBackButton");
const relationshipCounter = document.getElementById("relationshipCounter");
const relationshipStartDate = new Date(2026, 6, 11);
const themeToggle = document.getElementById("themeToggle");
const musicToggle = document.getElementById("musicToggle");
const songInfoToggle = document.getElementById("songInfoToggle");
const songInfoCard = document.getElementById("songInfoCard");
const volumeControl = document.getElementById("volumeControl");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const backgroundMusic = document.getElementById("backgroundMusic");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let isOpen = false;
let petalsTimer;
let typingRun = 0;
const messageLines = [...message.querySelectorAll("h2, p, span")].map((element) => ({
    element,
    text: element.textContent.trim(),
}));


/*
 * Álbumes locales:
 * En el servidor Node se descubren directamente las carpetas de recuerdos/.
 * En producción se utiliza el manifiesto generado por tools/publicar-albumes.js.
 */
let memoryAlbums = [];

async function loadMemoryAlbums() {
    try {
        const localResponse = await fetch("/__albums", { cache: "no-store" });
        if (localResponse.ok) {
            const localData = await localResponse.json();
            if (Array.isArray(localData.albums)) return localData.albums;
        }
    } catch (error) {
        // En GitHub Pages no existe la API local; se usa el manifiesto publicado.
    }

    const response = await fetch("recuerdos/albums.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo leer recuerdos/albums.json (" + response.status + ")");
    const data = await response.json();
    if (!Array.isArray(data.albums)) throw new Error("El manifiesto debe contener un arreglo albums.");
    return data.albums;
}

async function discoverMemoryAlbums() {
    memoryAlbumGrid.setAttribute("aria-busy", "true");
    memoryAlbumGrid.textContent = "Buscando carpetas y fotografías...";
    try {
        memoryAlbums = await loadMemoryAlbums();
        renderMemoryAlbums();
    } catch (error) {
        console.error("Error al cargar los álbumes:", error);
        memoryAlbumGrid.textContent = "No pudimos cargar los recuerdos. Inicia el servidor local con: node tools/dev-server.js";
    } finally {
        memoryAlbumGrid.removeAttribute("aria-busy");
    }
}

function renderMemoryAlbums() {
    memoryAlbumGrid.replaceChildren();
    if (!memoryAlbums.length) {
        memoryAlbumGrid.textContent = "Todavía no hay álbumes. Crea una carpeta dentro de recuerdos/ y agrega tus fotografías.";
        return;
    }

    memoryAlbums.forEach((album) => {
        const card = document.createElement("article");
        card.className = "memory-album-card";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "memory-album-open";
        openButton.setAttribute("aria-label", "Abrir álbum " + album.title);

        const preview = document.createElement("span");
        preview.className = "memory-album-preview";
        const photos = Array.isArray(album.photos) ? album.photos : [];
        const cover = album.cover || (photos[0] && photos[0].src);
        if (cover) {
            const image = document.createElement("img");
            image.src = cover;
            image.alt = "";
            image.loading = "lazy";
            image.onerror = () => { image.remove(); preview.textContent = "📷"; };
            preview.appendChild(image);
        } else {
            preview.textContent = "📷";
        }

        const title = document.createElement("span");
        title.className = "memory-album-title";
        title.textContent = album.title;
        const date = document.createElement("span");
        date.className = "memory-album-date";
        date.textContent = album.date || (album.photos.length + " fotografías");
        openButton.append(preview, title, date);
        openButton.addEventListener("click", () => {
            window.location.href = "album.html?album=" + encodeURIComponent(album.id);
        });
        card.appendChild(openButton);

        if (album.local) {
            const publishButton = document.createElement("button");
            publishButton.type = "button";
            publishButton.className = "memory-publish-toggle";
            publishButton.textContent = album.published ? "✓ Publicado · Retirar" : "＋ Publicar álbum";
            publishButton.setAttribute("aria-pressed", String(Boolean(album.published)));
            publishButton.addEventListener("click", async () => {
                publishButton.disabled = true;
                try {
                    const response = await fetch("/__albums/" + encodeURIComponent(album.id) + "/publication", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ published: !album.published })
                    });
                    if (!response.ok) throw new Error("No se pudo cambiar el estado de publicación.");
                    await discoverMemoryAlbums();
                } catch (error) {
                    console.error(error);
                    publishButton.textContent = "Error · Reintentar";
                    publishButton.disabled = false;
                }
            });
            card.appendChild(publishButton);
        }

        memoryAlbumGrid.appendChild(card);
    });
}

function openMemoryAlbum(albumId) {
    window.location.href = "album.html?album=" + encodeURIComponent(albumId);
}

function showMemoriesPage() {
    settingsMenu.hidden = true;
    settingsToggle.setAttribute("aria-expanded", "false");
    memoriesPage.hidden = false;
    garden.classList.add("memories-page-open");
    document.body.classList.add("memories-route-open");
    memoryAlbumGrid.hidden = false;
    memoryGallery.hidden = true;
    discoverMemoryAlbums();
    if (window.location.hash !== "#recuerdos") {
        history.pushState({ page: "memories" }, "", "#recuerdos");
    }
    memoriesPage.scrollTo({ top: 0, behavior: "instant" });
    memoriesBackButton.focus();
}

function hideMemoriesPage(updateHistory = true) {
    memoriesPage.hidden = true;
    garden.classList.remove("memories-page-open");
    document.body.classList.remove("memories-route-open");
    if (updateHistory && window.location.hash.startsWith("#recuerdos")) {
        history.replaceState({ page: "garden" }, "", window.location.pathname + window.location.search);
    }
    memoriesToggle.focus();
}

function syncMemoriesRoute() {
    const isMemoriesRoute = window.location.hash === "#recuerdos" || window.location.hash.startsWith("#recuerdos/");
    if (!isOpen || !isMemoriesRoute) {
        memoriesPage.hidden = true;
        garden.classList.remove("memories-page-open");
        document.body.classList.remove("memories-route-open");
        return;
    }
    memoriesPage.hidden = false;
    garden.classList.add("memories-page-open");
    document.body.classList.add("memories-route-open");
    memoryAlbumGrid.hidden = false;
    memoryGallery.hidden = true;
    discoverMemoryAlbums();
}
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
            ${'<div class="flower-petal"></div>'.repeat(8)}
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
    lovePage.classList.toggle("night-mode", isNightMode);
    themeToggle.setAttribute("aria-pressed", String(isNightMode));
    themeToggle.setAttribute("aria-label", isNightMode ? "Activar modo de día" : "Activar modo nocturno");
    themeToggle.querySelector("span").textContent = isNightMode ? "Modo de día" : "Modo nocturno";
    themeToggle.firstChild.textContent = isNightMode ? "☀️ " : "🌙 ";
}

function updateMusicButton() {
    const isMuted = backgroundMusic.muted;
    musicToggle.firstChild.textContent = isMuted ? "🔇 " : "🔊 ";
    musicToggle.querySelector("span").textContent = isMuted ? "Activar sonido" : "Silenciar música";
    musicToggle.setAttribute("aria-pressed", String(isMuted));
    musicToggle.setAttribute("aria-label", isMuted ? "Activar sonido" : "Silenciar música");
    musicToggle.title = isMuted ? "Activar sonido" : "Silenciar música";
}

function toggleMusic() {
    backgroundMusic.muted = !backgroundMusic.muted;
    updateMusicButton();
}

function updateVolume() {
    const volume = Number(volumeSlider.value);
    backgroundMusic.volume = volume / 100;
    volumeValue.value = `${volume}%`;
    volumeValue.textContent = `${volume}%`;
    volumeSlider.setAttribute("aria-valuetext", `${volume}%`);

    // Al subir el volumen desde cero, vuelve a habilitar el sonido.
    if (volume > 0) {
        backgroundMusic.muted = false;
        updateMusicButton();
    }
}

function startBackgroundMusic() {
    // Inicia discretamente al 1%; el usuario puede ajustarlo desde el menú de ajustes.
    updateVolume();
    backgroundMusic.currentTime = 7;
    const playback = backgroundMusic.play();
    if (playback && typeof playback.catch === "function") {
        playback.catch((error) => {
            // La canción debe existir en audio/cancion.mp3; no interrumpir la experiencia si falta.
            console.warn("No se pudo iniciar la música. Verifica audio/cancion.mp3.", error);
        });
    }
}

function updateRelationshipCounter() {
    const now = new Date();
    if (now < relationshipStartDate) {
        relationshipCounter.textContent = "0-0-0";
        return;
    }

    let years = now.getFullYear() - relationshipStartDate.getFullYear();
    let months = now.getMonth() - relationshipStartDate.getMonth();
    let days = now.getDate() - relationshipStartDate.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    relationshipCounter.textContent = `${years}-${months}-${days}`;
}

function showLovePage() {
    settingsMenu.hidden = true;
    settingsToggle.setAttribute("aria-expanded", "false");
    settingsToggle.setAttribute("aria-label", "Abrir ajustes");
    settingsToggle.title = "Ajustes";
    lovePage.hidden = false;
    garden.classList.add("love-page-open");
    document.body.classList.add("love-route-open");
    history.pushState({ page: "love" }, "", "#nuestro-tiempo");
    updateRelationshipCounter();
    loveBackButton.focus();
}

function hideLovePage(updateHistory = true) {
    lovePage.hidden = true;
    garden.classList.remove("love-page-open");
    document.body.classList.remove("love-route-open");
    if (updateHistory && window.location.hash === "#nuestro-tiempo") {
        history.replaceState({ page: "garden" }, "", window.location.pathname + window.location.search);
    }
    storyToggle.focus();
}

function syncPageWithRoute() {
    if (window.location.hash === "#nuestro-tiempo" && isOpen) {
        lovePage.hidden = false;
        garden.classList.add("love-page-open");
        document.body.classList.add("love-route-open");
        updateRelationshipCounter();
    } else {
        lovePage.hidden = true;
        garden.classList.remove("love-page-open");
        document.body.classList.remove("love-route-open");
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
    settingsToggle.hidden = false;
    storyToggle.hidden = false;
    memoriesToggle.hidden = false;
    settingsMenu.hidden = true;
    startBackgroundMusic();
    typeMessage();
    if (window.location.hash.startsWith("#recuerdos")) {
        syncMemoriesRoute();
    } else if (window.location.hash === "#nuestro-tiempo") {
        syncPageWithRoute();
    }
    window.setTimeout(() => intro.remove(), 1200);
}

button.addEventListener("click", openGarden, { once: true });
hideMessageButton.addEventListener("click", hideMessage);
storyToggle.addEventListener("click", showLovePage);
loveBackButton.addEventListener("click", () => hideLovePage());
window.addEventListener("popstate", () => { syncPageWithRoute(); syncMemoriesRoute(); });
window.addEventListener("hashchange", () => { syncPageWithRoute(); syncMemoriesRoute(); });
memoriesToggle.addEventListener("click", showMemoriesPage);
memoriesBackButton.addEventListener("click", () => hideMemoriesPage());
memoryGalleryBack.addEventListener("click", () => {
    memoryGallery.hidden = true;
    memoryAlbumGrid.hidden = false;
    history.pushState({ page: "memories" }, "", "#recuerdos");
    memoriesPage.scrollTo({ top: 0, behavior: "smooth" });
});
window.setInterval(updateRelationshipCounter, 60 * 60 * 1000);
themeToggle.addEventListener("click", toggleTheme);
musicToggle.addEventListener("click", toggleMusic);
const songPlayerButton = document.getElementById("songPlayerButton");
const songProgressFill = document.getElementById("songProgressFill");
const songCurrentTime = document.getElementById("songCurrentTime");
const songDuration = document.getElementById("songDuration");

function formatSongTime(seconds) {
    if (!Number.isFinite(seconds)) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

function updateSongPlayer() {
    const duration = backgroundMusic.duration;
    const currentTime = backgroundMusic.currentTime;
    songCurrentTime.textContent = formatSongTime(currentTime);
    songDuration.textContent = formatSongTime(duration);
    songProgressFill.style.width = Number.isFinite(duration) && duration > 0
        ? `${Math.min(100, (currentTime / duration) * 100)}%`
        : "0%";
    const isPlaying = !backgroundMusic.paused;
    songPlayerButton.textContent = isPlaying ? "Ⅱ" : "▶";
    songPlayerButton.setAttribute("aria-label", isPlaying ? "Pausar canción" : "Reproducir canción");
    songPlayerButton.title = isPlaying ? "Pausar canción" : "Reproducir canción";
}

songInfoToggle.addEventListener("click", () => {
    const isExpanded = songInfoToggle.getAttribute("aria-expanded") === "true";
    songInfoToggle.setAttribute("aria-expanded", String(!isExpanded));
    songInfoCard.hidden = isExpanded;
    if (!isExpanded) updateSongPlayer();
});

songPlayerButton.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
        try {
            await backgroundMusic.play();
        } catch (error) {
            console.error("No se pudo reproducir la canción:", error);
        }
    } else {
        backgroundMusic.pause();
    }
    updateSongPlayer();
});

backgroundMusic.addEventListener("play", updateSongPlayer);
backgroundMusic.addEventListener("pause", updateSongPlayer);
backgroundMusic.addEventListener("timeupdate", updateSongPlayer);
backgroundMusic.addEventListener("loadedmetadata", updateSongPlayer);
backgroundMusic.addEventListener("ended", updateSongPlayer);
settingsToggle.addEventListener("click", () => {
    const isExpanded = settingsToggle.getAttribute("aria-expanded") === "true";
    settingsToggle.setAttribute("aria-expanded", String(!isExpanded));
    settingsToggle.setAttribute("aria-label", isExpanded ? "Abrir ajustes" : "Cerrar ajustes");
    settingsToggle.title = isExpanded ? "Ajustes" : "Cerrar ajustes";
    settingsMenu.hidden = isExpanded;
});
document.addEventListener("click", (event) => {
    if (settingsMenu.hidden) return;
    if (!settingsMenu.contains(event.target) && !settingsToggle.contains(event.target)) {
        settingsMenu.hidden = true;
        settingsToggle.setAttribute("aria-expanded", "false");
        settingsToggle.setAttribute("aria-label", "Abrir ajustes");
        settingsToggle.title = "Ajustes";
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || settingsMenu.hidden) return;
    settingsMenu.hidden = true;
    settingsToggle.setAttribute("aria-expanded", "false");
    settingsToggle.setAttribute("aria-label", "Abrir ajustes");
    settingsToggle.title = "Ajustes";
    settingsToggle.focus();
});
volumeSlider.addEventListener("input", updateVolume);
window.addEventListener("pagehide", () => {
    window.clearInterval(petalsTimer);
    backgroundMusic.pause();
}, { once: true });
createStars();
