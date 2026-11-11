# Álbumes de recuerdos (flujo local)

## Crear álbumes y verlos en local

1. Crea una carpeta dentro de `recuerdos/`, por ejemplo `recuerdos/2027-02-14-san-valentin/`.
2. Copia tus fotografías dentro. Se admiten JPG, JPEG, PNG, WebP, GIF y AVIF.
3. En la terminal de VS Code, desde la raíz del proyecto, ejecuta:

```powershell
node tools/dev-server.js
```

4. Abre http://127.0.0.1:5501.

El servidor detecta las carpetas y fotografías directamente. No tienes que editar JavaScript ni albums.json. Actualiza el navegador para ver archivos recién agregados. La primera imagen alfabética se usa como portada.

## Nombre, fecha y descripción opcionales

Si quieres personalizar un álbum, crea dentro de su carpeta un archivo `.album.json`:

```json
{
  "title": "Nuestro día especial",
  "date": "14 de febrero de 2027",
  "description": "Un recuerdo que quiero conservar."
}
```

Si no existe, el título se obtiene del nombre de la carpeta. Si el nombre empieza con AAAA-MM-DD-, también se obtiene la fecha.

## Publicar solo los álbumes que elijas

En la página local, cada álbum tiene un botón **Publicar álbum**. Al seleccionarlo, solo se marca para publicación; todavía no se suben fotos ni se hace ningún commit.

Cuando estés listo, ejecuta:

```powershell
node tools/publicar-albumes.js
```

Este comando copia únicamente los álbumes marcados como publicados a `recuerdos-publicados/` y genera `recuerdos/albums.json`. Los álbumes originales dentro de `recuerdos/` están excluidos de Git por `.gitignore`, así que las fotos privadas no se agregan accidentalmente con un `git add .`.

Después revisa los cambios:

```powershell
git status
```

Solo los archivos de `recuerdos-publicados/` y el manifiesto generado se preparan para que los publiques con commit y push. Si retiras un álbum en la interfaz local, vuelve a ejecutar el comando para quitarlo de la versión preparada.

## Importante

- Usa `node tools/dev-server.js` para la prueba local. Live Server por sí solo no puede listar carpetas del disco ni guardar el estado de publicación.
- Detén el servidor con Ctrl+C.
- No edites manualmente `recuerdos/albums.json`: lo genera el script de publicación.
- Los archivos originales permanecen en tu computadora. El proceso de preparación de publicación hace copias, no mueve ni elimina las fotos originales.
