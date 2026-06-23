# CLAUDE.md

> **Regla para Claude: mantén este archivo al día.** Tras cualquier cambio relevante en el repo (rename de componentes/carpetas, cambios de selector o de API pública, nuevas demos, scripts, gotchas descubiertos, etc.), actualiza este `CLAUDE.md` en la misma tarea — no esperes a que el usuario lo pida explícitamente. Si detectas que algo aquí ya no coincide con el código (como pasó con el rename `date-picker` → `date-range-picker`), corrígelo de inmediato.

Contexto para trabajar en este repo. Es un workspace de Angular con dos proyectos:

- **`date-range-picker`** (`src/app`) — la landing page/showcase de la librería. No es un producto real, no tiene backend.
- **`@some-angular-utils/date-range-picker`** (`projects/some-angular-utils/date-range-picker`) — la librería Angular publicable de verdad. El componente se selecciona como `<sau-date-range-picker>` y su clase TypeScript se llama, algo confusamente, `SAUDateRangePickerModule` (es un `@Component`, no un `NgModule` — el sufijo "Module" es solo el nombre de la clase, no refleja su naturaleza).

Este repo es hermano de `c:\Users\ADMINISTRATOR\Desktop\table` (la librería `@some-angular-utils/table`) — ambas landing pages siguen exactamente el mismo patrón (mismo navbar/hero/features/demos/installation/footer, mismo mini editor de código). Si cambias algo estructural aquí, probablemente también aplique allí, y viceversa.

Este repo es además una evolución de lo que antes era `@some-angular-utils/filter`: la librería original era un formulario de filtros genérico y configurable (`sau-filter`, con `custom-input`/`custom-select`/`sau-date-range-picker` como subcomponentes). Se hizo un pivote completo para publicar únicamente el selector de rango de fechas como librería independiente — `filter.ts`/`filter.html`/`filter.scss` y `custom-input`/`custom-select` se eliminaron porque solo los usaba el `sau-filter` original. Si encuentras referencias sueltas a "filter" en código, lockfiles o `dist/` antiguo (p. ej. `dist/some-angular-utils/filter`, `dist/some-angular-utils/selector`) que no se mencionen en este documento, son resquicios de esa migración, no parte del diseño actual.

## ⚠️ El componente se llamaba `sau-date-range-picker` — ya no

La librería pasó por un rename que dejó residuos. El componente actual (`SAUDateRangePickerModule`, selector `sau-date-range-picker`, archivo `date-range-picker.component.ts`) antes se llamaba `SAUDateRangePickerModule` con selector `<sau-date-range-picker>`, y vivía en `projects/some-angular-utils/date-picker/.../components/sau-date-range-picker/`. El nombre de carpeta del proyecto Angular pasó de `date-picker` a `date-range-picker` (ahora sí coincide con el nombre del paquete npm), y la clase pasó de `sau-date-range-picker` a `date-range-picker`. Pero el rename quedó **incompleto**:

- `angular.json` (target de librería, líneas ~67-90) y `tsconfig.json` (`references`) todavía apuntan a `projects/some-angular-utils/date-picker/...`, una ruta que **ya no existe en disco** (ahora es `projects/some-angular-utils/date-range-picker/...`). El build real (`npm run build:lib`) no pasa por ahí — invoca `ng-packagr` directamente sobre `projects/some-angular-utils/date-range-picker/ng-package.json` — así que el build funciona a pesar de la referencia rota, pero cualquier tooling que sí use esas referencias (IDE, `ng test` del proyecto librería, etc.) puede fallar o resolver mal.
- `src/app/components/installation/installation.ts` (snippet de uso) y `src/app/components/demos/demos.html` (texto de la sección "See it in action") todavía muestran/mencionan `<sau-date-range-picker>` y `SAUDateRangePickerModule` en vez del nombre real `<sau-date-range-picker>` / `SAUDateRangePickerModule`. Es texto de la showcase desactualizado, no refleja cómo se usa la librería realmente — si tocas esos archivos, vale la pena corregirlo de paso.

Si vuelves a encontrar `sau-date-range-picker`/`SAUDateRangePickerModule` en algún sitio no listado arriba, asume que es otro resquicio del mismo rename incompleto, no una API alternativa vigente.

## Árbol del código

```
date-input/
├── CLAUDE.md
├── README.md
├── angular.json                          # ⚠️ el target de librería referencia la ruta vieja "date-picker" (ver arriba)
├── package.json
├── .postcssrc.json                      # Tailwind v4 vía @tailwindcss/postcss
├── tsconfig.json                        # mapea "@some-angular-utils/date-range-picker" -> dist/some-angular-utils/date-range-picker
│                                         # (su "references" también apunta a la ruta vieja "date-picker", ver arriba)
│
├── src/                                  # app showcase (proyecto "date-range-picker")
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss                       # Tailwind v4 (@import "tailwindcss" + @theme, sin tailwind.config.js)
│   └── app/
│       ├── app.ts / app.html / app.scss / app.config.ts / app.routes.ts
│       └── components/
│           ├── navbar/         navbar.ts                  — barra superior fija
│           ├── hero/            hero.ts, hero.html          — portada con un <sau-date-range-picker> de ejemplo
│           ├── features/        features.ts, features.html  — grid de características
│           ├── demos/           demos.ts, demos.html         — "See it in action": demos editables en vivo (basic, prefilled, compact, presets, validation, theme)
│           ├── code-editor/     code-editor.ts/html/scss     — mini editor de código reutilizable (usado por demos)
│           ├── installation/    installation.ts, installation.html — instrucciones de instalación/uso
│           └── footer/          footer.ts                    — pie de página
│
└── projects/some-angular-utils/date-range-picker/   # la librería publicable (nombre de paquete: date-range-picker)
    └── src/
        ├── public-api.ts                  # exports públicos del paquete npm: SAUDateRangePickerModule + interfaz DateRangeOption
        └── lib/
            ├── date-range-picker.component.ts     # único componente publicado, todo en un archivo plano (sin subcarpeta components/)
            ├── date-range-picker.component.html
            └── date-range-picker.component.scss
```

## El orden de build importa

La app importa la librería como `@some-angular-utils/date-range-picker`, que `tsconfig.json` mapea a `./dist/some-angular-utils/date-range-picker` — **no** al código fuente. Si editas algo dentro de `projects/some-angular-utils/date-range-picker/src`, hay que reconstruir antes de que la app lo vea:

```bash
npm run build:lib   # ng-packagr -p projects/some-angular-utils/date-range-picker/ng-package.json -> dist/some-angular-utils/date-range-picker
npm run dev          # build:lib + ng serve, en un solo comando (útil para arrancar de cero)
```

`ng serve` (usa Vite) pre-empaqueta dependencias y **no** recoge de forma confiable un `dist/` recién construido. Si `ng serve` ya está corriendo y vuelves a correr `build:lib` por separado, mata y reinicia `ng serve` (o borra `.angular/cache` antes) — no asumas que el hot-reload lo detectó.

## Storybook fue eliminado

Storybook (`.storybook/` en la raíz y en la librería, `src/stories/`, los targets `storybook`/`build-storybook` en `angular.json`, las dependencias `@storybook/*`, el workflow `publishStorybook.yml` y `debug-storybook.log`) se eliminó a propósito en favor de la app showcase de `src/app`. No lo reintroduzcas a menos que se pida explícitamente. (Nota: el step de `publishInGithubPages.yml` todavía se llama `"Build Storybook"` aunque solo corre `build:lib && build` — es un nombre de step desactualizado, no un retorno de Storybook.)

## Gotcha de especificidad CSS al teñir en vivo (distinto del proyecto `table`)

La demo de "Theming" inyecta un `<style>` global de forma imperativa vía `Renderer2` + `DOCUMENT` (igual que en el proyecto `table`), porque Angular extrae las etiquetas `<style>` literales de las plantillas en tiempo de compilación y nunca llegan al DOM en tiempo de ejecución.

Pero a diferencia de `sau-table` (que usa `ViewEncapsulation.None`), **`SAUDateRangePickerModule` usa encapsulación Emulated por defecto**. Eso significa que la propia regla `.sau-date-range { ... }` de la librería se compila como `.sau-date-range[_ngcontent-xxx] { ... }` — una clase + un atributo, exactamente la misma especificidad que nuestro override `.theme-live .sau-date-range` (dos clases). Con especificidad empatada, gana el orden de inserción en el `<head>`, que no es fiable (depende de cuándo Angular registra el stylesheet del componente vs. cuándo se ejecuta nuestro constructor). La solución es añadir `!important` a cada declaración generada (función `withImportant()` en `demos.ts`) — confirmado con pruebas, no es una suposición. Si se porta este patrón a otra librería, comprobar primero qué `ViewEncapsulation` usa el componente raíz antes de asumir que la especificidad por selectores basta.

Las variables CSS `--sau-color-primary`/`--sau-color-background` en `date-range-picker.component.scss` no existían en el componente original — se añadieron expresamente para que la demo de Theming tuviera algo que tocar, siguiendo el mismo patrón que ya usaba `sau-filter`. Solo cubren el acento principal (texto "Rango personalizado...", botón Aplicar, día inicio/fin seleccionado) — los tonos secundarios del hover dentro del calendario quedaron hardcodeados a propósito, igual que en el `sau-filter` original.

## Cómo funciona el editor de las demos en vivo (`src/app/components/demos`)

Mismo patrón que en el proyecto `table`: cada pestaña tiene su propio mini editor de código (`src/app/components/code-editor`) enlazado a un string de configuración (`{ label, placeholder, initialValue?, required?, dateRangeOptions? }`, o CSS plano en la pestaña Theming). Al editar (debounce ~600ms), el texto se evalúa con `new Function('"use strict"; return (' + texto + ');')()` — evaluado en el propio navegador del visitante, sin ida y vuelta al servidor (mismo modelo de confianza que cualquier playground de JS).

`dateRangeOptions` (los presets del dropdown) es un `@Input` del componente — antes era una lista fija interna. La demo "Custom presets" se apoya en esto para mostrar cómo reemplazar los presets en español por una lista propia en inglés (`{ label, value, getRange }`).

`SAUDateRangePickerModule` solo lee el valor inicial de su `formControlItem` dentro del propio setter del `@Input` (no tiene `ngOnChanges`), así que reescribir el valor del mismo `FormControl` con `setValue()` no resetea lo que se ve en pantalla (el calendario no "salta" al nuevo rango). Por eso cada demo sigue usando el mismo truco que `sau-filter`: `@for (cfg of [demo.config()]; track cfg)` — trackear por la referencia del objeto fuerza a Angular a destruir y recrear `<sau-date-range-picker>` cada vez que el evaluador produce un objeto nuevo, y el `FormControl` ya tiene el valor correcto seteado (vía `applyJsConfig()`) antes de que eso ocurra.

El rango seleccionado se lee a través de `control.valueChanges` hacia señales (`selectedRange`, `canSubmit`) en vez de depender de que Angular vuelva a marcar el árbol de componentes como "dirty" tras un click dentro de un hijo `OnPush` — es más explícito y no depende de cómo Angular propague la detección de cambios por eventos.

## El texto en español dentro de la librería es intencional, no un bug

Los presets del dropdown por defecto ("Hoy", "Ayer", "Hace 3 días", "Mes actual", "Mes anterior", "Año actual", "Año anterior") y los textos de la UI ("Limpiar rango", "Rango personalizado...", "Aplicar Rango", "Volver", "Limpiar") están hardcodeados en español dentro de `date-range-picker.component.ts`/`.html`. No es algo que se pueda cambiar desde `label`/`placeholder` ni desde la app showcase — es el comportamiento real del componente. No "corregir" esto en las demos para que parezca todo en inglés; mostrarlo tal cual es lo correcto. (Los presets sí se pueden *reemplazar* por completo pasando `dateRangeOptions`, como hace la demo "Custom presets" — pero los textos fijos del resto de la UI, sí o sí en español, no.)

Además del dropdown de presets y el calendario de doble mes, el input principal admite edición manual: doble click sobre el texto mostrado lo vuelve editable (`isEditingMainInput`, parseo `dd/mm/yyyy - dd/mm/yyyy` vía `onDisplayInputChange`), y el footer del calendario tiene dos `<input type="date">` nativos (`onStartDateInputChange`/`onEndDateInputChange`) para teclear las fechas en vez de hacer click día por día.

## Convenciones de este repo (`.github/copilot-instructions.md`)

Este repo tiene un archivo de instrucciones para agentes de IA que sí se respetó al escribir los componentes nuevos de `src/app`: `ChangeDetectionStrategy.OnPush` en todos los componentes, `input()`/`output()`/`model()` en vez de decoradores `@Input`/`@Output` donde tiene sentido, `@if`/`@for`/`@switch` nativos en vez de `*ngIf`/`*ngFor`, sin `ngClass`/`ngStyle` (usar `[class.x]`/`[style.x]`), sin arrow functions dentro de plantillas. La librería (`projects/some-angular-utils/date-range-picker`) en cambio es código preexistente y NO sigue estas convenciones (usa `@Input`/`@Output`, `@HostListener`) — no es necesario migrarla solo por consistencia.

## Tailwind v4

No hay `tailwind.config.js` — v4 se configura con `@import "tailwindcss";` + un bloque `@theme { ... }` directamente en `src/styles.scss`, procesado por `@tailwindcss/postcss` (ver `.postcssrc.json`). La escala de color de marca (`brand-50`...`brand-900`) vive ahí. El IDE puede marcar "Unknown at rule @theme" como advertencia — es solo que el linter no conoce la sintaxis de Tailwind v4, no es un error de build.

## Gotcha de rutas en Windows + git-bash (solo importa al scriptear/probar con la herramienta Bash)

El `/tmp` de git-bash está mapeado a `AppData/Local/Temp`, pero un proceso `node.exe` nativo resuelve un string literal `'/tmp/...'` pasado como argumento JS relativo a la raíz de la unidad actual (`C:\tmp\...`) en su lugar — **no** son el mismo directorio. Si un script de Node escribe archivos en `/tmp/...` y la herramienta Bash no los encuentra después, revisar primero `C:\tmp\...` antes de asumir que la escritura falló.

También: la cwd de la herramienta Bash en esta sesión tiende a resetearse a otro directorio del workspace entre llamadas — antepón siempre `cd "C:/Users/ADMINISTRATOR/Desktop/date-input" &&` a cada comando, no asumas que el `cd` anterior persiste.
