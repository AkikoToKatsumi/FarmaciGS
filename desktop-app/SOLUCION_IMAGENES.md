# Solución de Problemas de Imágenes

Se ha corregido la ruta de las imágenes en varios componentes de la aplicación. El problema era que las imágenes se estaban llamando desde rutas incorrectas, como `/logo.png` o `logo.png`, cuando la ruta correcta es `/imagenes/logo.png` porque los assets estáticos se sirven desde la carpeta `public`.

## Archivos Modificados

Se corrigieron las rutas de las imágenes en los siguientes archivos:

- `desktop-app/src/pages/Users.tsx`
- `desktop-app/src/pages/Sales.tsx`
- `desktop-app/src/pages/Roles.tsx`
- `desktop-app/src/pages/Admin.tsx`

## Cambio Realizado

En todos los archivos mencionados, se cambió la línea:

```jsx
<img src="/logo.png" alt="Logo" />
// o
<img src="logo.png" alt="Logo" />
```

por la siguiente:

```jsx
<img src="/imagenes/logo.png" alt="Logo" />
```

Con estos cambios, las imágenes ahora deberían mostrarse correctamente en el modo de desarrollo.