# CLAUDE.md

Contexto para trabajar en este repo. Es un workspace de Angular con dos proyectos:

- **`date-range-picker`** (`src/app`) — la landing page/showcase de la librería. No es un producto real, no tiene backend.
- **`@some-angular-utils/date-range-picker`** (`projects/some-angular-utils/date-picker`) — la librería Angular publicable de verdad (el componente `<date-range-input>`). El nombre de la carpeta en disco (`date-picker`) no coincide con el nombre del paquete publicado (`date-range-picker`) — es intencional, no lo renombres para "que coincida".

Este repo es hermano de `c:\Users\ADMINISTRATOR\Desktop\table` (la librería `@some-angular-utils/table`) — ambas landing pages siguen exactamente el mismo patrón (mismo navbar/hero/features/demos/installation/footer, mismo mini editor de código). Si cambias algo estructural aquí, probablemente también aplique allí, y viceversa.

Este repo es además una evolución de lo que antes era `@some-angular-utils/filter`: la librería original era un formulario de filtros genérico y configurable (`sau-filter`, con `custom-input`/`custom-select`/`date-range-input` como subcomponentes). Se hizo un pivote completo para publicar únicamente el `date-range-input` como librería independiente — `filter.ts`/`filter.html`/`filter.scss` y `custom-input`/`custom-select` se eliminaron porque solo los usaba el `sau-filter` original. Si encuentras referencias sueltas a "filter" en código, lockfiles o `dist/` antiguo que no se mencionen en este documento, son resquicios de esa migración, no parte del diseño actual.

## Árbol del código

```
date-input/
├── CLAUDE.md
├── README.md
├── angular.json
├── package.json
├── .postcssrc.json                      # Tailwind v4 vía @tailwindcss/postcss
├── tsconfig.json                        # mapea "@some-angular-utils/date-range-picker" -> dist/some-angular-utils/date-range-picker
│
├── src/                                  # app showcase (proyecto "date-range-picker")
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss                       # Tailwind v4 (@import "tailwindcss" + @theme, sin tailwind.config.js)
│   └── app/
│       ├── app.ts / app.html / app.scss / app.config.ts / app.routes.ts
│       └── components/
│           ├── navbar/         navbar.ts                  — barra superior fija
│           ├── hero/            hero.ts, hero.html          — portada con un date-range-input de ejemplo
│           ├── features/        features.ts, features.html  — grid de características
│           ├── demos/           demos.ts, demos.html         — "See it in action": demos editables en vivo (basic, prefilled, compact, presets, validation, theme)
│           ├── code-editor/     code-editor.ts/html/scss     — mini editor de código reutilizable (usado por demos)
│           ├── installation/    installation.ts, installation.html — instrucciones de instalación/uso
│           └── footer/          footer.ts                    — pie de página
│
└── projects/some-angular-utils/date-picker/   # la librería publicable (nombre de paquete: date-range-picker)
    └── src/
        ├── public-api.ts                  # exports públicos del paquete npm (solo DateRangeInputComponent)
        └── lib/
            └── components/
                └── date-range-input/          # único componente publicado: selector de rango de fechas con presets (hoy, mes actual...)
```

## El orden de build importa

La app importa la librería como `@some-angular-utils/date-range-picker`, que `tsconfig.json` mapea a `./dist/some-angular-utils/date-range-picker` — **no** al código fuente. Si editas algo dentro de `projects/some-angular-utils/date-picker/src`, hay que reconstruir antes de que la app lo vea:

```bash
npm run build:lib   # ng-packagr -> dist/some-angular-utils/date-range-picker
```

`ng serve` (usa Vite) pre-empaqueta dependencias y **no** recoge de forma confiable un `dist/` recién construido. Después de `build:lib`, mata y reinicia `ng serve` (o borra `.angular/cache` antes) — no asumas que el hot-reload lo detectó.

## Storybook fue eliminado

Storybook (`.storybook/` en la raíz y en la librería, `src/stories/`, los targets `storybook`/`build-storybook` en `angular.json`, las dependencias `@storybook/*`, el workflow `publishStorybook.yml` y `debug-storybook.log`) se eliminó a propósito en favor de la app showcase de `src/app`. No lo reintroduzcas a menos que se pida explícitamente.

## Gotcha de especificidad CSS al teñir en vivo (distinto del proyecto `table`)

La demo de "Theming" inyecta un `<style>` global de forma imperativa vía `Renderer2` + `DOCUMENT` (igual que en el proyecto `table`), porque Angular extrae las etiquetas `<style>` literales de las plantillas en tiempo de compilación y nunca llegan al DOM en tiempo de ejecución.

Pero a diferencia de `sau-table` (que usa `ViewEncapsulation.None`), **`DateRangeInputComponent` usa encapsulación Emulated por defecto**. Eso significa que la propia regla `.sau-date-range { ... }` de la librería se compila como `.sau-date-range[_ngcontent-xxx] { ... }` — una clase + un atributo, exactamente la misma especificidad que nuestro override `.theme-live .sau-date-range` (dos clases). Con especificidad empatada, gana el orden de inserción en el `<head>`, que no es fiable (depende de cuándo Angular registra el stylesheet del componente vs. cuándo se ejecuta nuestro constructor). La solución es añadir `!important` a cada declaración generada (función `withImportant()` en `demos.ts`) — confirmado con pruebas, no es una suposición. Si se porta este patrón a otra librería, comprobar primero qué `ViewEncapsulation` usa el componente raíz antes de asumir que la especificidad por selectores basta.

Las variables CSS `--sau-color-primary`/`--sau-color-background` en `date-range-input.component.scss` no existían en el componente original — se añadieron expresamente para que la demo de Theming tuviera algo que tocar, siguiendo el mismo patrón que ya usaba `sau-filter`. Solo cubren el acento principal (texto "Rango personalizado...", botón Aplicar, día inicio/fin seleccionado) — los tonos secundarios del hover dentro del calendario quedaron hardcodeados a propósito, igual que en el `sau-filter` original.

## Cómo funciona el editor de las demos en vivo (`src/app/components/demos`)

Mismo patrón que en el proyecto `table`: cada pestaña tiene su propio mini editor de código (`src/app/components/code-editor`) enlazado a un string de configuración (`{ label, placeholder, initialValue?, required? }`, o CSS plano en la pestaña Theming). Al editar (debounce ~600ms), el texto se evalúa con `new Function('"use strict"; return (' + texto + ');')()` — evaluado en el propio navegador del visitante, sin ida y vuelta al servidor (mismo modelo de confianza que cualquier playground de JS).

`DateRangeInputComponent` solo lee el valor inicial de su `formControlItem` dentro del propio setter del `@Input` (no tiene `ngOnChanges`), así que reescribir el valor del mismo `FormControl` con `setValue()` no resetea lo que se ve en pantalla (el calendario no "salta" al nuevo rango). Por eso cada demo sigue usando el mismo truco que `sau-filter`: `@for (cfg of [demo.config()]; track cfg)` — trackear por la referencia del objeto fuerza a Angular a destruir y recrear `<date-range-input>` cada vez que el evaluador produce un objeto nuevo, y el `FormControl` ya tiene el valor correcto seteado (vía `applyJsConfig()`) antes de que eso ocurra.

El rango seleccionado se lee a través de `control.valueChanges` hacia señales (`selectedRange`, `canSubmit`) en vez de depender de que Angular vuelva a marcar el árbol de componentes como "dirty" tras un click dentro de un hijo `OnPush` — es más explícito y no depende de cómo Angular propague la detección de cambios por eventos.

## El texto en español dentro de la librería es intencional, no un bug

Los presets del dropdown ("Hoy", "Mañana", "Hace 3 días", "Mes actual", "Próximo mes", "Año actual", "Próximo año") y los textos de la UI ("Limpiar rango", "Rango personalizado...", "Aplicar Rango", "Volver") están hardcodeados en español dentro de `date-range-input.component.ts`/`.html`. No es algo que se pueda cambiar desde `label`/`placeholder` ni desde la app showcase — es el comportamiento real del componente. No "corregir" esto en las demos para que parezca todo en inglés; mostrarlo tal cual es lo correcto.

## Convenciones de este repo (`.github/copilot-instructions.md`)

Este repo tiene un archivo de instrucciones para agentes de IA que sí se respetó al escribir los componentes nuevos de `src/app`: `ChangeDetectionStrategy.OnPush` en todos los componentes, `input()`/`output()`/`model()` en vez de decoradores `@Input`/`@Output` donde tiene sentido, `@if`/`@for`/`@switch` nativos en vez de `*ngIf`/`*ngFor`, sin `ngClass`/`ngStyle` (usar `[class.x]`/`[style.x]`), sin arrow functions dentro de plantillas. La librería (`projects/some-angular-utils/date-picker`) en cambio es código preexistente y NO sigue estas convenciones (usa `@Input`/`@Output`, `@HostListener`) — no es necesario migrarla solo por consistencia.

## Tailwind v4

No hay `tailwind.config.js` — v4 se configura con `@import "tailwindcss";` + un bloque `@theme { ... }` directamente en `src/styles.scss`, procesado por `@tailwindcss/postcss` (ver `.postcssrc.json`). La escala de color de marca (`brand-50`...`brand-900`) vive ahí. El IDE puede marcar "Unknown at rule @theme" como advertencia — es solo que el linter no conoce la sintaxis de Tailwind v4, no es un error de build.

## Gotcha de rutas en Windows + git-bash (solo importa al scriptear/probar con la herramienta Bash)

El `/tmp` de git-bash está mapeado a `AppData/Local/Temp`, pero un proceso `node.exe` nativo resuelve un string literal `'/tmp/...'` pasado como argumento JS relativo a la raíz de la unidad actual (`C:\tmp\...`) en su lugar — **no** son el mismo directorio. Si un script de Node escribe archivos en `/tmp/...` y la herramienta Bash no los encuentra después, revisar primero `C:\tmp\...` antes de asumir que la escritura falló.

También: la cwd de la herramienta Bash en esta sesión tiende a resetearse a otro directorio del workspace entre llamadas — antepón siempre `cd "C:/Users/ADMINISTRATOR/Desktop/date-input" &&` a cada comando, no asumas que el `cd` anterior persiste.
