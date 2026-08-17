# Contrato de hash para documentos legales

Issue relacionada: `douvery/douvery#6`.

`contentHashSha256` identifica el **contenido fuente exacto aprobado** de una revisión legal. Para que el valor sea reproducible, Douvery define el siguiente contrato:

```text
SHA-256 de los bytes exactos del archivo MDX versionado en Git
```

No se calcula sobre HTML renderizado, DOM, Markdown convertido, texto extraído ni una respuesta de CDN. Esas representaciones pueden cambiar por Mintlify, componentes, minificación o infraestructura sin que el contenido fuente legal haya cambiado.

## Generación

Desde un checkout limpio del commit aprobado:

```bash
node scripts/legal-document-hashes.mjs
```

El script:

- exige un working tree limpio por defecto;
- lee los bytes exactos de cada MDX legal versionable;
- calcula SHA-256 hexadecimal de 64 caracteres;
- incluye `repository`, `gitCommit`, path, URL canónica y tamaño en bytes;
- no modifica políticas ni activa revisiones.

Para escribir el manifest a un archivo de evidencia:

```bash
node scripts/legal-document-hashes.mjs --write ./legal-hashes-approved.json
```

Ese archivo generado no necesita committearse al repositorio; puede adjuntarse a la aprobación/Issue #6 junto con el commit aprobado.

## Working tree sucio

Por defecto el script falla si hay cambios sin commit porque un hash de contenido no versionado no es una buena referencia de aprobación.

`--allow-dirty` existe únicamente para investigación local:

```bash
node scripts/legal-document-hashes.mjs --allow-dirty
```

Un manifest generado con `--allow-dirty` **no debe usarse para un rollout Production**.

## Cambio de contenido

Cualquier cambio de un byte en el MDX —incluido frontmatter— produce un hash distinto. Si un documento ACTIVE necesita cambiar, debe generarse una nueva revisión/version en el dominio legal; no se edita el payload inmutable de la versión ya activa.

## Relación con el rollout

El valor `contentHashSha256` generado para el commit aprobado se copia al plan gobernado de `douvery/douvery` (`legal:rollout`). El rollout valida formato/identidad y la base de datos conserva ese hash como parte de la revisión legal inmutable.

La evidencia de cierre debe conservar, como mínimo:

- commit de `douvery/DouveryHelp-Web` aprobado;
- manifest de hashes generado desde ese commit;
- versión legal asignada a cada documento;
- `approvalReference` y aprobador;
- salida del dry-run/apply y certificaciones posteriores.
