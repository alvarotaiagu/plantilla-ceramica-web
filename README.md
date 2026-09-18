# Plantilla · Taller de cerámica — «Merma»

> **Sitio de demostración.** *Olería Rañal* es un taller **ficticio**. El nombre,
> la dirección, los teléfonos, el correo, las piezas, los precios, los cursos y
> las notas del cuaderno están inventados para esta plantilla. No se publica
> ningún número del Registro de Artesanía porque **inventar una acreditación
> pública no es una licencia que nos tomemos**; el aviso legal explica cuál es
> el dato que iría en ese hueco.

**Demo:** https://alvarotaiagu.github.io/plantilla-ceramica-web/

---

## El concepto

Un taller de cerámica tiene una imagen evidente —**el torno girando**— y esa es
justamente la que no se usa aquí. La entrada es otra:

> **Todo lo que sale del horno es más pequeño de lo que hiciste.**

El barro pierde agua al secar y vuelve a contraerse al vitrificar: en torno a un
**12 %** entre el torno y la mesa. Eso obliga al alfarero a levantar cada pieza
más grande de lo que va a ser, y explica de un plumazo por qué un encargo tarda
ocho semanas y por qué dos piezas nunca son iguales.

Así que la plantilla **mide**. La sección protagonista pone una **regla graduada
que no se mueve** y, contra ella, **la misma jarra dibujada a los tres tamaños
que tiene de verdad**: 22,0 cm recién hecha, 20,5 cm seca y 19,4 cm cocida. La
línea de puntos que marca la altura baja con ella. Los números de la ficha
—altura, boca, porcentaje perdido, agua que le queda— cambian al mismo tiempo.

No es una animación decorativa: es el dato, dibujado.

## Recursos de movimiento (todos salen del concepto)

1. **La escena de la merma.** En escritorio la tarjeta se queda pegada y los tres
   momentos se recorren con la rueda (`position: sticky` + un `::after` que da el
   recorrido). En móvil no hay recorrido: la pieza encoge sola una vez al entrar.
   **En los dos casos mandan los tres botones**, que son pestañas ARIA con flechas
   de teclado. En escritorio el botón no pelea con la rueda: lleva el scroll al
   punto del recorrido que corresponde, y es el recorrido el que pinta el estado.
2. **La jarra del hero encoge al salir** (`scrub`), que es el mismo gesto en
   pequeño.
3. **Las chapas de esmalte gotean.** Cada muestra es CSS puro —degradado, motas y
   un goterón— y el goterón crece al entrar en pantalla, escalonado, y otra vez
   al pasar el ratón. Ocho goteos distintos, como en una pared de pruebas.
4. **La intro**: el perfil de la jarra se dibuja solo y el nombre encoge hasta su
   tamaño.
5. **Titulares partidos en letras** que suben al entrar.
6. **Cinta** con los datos del oficio y **cursor con etiqueta** sobre las fotos y
   las pruebas de esmalte; botones magnéticos.
7. **Máscaras de foto** por `IntersectionObserver` y **contadores** en el hero.

## Lo que se ha verificado (§7)

`node verificar-generico.js <repo> <salida> <puerto> conf-ceramica.json`

| Prueba | Resultado |
|---|---|
| Recorrido completo, escritorio 1440×900 | 21 capturas, sin errores de consola |
| Recorrido completo, móvil 390×844 | 25 capturas + menú |
| Botón «Cocida» → «Recién hecha» | `merma--2 · 19,4 cm` → `merma--0 · 22,0 cm`, con la línea de altura moviéndose de 306 px a 346 px |
| Goteo de los ocho esmaltes | `14 22 9 26 12 18 30 11` px, todos aplicados |
| Aviso de cookies | aparece, se cierra y no vuelve |
| Mapa de Google | 0 iframes hasta pulsar, 1 después |
| **Sin GSAP** (CDN cortado) | `has-motion:false`, titular legible, foto sin recortar, contador con su cifra final, **y los botones de la merma siguen funcionando** |
| **Movimiento reducido** | el contenido sigue cambiando: pulsar «Seca» da `20,5 cm · 7 %` y la escala `0.93`; lo que se apaga es la transición, no el dato |
| **Tareas largas** (`PerformanceObserver`, 10 s) | **ninguna** en tres cargas en frío medidas con la caché deshabilitada (`Network.setCacheDisabled`). En la primerísima carga del día, con el CDN aún sin resolver, se registraron 96, 61 y 81 ms |

Las 72 capturas están en `screenshots/`, en JPEG de calidad 72 para que quepan
todas las secciones sin inflar el repositorio.

## Accesibilidad

**axe-core: 0 violaciones** en las ocho pasadas (portada escritorio y móvil, la
merma en sus dos extremos, el menú móvil abierto, aviso legal y 404). El detalle
y lo que axe *no* mira está en [`AUDITORIA.md`](AUDITORIA.md).

Ningún texto se apaga con `opacity`: cada tono apagado es un token de color
calculado con script contra el peor fondo en el que aparece. El celadón de marca
(2,56 como texto) se queda en rellenos y filetes y tiene un token aparte para
texto.

## Cómo está hecho

HTML + CSS + un `main.js`. Sin framework, sin compilación, sin npm y sin
servidor: se abre el `index.html` y funciona. GSAP + ScrollTrigger + Lenis por
CDN, y si no llegan, la página sigue entera.

```
index.html · aviso-legal.html · privacidad.html · 404.html
css/estilo.css · js/main.js
assets/fotos/ (3 fotos de archivo) · assets/og.png · favicon.svg
screenshots/ · CREDITOS.md · AUDITORIA.md
```

- **Tipografía:** Lora (titulares) + Public Sans (texto).
- **Paleta:** barro seco `#ede6dc`, panel `#dfd5c7`, crema `#faf6ef`, tinta
  `#332b24`, hierro `#8a4b2a`, celadón `#6e8c74`.
- **Imágenes:** tres fotografías de archivo de Pexels, guardadas en el repo y
  acreditadas en `CREDITOS.md`. Todo lo demás —la jarra, la regla, las ocho
  chapas de esmalte, el logotipo, el mapa de relleno y la jarra rota del 404—
  está dibujado aquí en SVG o CSS.

## Para reskinear a un taller real

1. Sustituir nombre, dirección, teléfonos y correo (el dominio `.example` está
   puesto a propósito para que no se escape un correo inventado que exista).
2. Poner el número del Registro de Artesanía en el aviso legal, o quitar el
   párrafo si el taller no está inscrito.
3. Cambiar los tres porcentajes de merma por los de la pasta que se use de
   verdad: están en `MOMENTOS`, en `js/main.js`, y las escalas en
   `.merma--0/1/2` del CSS.
4. Sustituir las ocho chapas de esmalte por las del taller: son dos colores por
   chapa (`--esmalte` y `--moteado`) en el `style` de cada `<li>`.
5. Quitar el sello de demostración del pie, del `<head>` (`robots: noindex`) y
   de los comentarios de cada HTML.
