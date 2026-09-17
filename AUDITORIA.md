# Auditoría de accesibilidad — Olería Rañal

Hecha con **axe-core 4.x** inyectado en la página y ejecutado con
`axe.run(document, { runOnly: wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice })`
desde Playwright (Chromium).

## Cómo se pasó

Cada pasada, en este orden: carga la página, espera a la intro, **cierra el
aviso de cookies**, **recorre la página entera con la rueda** (26 × 900 px) para
que lo que aparece con `IntersectionObserver` esté ya revelado, vuelve arriba e
inyecta axe.

Pasadas:

- Portada en **escritorio (1440×900)** y en **móvil (390×844)**.
- La escena de la merma en **sus dos extremos**: «recién hecha» (22,0 cm) y
  «cocida» (19,4 cm). Es la parte que cambia de estado, así que auditar solo uno
  habría dejado la mitad sin mirar.
- **Menú móvil abierto**, que es una capa que tapa la página entera.
- **Aviso legal** y **404** (escritorio y móvil).

## Resultado

| Pasada | Violaciones |
|---|---|
| Portada · escritorio | **0** |
| Portada · móvil | **0** |
| Portada · merma en «recién hecha» | **0** |
| Portada · merma en «cocida» | **0** |
| Portada · menú móvil abierto | **0** |
| Aviso legal | **0** |
| 404 · escritorio y móvil | **0** |

**Cero a la primera pasada**, y no por suerte: en las plantillas anteriores el
contraste se arreglaba después de que axe lo cazara. Aquí **la paleta se calculó
con el script de razón WCAG antes de escribir una línea de CSS**, midiendo cada
token contra el peor de los fondos en los que iba a aparecer.

## Los tokens, con su medida

Los valores están anotados también en el `:root` de `css/estilo.css`.

| Token | Valor | Dónde | Razón |
|---|---|---|---|
| `--tinta` | `#332b24` | texto principal | 9,58 sobre `--panel` |
| `--tinta-media` | `#5c5147` | párrafos secundarios, números de la regla | 5,32 sobre `--panel`, 7,16 sobre `--crema` |
| `--tinta-suave` | `#635b52` | antetítulos, `dt`, pies de foto, notas | **4,60** sobre `--panel` (el peor), 5,38 y 6,19 en el resto |
| `--hierro` | `#8a4b2a` | cifras, precios, botón | 4,64 / 5,43 / 6,25 según el fondo; con `--crema` encima, 6,25 |
| `--hierro-claro` | `#d98a5a` | títulos y enlaces del pie oscuro | 5,12 sobre `--tinta` |
| `--celadon` | `#6e8c74` | **solo relleno y filetes** | 2,56 como texto: no se usa como texto |
| `--celadon-texto` | `#4d6251` | códigos de esmalte, números de sección | 4,55 sobre `--panel` |
| `--celadon-claro` | `#9fbda6` | `code` del pie | 6,82 sobre `--tinta` |
| `--crema-suave` | `#bdb3a6` | texto apagado del pie | 6,72 sobre `--tinta` |

El celadón es el caso que manda el pliego: **es color de marca y no se toca**.
Se queda en el interior de la jarra dibujada, en los filetes de las listas y en
el punto de «abierto», y para texto hay dos variantes calculadas aparte, una
para fondo claro y otra para el pie oscuro.

## Lo que axe no mira, y aquí se ha mirado a mano

- **Texto dentro de un SVG.** axe no evalúa su contraste. El único texto en SVG
  de esta plantilla son los **números de la regla graduada** (0, 5, 10, 15, 20,
  24): `--tinta-media` sobre `--crema` = **7,16**. Medido con el script, no a
  ojo.
- **Opacidad sobre texto:** no hay ninguna. Es deliberado — una opacidad sobre
  texto no la ve la herramienta y hay que calcular el color efectivo tras la
  mezcla. Aquí el único `opacity` está en dibujos decorativos del mapa de
  relleno, que no llevan texto.
- **La etiqueta del cursor** va sobre su propia mancha: `rgba(51,43,36,.78)`
  sobre el fondo claro da un efectivo `#5f5851`, y el texto crema encima queda
  en **6,50**.
- **Contraste de los esmaltes entre sí**: las ocho chapas son muestras de color,
  no información codificada por color: cada una lleva **su código y su nombre en
  texto** debajo (`CE-04 · Celadón de ceniza`), así que nadie depende del tono.

## Lo que la plantilla hace bien de serie

- `main`, `header`, `nav`, `footer`, saltar al contenido y foco visible.
- Las tres pestañas de la merma son un `tablist` con `aria-selected`, `tabindex`
  giratorio, flechas de teclado y un `tabpanel` enfocable.
- El botón del menú móvil tiene `aria-label` (por debajo de 560 px la palabra
  «Menú» se oculta) y `aria-expanded`, que cambia también el `aria-label`.
- Tablas con `<th scope>` y `<caption>`; los titulares partidos en letras
  conservan su `aria-label` con el texto completo.
- **Con movimiento reducido el contenido sigue cambiando**: los tres momentos de
  la merma siguen dando su altura, su porcentaje y su tamaño; lo que se apaga es
  la transición.
