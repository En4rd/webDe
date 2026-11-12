const params = new URLSearchParams(window.location.search);
const albumId = params.get("album");
const titleNode = document.getElementById("albumTitle");
const dateNode = document.getElementById("albumDate");
const descNode = document.getElementById("albumDescription");
const grid = document.getElementById("photoGrid");
const empty = document.getElementById("emptyState");
const lightbox = document.getElementById("albumLightbox");
const lightboxImage = document.getElementById("lightboxImage");

function titleFromFolder(value) {
    const match = value.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
    const raw = (match ? match[1] : value).replace(/[-_]+/g, " ");
    return raw.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("es-MX"));
}

function themeFromId(value) {
    if (/viaje|vacacion|aventura/i.test(value)) return "travel";
    if (/cumple|birthday/i.test(value)) return "birthday";
    if (/aniversario|anniversary/i.test(value)) return "anniversary";
    return "romantic";
}

function dateFromId(value) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})-/);
    if (!match) return "Un recuerdo especial";
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(date.getTime())) return "Un recuerdo especial";
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

async function readAlbum() {
    const localResponse = await fetch("/__albums/" + encodeURIComponent(albumId), { cache: "no-store" }).catch(() => null);
    if (localResponse && localResponse.ok) {
        const data = await localResponse.json();
        return data.album;
    }

    const response = await fetch("recuerdos/albums.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar recuerdos/albums.json (" + response.status + ")");
    const data = await response.json();
    if (!Array.isArray(data.albums)) throw new Error("Formato de manifiesto inválido.");
    return data.albums.find((item) => item.id === albumId) || null;
}

function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
}

function openLightbox(image) {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.focus();
}

async function loadAlbum() {
    if (!albumId || !/^[a-zA-Z0-9_-]+$/.test(albumId)) {
        titleNode.textContent = "Recuerdo no encontrado";
        empty.hidden = false;
        empty.textContent = "El enlace del álbum no es válido.";
        return;
    }

    try {
        const album = await readAlbum();
        if (!album) {
            titleNode.textContent = "Recuerdo no encontrado";
            empty.hidden = false;
            empty.textContent = "Este álbum no existe o todavía no está publicado.";
            return;
        }

        document.body.dataset.album = themeFromId(album.id);
        titleNode.textContent = album.title || titleFromFolder(album.id);
        dateNode.textContent = album.date || dateFromId(album.id);
        descNode.textContent = album.description || "Cada fotografía guarda un pedacito de nuestra historia. 💛";
        document.title = titleNode.textContent + " | Nuestros recuerdos";
        empty.hidden = false;
        empty.textContent = "Cargando fotografías...";
        const photos = Array.isArray(album.photos) ? album.photos : [];
        grid.replaceChildren();

        photos.forEach((photo) => {
            const figure = document.createElement("figure");
            figure.className = "polaroid";
            const image = document.createElement("img");
            image.src = photo.src;
            image.alt = photo.caption || album.title || album.id;
            image.loading = "lazy";
            image.tabIndex = 0;
            image.addEventListener("click", () => openLightbox(image));
            image.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(image);
                }
            });
            image.addEventListener("error", () => {
                figure.remove();
                if (!grid.children.length) {
                    empty.hidden = false;
                    empty.textContent = "No se pudieron cargar las imágenes. Revisa los archivos del álbum.";
                }
            }, { once: true });
            const caption = document.createElement("figcaption");
            caption.textContent = photo.caption || "";
            figure.append(image, caption);
            grid.appendChild(figure);
        });

        empty.hidden = photos.length > 0;
        if (!photos.length) empty.textContent = "Aún no hay fotografías en esta carpeta. 💛";
    } catch (error) {
        console.error("Error al cargar el álbum:", error);
        empty.hidden = false;
        empty.textContent = "No pudimos cargar el álbum. Comprueba que el servidor local esté activo.";
    }
}

lightbox.addEventListener("click", closeLightbox);
lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        closeLightbox();
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});

loadAlbum();
