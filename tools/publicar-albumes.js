const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "recuerdos");
const OUTPUT = path.join(ROOT, "recuerdos-publicados");
const MANIFEST = path.join(SOURCE, "albums.json");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function titleFromFolder(id) {
    const match = id.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const name = (match ? match[2] : id).replace(/[-_]+/g, " ");
    return name.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("es-MX"));
}

function dateFromFolder(id) {
    const match = id.match(/^(\d{4})-(\d{2})-(\d{2})-/);
    if (!match) return "Un recuerdo especial";
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? "Un recuerdo especial" :
        date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function run() {
    fs.rmSync(OUTPUT, { recursive: true, force: true });
    fs.mkdirSync(OUTPUT, { recursive: true });
    const albums = fs.readdirSync(SOURCE, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^[a-zA-Z0-9_-]+$/.test(entry.name))
        .filter((entry) => fs.existsSync(path.join(SOURCE, entry.name, ".published")))
        .map((entry) => {
            const id = entry.name;
            const sourceFolder = path.join(SOURCE, id);
            const targetFolder = path.join(OUTPUT, id);
            let metadata = {};
            const metadataPath = path.join(sourceFolder, ".album.json");
            if (fs.existsSync(metadataPath)) {
                try { metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8")); }
                catch { throw new Error("El archivo .album.json de " + id + " no contiene JSON válido."); }
            }
            fs.mkdirSync(targetFolder, { recursive: true });
            const photos = fs.readdirSync(sourceFolder, { withFileTypes: true })
                .filter((file) => file.isFile() && IMAGE_EXTENSIONS.has(path.extname(file.name).toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }))
                .map((file) => {
                    fs.copyFileSync(path.join(sourceFolder, file.name), path.join(targetFolder, file.name));
                    return {
                        src: "recuerdos-publicados/" + encodeURIComponent(id) + "/" + encodeURIComponent(file.name),
                        caption: path.basename(file.name, path.extname(file.name)).replace(/[-_]+/g, " ")
                    };
                });
            return {
                id,
                title: metadata.title || titleFromFolder(id),
                date: metadata.date || dateFromFolder(id),
                description: metadata.description || "Cada fotografía guarda un pedacito de nuestra historia. 💛",
                cover: metadata.cover ? "recuerdos-publicados/" + id + "/" + path.basename(metadata.cover) : "",
                photos
            };
        });
    fs.writeFileSync(MANIFEST, JSON.stringify({ albums }, null, 2) + "\n", "utf8");
    console.log("Publicación preparada.");
    console.log("Álbumes seleccionados: " + albums.length);
    console.log("Fotografías copiadas: " + albums.reduce((sum, album) => sum + album.photos.length, 0));
    console.log("Ahora revisa git status y haz commit/push cuando estés listo.");
}

try { run(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
