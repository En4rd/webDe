# Álbum de recuerdos

Las fotografías se guardan directamente en este repositorio.

## Cómo agregar fotografías

1. Sube tus imágenes a la carpeta del evento correspondiente:
   - `recuerdos/nuestro-comienzo/`
   - `recuerdos/primer-viaje/`
   - `recuerdos/cumpleanos/`
   - `recuerdos/aniversarios/`
2. Abre `script.js` y busca el arreglo `memoryAlbums`.
3. En el evento correspondiente, agrega las rutas al arreglo `photos`. Ejemplo:

```js
photos: [
    { src: "recuerdos/nuestro-comienzo/foto-01.jpg", caption: "Nuestro primer recuerdo" },
    { src: "recuerdos/nuestro-comienzo/foto-02.jpg", caption: "Un día especial" }
]
```

4. Opcionalmente, asigna una portada en `cover`:
   `cover: "recuerdos/nuestro-comienzo/foto-01.jpg"`

Las rutas distinguen mayúsculas y minúsculas. Usa nombres de archivo sencillos, sin espacios ni acentos. Se recomiendan JPG o WebP optimizados para web.
