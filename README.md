# ExtenHub

**Discover · Publish · Share**

ExtenHub es un catálogo comunitario para descubrir y compartir extensiones de Firefox, Chrome, Edge y otros navegadores.

## Publicar una extensión

1. Haz un Fork de este repositorio.
2. Copia `templates/extension-template.json`.
3. Completa los datos y guarda un único archivo como `submissions/mi-extension.json`.
4. Abre un Pull Request hacia `main` y completa la plantilla del PR.
5. GitHub Actions valida automáticamente el JSON. La publicación queda pendiente.
6. El administrador revisa la ficha. Solo `anyelo888ra-ux` puede escribir `/verify` en los comentarios del PR para aprobarla.
7. El workflow vuelve a validar los datos, genera un UUID y añade la extensión a `database.json`.

No se necesita una cuenta de ExtenHub. El autor es el nombre o alias declarado por quien envía el PR; no es una identidad verificada.

## Archivos principales

- `index.html`: catálogo público.
- `extension.html?q=UUID`: ficha individual.
- `database.json`: catálogo de extensiones aprobadas.
- `database.js`: búsqueda, filtros y renderizado.
- `templates/extension-template.json`: plantilla de envío.
- `submissions/`: JSON enviados mediante Pull Request.
- `extensions/`: fichas JSON generadas al aprobar.

## Estados

- `pending`: esperando revisión; no aparece en el catálogo.
- `verified`: aprobada por el administrador de ExtenHub y visible.
- `failed`: falló una validación automática.
- `rejected`: rechazada por el administrador (se cierra el PR).

**Verified no es una certificación de Mozilla, Google, Microsoft ni de otro navegador.** Solo indica que el equipo de ExtenHub revisó y aprobó la publicación.

## Seguridad y configuración

- El workflow de validación usa permisos de solo lectura y ejecuta el validador de la rama principal, nunca scripts aportados por el fork.
- El workflow de aprobación no ejecuta código del fork; obtiene el JSON como datos y comprueba que `/verify` lo escribió `anyelo888ra-ux`.
- En GitHub, configura **Settings → Actions → General → Workflow permissions → Read and write permissions** para permitir que el bot actualice el catálogo.
- No añadas secretos al JSON ni publiques archivos ejecutables dentro del repositorio.
- Las URLs se validan por formato, pero eso no garantiza que el archivo sea seguro. Instala extensiones solo desde fuentes de confianza.

## Licencia

MIT.
