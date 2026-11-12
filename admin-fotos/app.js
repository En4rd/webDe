import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const setupNotice = $("setupNotice");
const loginView = $("loginView");
const dashboardView = $("dashboardView");
const loginForm = $("loginForm");
const loginError = $("loginError");
const albumList = $("albumList");
const dashboardError = $("dashboardError");
let auth, db, storage, currentUser;
let albums = [];
let installPrompt = null;

const configReady = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;
if (!configReady) {
  setupNotice.hidden = false;
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    loginView.hidden = Boolean(user);
    dashboardView.hidden = !user;
    if (!user) return;
    $("signedInAs").textContent = "Sesión: " + user.email;
    await verifyAdminAndLoad();
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const button = loginForm.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
    loginForm.reset();
  } catch (error) {
    loginError.textContent = friendlyAuthError(error);
  } finally {
    button.disabled = false;
  }
});

$("logoutButton").addEventListener("click", () => signOut(auth));
$("albumForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  $("albumFormMessage").textContent = "Creando álbum...";
  try {
    const title = $("albumTitle").value.trim();
    const dateValue = $("albumDate").value;
    const date = dateValue ? new Date(dateValue + "T12:00:00").toLocaleDateString("es-MX", { day:"numeric", month:"long", year:"numeric" }) : "Un recuerdo especial";
    await addDoc(collection(db, "albums"), {
      title, date, dateValue, description: $("albumDescription").value.trim(),
      published: false, createdBy: currentUser.uid,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    form.reset();
    $("albumFormMessage").textContent = "Álbum creado. Ahora puedes agregar fotografías.";
    await loadAlbums();
  } catch (error) {
    $("albumFormMessage").textContent = "No se pudo crear el álbum: " + error.message;
  } finally {
    submit.disabled = false;
  }
});

async function verifyAdminAndLoad() {
  dashboardError.textContent = "";
  try {
    await loadAlbums();
  } catch (error) {
    console.error(error);
    dashboardError.textContent = "Esta cuenta todavía no tiene permisos de administrador o no se pudo conectar. Revisa la configuración y las reglas de Firebase.";
    await signOut(auth);
  }
}

async function loadAlbums() {
  const result = await getDocs(query(collection(db, "albums"), orderBy("updatedAt", "desc")));
  albums = result.docs.map((item) => ({ id: item.id, ...item.data() }));
  await renderAlbums();
}

async function renderAlbums() {
  albumList.replaceChildren();
  $("albumCount").textContent = albums.length + (albums.length === 1 ? " álbum" : " álbumes");
  if (!albums.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Todavía no hay álbumes. Crea el primero para comenzar. 💛";
    albumList.append(empty);
    return;
  }

  for (const album of albums) {
    const card = document.createElement("article");
    card.className = "album-card";
    const photosSnapshot = await getDocs(collection(db, "albums", album.id, "photos"));
    const photos = photosSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const head = document.createElement("div");
    head.className = "album-card-head";
    const info = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = album.title || "Álbum sin título";
    const meta = document.createElement("p");
    meta.className = "album-meta";
    meta.textContent = (album.date || "Sin fecha") + " · " + photos.length + (photos.length === 1 ? " fotografía" : " fotografías");
    info.append(title, meta);
    const status = document.createElement("span");
    status.className = "pill" + (album.published ? " public" : "");
    status.textContent = album.published ? "Público" : "Privado";
    head.append(info, status);
    card.append(head);

    const actions = document.createElement("div");
    actions.className = "album-actions";
    const uploadLabel = document.createElement("label");
    uploadLabel.className = "upload-label";
    uploadLabel.textContent = "＋ Agregar fotos";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/jpeg,image/png,image/webp,image/gif,image/avif";
    fileInput.multiple = true;
    fileInput.addEventListener("change", async () => {
      if (!fileInput.files?.length) return;
      uploadLabel.textContent = "Subiendo...";
      uploadLabel.style.pointerEvents = "none";
      try {
        await uploadPhotos(album.id, fileInput.files);
        await loadAlbums();
      } catch (error) {
        dashboardError.textContent = "Error al subir fotografías: " + error.message;
      } finally {
        uploadLabel.textContent = "＋ Agregar fotos";
        uploadLabel.style.pointerEvents = "";
        fileInput.value = "";
      }
    });
    uploadLabel.append(fileInput);
    const publishButton = document.createElement("button");
    publishButton.type = "button";
    publishButton.className = "button " + (album.published ? "button-unpublish" : "button-publish");
    publishButton.textContent = album.published ? "Retirar publicación" : "Publicar álbum";
    publishButton.addEventListener("click", async () => {
      publishButton.disabled = true;
      try {
        await updateDoc(doc(db, "albums", album.id), { published: !album.published, updatedAt: serverTimestamp() });
        await loadAlbums();
      } catch (error) {
        dashboardError.textContent = "No se pudo cambiar la publicación: " + error.message;
        publishButton.disabled = false;
      }
    });
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button button-danger";
    deleteButton.textContent = "Eliminar álbum";
    deleteButton.addEventListener("click", async () => {
      if (!confirm('¿Eliminar "' + album.title + '" y todas sus fotografías? Esta acción no se puede deshacer.')) return;
      deleteButton.disabled = true;
      try {
        for (const photo of photos) {
          if (photo.storagePath) await deleteObject(ref(storage, photo.storagePath));
          await deleteDoc(doc(db, "albums", album.id, "photos", photo.id));
        }
        await deleteDoc(doc(db, "albums", album.id));
        await loadAlbums();
      } catch (error) {
        dashboardError.textContent = "No se pudo eliminar el álbum: " + error.message;
        deleteButton.disabled = false;
      }
    });
    actions.append(uploadLabel, publishButton, deleteButton);
    card.append(actions);

    const photoGrid = document.createElement("div");
    photoGrid.className = "photo-list";
    for (const photo of photos) {
      const item = document.createElement("div");
      item.className = "photo-item";
      const image = document.createElement("img");
      image.src = photo.url;
      image.alt = photo.caption || "Fotografía del álbum";
      image.loading = "lazy";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Eliminar fotografía");
      remove.addEventListener("click", async () => {
        if (!confirm("¿Eliminar esta fotografía?")) return;
        remove.disabled = true;
        try {
          if (photo.storagePath) await deleteObject(ref(storage, photo.storagePath));
          await deleteDoc(doc(db, "albums", album.id, "photos", photo.id));
          await loadAlbums();
        } catch (error) {
          dashboardError.textContent = "No se pudo eliminar la fotografía: " + error.message;
          remove.disabled = false;
        }
      });
      const caption = document.createElement("p");
      caption.className = "photo-caption";
      caption.textContent = photo.caption || "Fotografía";
      item.append(image, remove, caption);
      photoGrid.append(item);
    }
    if (photos.length) card.append(photoGrid);
    albumList.append(card);
  }
}

async function uploadPhotos(albumId, files) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
  for (const file of Array.from(files)) {
    if (!allowed.has(file.type)) throw new Error(file.name + " no es un formato de imagen permitido.");
    if (file.size > 15 * 1024 * 1024) throw new Error(file.name + " supera el límite de 15 MB.");
    const photoRef = doc(collection(db, "albums", albumId, "photos"));
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = "albums/" + albumId + "/" + photoRef.id + "_" + safeName;
    const destination = ref(storage, storagePath);
    await uploadBytes(destination, file, { contentType: file.type });
    const url = await getDownloadURL(destination);
    await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js").then(({ setDoc }) =>
      setDoc(photoRef, {
        url, storagePath, caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        fileName: file.name, contentType: file.type, size: file.size, createdAt: serverTimestamp()
      })
    );
  }
  await updateDoc(doc(db, "albums", albumId), { updatedAt: serverTimestamp() });
}

function friendlyAuthError(error) {
  if (["auth/invalid-credential","auth/wrong-password","auth/user-not-found"].includes(error.code)) return "Correo o contraseña incorrectos.";
  if (error.code === "auth/too-many-requests") return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  return "No se pudo iniciar sesión. " + (error.message || "");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  $("installButton").hidden = false;
});
$("installButton").addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  $("installButton").hidden = true;
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
}
