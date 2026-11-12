# Administrador móvil de recuerdos

PWA privada para administrar álbumes compartidos por dos personas. Se integra con Firebase Authentication, Cloud Firestore y Cloud Storage.

## Arquitectura

- **Authentication:** acceso por correo y contraseña. El registro público no existe en la aplicación.
- **Autorización:** solo los UID que tengan un documento `admins/{uid}` creado manualmente en Firestore pueden administrar.
- **Storage:** imágenes en `albums/{albumId}/{photoId}_{fileName}`.
- **Firestore:** `albums/{albumId}` guarda título, fecha, descripción y estado `published`; `albums/{albumId}/photos/{photoId}` guarda URL y metadatos.
- **Publicación selectiva:** un álbum nuevo empieza con `published: false`. Al publicarlo, la lectura pública queda habilitada por reglas; al retirarlo, vuelve a ser privado.

## Configuración pendiente

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Registrar una aplicación Web y copiar su configuración en `firebase-config.js`.
3. Activar **Authentication → Sign-in method → Email/Password**.
4. Crear manualmente las dos cuentas desde **Authentication → Users → Add user**. No habilitar registro desde el cliente.
5. Crear una base de datos **Cloud Firestore** y un bucket de **Cloud Storage**.
6. En Firestore, crear dos documentos en la colección `admins`. El ID de cada documento debe ser el UID de la cuenta correspondiente. El contenido puede ser `{ "enabled": true }`.
7. Publicar `firestore.rules` en la pestaña Rules de Firestore y `storage.rules` en la pestaña Rules de Storage.
8. Servir la PWA por HTTPS. En producción, GitHub Pages funciona con HTTPS; también se puede usar Firebase Hosting.

## Modelo de datos

```
admins/{uid}
albums/{albumId}
  └── photos/{photoId}
Storage:
albums/{albumId}/{photoId}_{fileName}
```

## Notas de seguridad

- La configuración web de Firebase no es una contraseña. No incluir nunca claves privadas de cuentas de servicio en el frontend.
- Los permisos se validan en las reglas del servidor, no en la interfaz.
- Los documentos de administradores se crean desde Firebase Console; la app no puede conceder permisos.
- Los álbumes y sus fotos solo son públicos cuando el documento del álbum tiene `published: true`.
- La app limita las imágenes a 15 MB y formatos JPEG, PNG, WebP, GIF y AVIF.
- Antes de usar datos reales, probar las reglas con Firebase Rules Playground o Emulator Suite.

## Estado de esta primera etapa

La PWA incluye inicio de sesión, creación de álbumes, carga y eliminación de fotografías, y publicación/retirada selectiva. La integración del sitio público para leer los álbumes desde Firestore se hará en una etapa posterior, para no cambiar el funcionamiento actual de la galería antes de configurar Firebase.
