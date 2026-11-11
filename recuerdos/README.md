# Álbumes de recuerdos

Cada colección tiene su propia página HTML y un fondo temático. Las fotografías se guardan en este repositorio.

## Páginas
- `recuerdos/nuestro-comienzo/index.html`
- `recuerdos/primer-viaje/index.html`
- `recuerdos/cumpleanos/index.html`
- `recuerdos/aniversarios/index.html`

## Cómo agregar fotografías

1. Sube las imágenes a la carpeta del evento correspondiente. Usa JPG, PNG o WebP optimizados para web.
2. Abre el archivo raíz `album.js` y busca el álbum deseado.
3. Agrega las rutas y los pies de foto en su arreglo `photos`. Ejemplo:

```js
"nuestro-comienzo": {
  title: "Nuestro comienzo",
  date: "11 de julio de 2026",
  description: "El inicio de nuestra historia.",
  photos: [
    { src: "recuerdos/nuestro-comienzo/foto-01.jpg", caption: "Nuestro primer recuerdo" },
    { src: "recuerdos/nuestro-comienzo/foto-02.jpg", caption: "Un día especial" }
  ]
}
```

4. Para cambiar la portada que aparece en la tarjeta del índice de recuerdos, edita la propiedad `cover` del álbum correspondiente en `script.js`, usando la ruta de la imagen.

Los nombres de archivo y las rutas distinguen mayúsculas y minúsculas. Evita espacios y acentos en los nombres de archivo.
