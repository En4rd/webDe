const albums={
"nuestro-comienzo":{title:"Nuestro comienzo",date:"11 de julio de 2026",description:"El inicio de una historia que quiero seguir escribiendo contigo. 💛",photos:[]},
"primer-viaje":{title:"Nuestro primer viaje",date:"Una aventura por recordar",description:"Lugares nuevos, momentos juntos y recuerdos para siempre.",photos:[]},
"cumpleanos":{title:"Cumpleaños",date:"Días especiales",description:"Celebrando tu vida y todos los momentos que nos regala.",photos:[]},
"aniversarios":{title:"Nuestros aniversarios",date:"Un año más de historias",description:"Cada fecha especial merece quedarse en fotografías.",photos:[]}
};
const id=document.body.dataset.album;const album=albums[id];
if(album){
document.title=album.title+" | Nuestros recuerdos";
document.getElementById("albumTitle").textContent=album.title;
document.getElementById("albumDate").textContent=album.date;
document.getElementById("albumDescription").textContent=album.description;
const grid=document.getElementById("photoGrid");
const empty=document.getElementById("emptyState");
empty.hidden=album.photos.length>0;
album.photos.forEach(photo=>{const figure=document.createElement("figure");figure.className="polaroid";const img=document.createElement("img");img.src=photo.src;img.alt=photo.caption||album.title;img.loading="lazy";img.addEventListener("click",()=>{lightboxImage.src=photo.src;lightbox.classList.add("open");lightbox.setAttribute("aria-hidden","false")});const caption=document.createElement("figcaption");caption.textContent=photo.caption||"";figure.append(img,caption);grid.appendChild(figure)});
}
const lightbox=document.getElementById("albumLightbox"),lightboxImage=document.getElementById("lightboxImage");
lightbox.addEventListener("click",()=>{lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");lightboxImage.removeAttribute("src")});
