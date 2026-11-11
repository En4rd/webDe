# Álbumes de recuerdos

Los álbumes se administran desde `albums.json`. Así funcionan tanto en tu servidor local como en GitHub Pages, sin depender de que el navegador pueda listar carpetas del disco.

## Agregar fotografías

1. Crea una carpeta para el álbum dentro de `recuerdos/`, por ejemplo `recuerdos/nuestro-comienzo/`.
2. Copia las imágenes dentro de esa carpeta.
3. Abre `recuerdos/albums.json` y agrega sus rutas al arreglo `photos` del álbum correspondiente:

```json
{
  "id": "nuestro-comienzo",
  "title": "Nuestro comienzo",
  "date": "11 de julio de 2026",
  "description": "El inicio de nuestra historia. 💛",
  "cover": "recuerdos/nuestro-comienzo/foto-01.jpg",
  "photos": [
    { "src": "recuerdos/nuestro-comienzo/foto-01.jpg", "caption": "Nuestro primer recuerdo" },
    { "src": "recuerdos/nuestro-comienzo/foto-02.jpg", "caption": "Un día especial" }
  ]
}
```

El campo `cover` es opcional: si no lo indicas, se usa la primera fotografía. Formatos recomendados: JPG, JPEG, PNG, WebP y GIF. Las rutas son relativas a la raíz del sitio.

## Crear otro álbum

Agrega otro objeto al arreglo `albums` de `albums.json`. El `id` debe ser único y contener solo letras, números, guiones o guiones bajos. Ejemplo: `2027-02-14-san-valentin`.

## Probar en Windows

No abras `index.html` con doble clic: el navegador puede bloquear la lectura de archivos JSON mediante `fetch`.

Desde la terminal de VS Code, en la carpeta raíz del proyecto, ejecuta:

```powershell
py -m http.server 5500
```

Abre `http://localhost:5500`. También puedes usar la extensión Live Server de VS Code.

**Importante:** guarda las imágenes dentro del proyecto y registra sus rutas en `photos` en `albums.json`. Los servidores estáticos no permiten descubrir automáticamente los archivos de una carpeta local. Si `photos` está vacío, el álbum intenta consultar las fotos publicadas en GitHub como alternativa.
