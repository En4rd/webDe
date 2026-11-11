# Crear recuerdos automáticamente

No necesitas editar JavaScript para añadir eventos ni fotos.

1. Abre la carpeta `recuerdos/` en GitHub.
2. Crea una carpeta con el formato `AAAA-MM-DD-nombre-del-evento`. Ejemplo: `2027-02-14-san-valentin`.
3. Sube las fotografías directamente dentro de esa carpeta.
4. Al publicarse los cambios, el nuevo álbum aparecerá automáticamente en la sección 📷. Cada archivo JPG, JPEG, PNG, WebP o GIF aparecerá como una fotografía y se podrá abrir ampliada.

La fecha y el título se obtienen del nombre de la carpeta. Usa minúsculas, sin acentos ni espacios, separando palabras con guiones. Git no conserva carpetas vacías: sube al menos una foto.

## Fondos automáticos
- `viaje`, `vacacion` o `aventura`: fondo de viaje.
- `cumple` o `birthday`: fondo de cumpleaños.
- `aniversario` o `anniversary`: fondo de aniversario.
- Otros nombres: fondo romántico.

La detección utiliza la API pública de GitHub, por lo que el repositorio debe ser público y existe un límite de solicitudes. Las fotos deben estar directamente dentro de la carpeta del evento.
