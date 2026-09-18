/* ==========================================================================
   Olería Rañal — sitio de demostración (taller ficticio)
   Concepto: «Merma». Una regla que no se mueve y una pieza que encoge.

   Reglas de la casa que se respetan aquí:
   - El movimiento solo se promete si GSAP + ScrollTrigger han cargado de
     verdad (html.has-motion). Sin ellos, todo está visible y usable.
   - prefers-reduced-motion apaga el MOVIMIENTO, no el CONTENIDO: los tres
     momentos de la merma siguen cambiando de número y de tamaño.
   - Nada de tocar `transform` por GSAP sobre un <g> de SVG.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var hayGsap = !!(window.gsap && window.ScrollTrigger);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var movimiento = hayGsap && !reduce;

  if (hayGsap) {
    raiz.classList.add('has-motion');
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- 0 · medir tareas largas (queda anotado en el README) -------- */
  window.__tareasLargas = [];
  if (window.PerformanceObserver) {
    try {
      var po = new PerformanceObserver(function (l) {
        l.getEntries().forEach(function (e) { window.__tareasLargas.push(Math.round(e.duration)); });
      });
      po.observe({ entryTypes: ['longtask'] });
      setTimeout(function () {
        var t = window.__tareasLargas;
        console.log('[Rañal] tareas largas (>50 ms) en los primeros 10 s: ' +
          (t.length ? t.join(', ') + ' ms · la peor ' + Math.max.apply(null, t) + ' ms' : 'ninguna'));
      }, 10000);
    } catch (e) { /* navegador sin longtask */ }
  }

  /* ---------- 1 · scroll suave ---------- */
  var lenis = null;
  if (movimiento && window.Lenis) {
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function irA(destino) {
    if (lenis) lenis.scrollTo(destino, { duration: 1.1 });
    else window.scrollTo({ top: typeof destino === 'number' ? destino : 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- 2 · cortina de entrada ----------
     Gesto propio del concepto: el perfil de la jarra se dibuja, el nombre
     ENCOGE hasta su tamaño (que es de lo que va la plantilla) y después la
     cortina sube encogiendo un poco, con el borde de abajo curvado.
     Retirada garantizada: sin GSAP y con movimiento reducido se quita de
     inmediato, y aun con GSAP hay una red de seguridad a los 4,2 s. */
  var preloader = document.getElementById('preloader');
  var animHero = [];                                  // el hero arranca cuando sube la cortina
  function arrancarHero() { animHero.splice(0).forEach(function (f) { f(); }); }

  function quitarPreloader() {
    if (!preloader) return;
    preloader.style.display = 'none';
    arrancarHero();
  }
  if (!movimiento) {
    quitarPreloader();
  } else {
    var tlIntro = gsap.timeline();
    tlIntro
      .to('.preloader__aro', { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, 0)
      .to('.preloader__boca', { opacity: 1, duration: .35 }, .82)
      .to('.preloader__palabra', { scale: 1, duration: .85, ease: 'power3.out' }, .62)
      .to('.preloader__caja', { opacity: 0, duration: .35, ease: 'power2.in' }, 1.62)
      .to(preloader, { '--curva-cortina': 1, duration: .5, ease: 'power2.inOut' }, 1.68)
      .to(preloader, {
        yPercent: -102, scaleX: .94, duration: 1.25, ease: 'expo.inOut',
        onComplete: quitarPreloader
      }, 1.9)
      .add(arrancarHero, 2.2);
    setTimeout(quitarPreloader, 4200);   // red de seguridad
  }

  /* ---------- 3 · aviso de cookies ---------- */
  var banner = document.getElementById('cookieBanner');
  var aceptar = document.getElementById('cookieAceptar');
  var CLAVE = 'ranal-cookies';
  var visto = false;
  try { visto = localStorage.getItem(CLAVE) === 'si'; } catch (e) { visto = false; }
  if (banner && !visto) {
    setTimeout(function () { banner.hidden = false; }, movimiento ? 4600 : 600);
  }
  if (aceptar) {
    aceptar.addEventListener('click', function () {
      banner.hidden = true;
      try { localStorage.setItem(CLAVE, 'si'); } catch (e) { /* modo privado */ }
    });
  }

  /* ---------- 4 · menú y cabecera ---------- */
  var hamburguesa = document.getElementById('hamburguesa');
  var nav = document.getElementById('nav');
  if (hamburguesa && nav) {
    hamburguesa.addEventListener('click', function () {
      var abierta = nav.classList.toggle('abierta');
      hamburguesa.setAttribute('aria-expanded', abierta ? 'true' : 'false');
      hamburguesa.setAttribute('aria-label', abierta ? 'Cerrar el menú' : 'Abrir el menú');
    });
    nav.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) {
        nav.classList.remove('abierta');
        hamburguesa.setAttribute('aria-expanded', 'false');
        hamburguesa.setAttribute('aria-label', 'Abrir el menú');
      }
    });
  }

  var cabecera = document.getElementById('cabecera');
  function pintarCabecera() {
    if (cabecera) cabecera.classList.toggle('encogida', window.scrollY > 40);
  }
  window.addEventListener('scroll', pintarCabecera, { passive: true });
  pintarCabecera();

  // los enlaces internos pasan por Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var destino = document.querySelector(id);
      if (!destino) return;
      ev.preventDefault();
      irA(destino);
    });
  });

  /* ---------- 5 · titulares partidos en letras ---------- */
  // La palabra también es inline-block con white-space:nowrap, o el navegador
  // parte «se / mana» por dentro.
  function partir(el) {
    var texto = el.textContent;
    el.setAttribute('aria-label', texto);
    el.textContent = '';
    texto.split(' ').forEach(function (palabra, i, todas) {
      var p = document.createElement('span');
      p.className = 'palabra';
      p.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (c) {
        var l = document.createElement('span');
        l.className = 'letra';
        l.textContent = c;
        p.appendChild(l);
      });
      el.appendChild(p);
      if (i < todas.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.letra');
  }

  if (movimiento) {
    document.querySelectorAll('[data-reveal]').forEach(function (el, idx) {
      var letras = partir(el);
      // El titular del hero no lleva retardo fijo: lo arranca la cortina.
      var lanzar = function () {
        var conf = { y: 0, duration: .9, ease: 'power3.out', stagger: .016 };
        if (idx !== 0) conf.scrollTrigger = { trigger: el, start: 'top 88%', once: true };
        gsap.to(letras, conf);
      };
      if (idx === 0) animHero.push(lanzar); else lanzar();
    });
  }

  /* ---------- 6 · contadores ---------- */
  document.querySelectorAll('.contador').forEach(function (el) {
    var hasta = parseInt(el.getAttribute('data-hasta'), 10);
    if (!movimiento || isNaN(hasta)) return;
    var obj = { v: 0 };
    el.textContent = '0';
    animHero.push(function () {
      gsap.to(obj, {
        v: hasta, duration: 1.6, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(obj.v); }
      });
    });
  });

  /* ---------- 7 · cinta ---------- */
  var pista = document.getElementById('cintaPista');
  if (pista && movimiento) {
    pista.innerHTML = pista.innerHTML + pista.innerHTML;
    gsap.to(pista, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
  }

  /* ---------- 8 · LA MERMA ---------- */
  var MOMENTOS = [
    {
      titulo: 'Recién hecha, el mismo día',
      alto: '22,0', ancho: '9,6', perdido: '0', agua: '22',
      nota: 'Acaba de salir del torno. Está blanda, pesa casi el doble de lo que pesará y no se puede ni coger por el asa.'
    },
    {
      titulo: 'Seca, quince días después',
      alto: '20,5', ancho: '8,9', perdido: '7', agua: '2',
      nota: 'Ha perdido el agua de amasado y con ella un siete por ciento de tamaño. Ya está dura, pero se rompe con mirarla: es el momento más frágil de su vida.'
    },
    {
      titulo: 'Cocida, a 1240 grados',
      alto: '19,4', ancho: '8,4', perdido: '12', agua: '0',
      nota: 'El gres ya ha vitrificado. No absorbe agua, no se raya con el cuchillo y no volverá a cambiar de tamaño nunca más.'
    }
  ];

  var caja = document.getElementById('mermaCaja');
  var viaje = document.getElementById('mermaViaje');
  var pasos = Array.prototype.slice.call(document.querySelectorAll('.merma__paso'));
  var panel = document.getElementById('mermaPanel');
  var actual = -1;

  function pintarMerma(i) {
    if (!caja || i === actual) return;
    actual = i;
    var m = MOMENTOS[i];
    caja.className = 'merma__caja merma--' + i;
    document.getElementById('mermaMomento').textContent = m.titulo;
    document.getElementById('mermaAlto').textContent = m.alto;
    document.getElementById('mermaAncho').textContent = m.ancho;
    document.getElementById('mermaPerdido').textContent = m.perdido;
    document.getElementById('mermaAgua').textContent = m.agua;
    document.getElementById('mermaNota').textContent = m.nota;
    pasos.forEach(function (b, j) {
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
      b.tabIndex = j === i ? 0 : -1;
    });
    if (panel) panel.setAttribute('aria-labelledby', 'merma-' + i);
  }

  var disparador = null;   // el ScrollTrigger del recorrido, si lo hay

  pasos.forEach(function (b, i) {
    b.addEventListener('click', function () {
      if (disparador) {
        // en escritorio manda el scroll: se lleva la página al punto del
        // recorrido que corresponde a ese momento, y el propio recorrido
        // pinta el estado. Así el botón y la rueda nunca se pelean.
        var t = [0.10, 0.50, 0.90][i];
        irA(disparador.start + (disparador.end - disparador.start) * t);
      } else {
        pintarMerma(i);
      }
      b.focus();
    });
    b.addEventListener('keydown', function (ev) {
      var salto = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (!salto) return;
      ev.preventDefault();
      var j = (i + salto + pasos.length) % pasos.length;
      pasos[j].click();
    });
  });

  pintarMerma(0);

  if (movimiento && viaje && window.matchMedia('(min-width: 861px)').matches) {
    disparador = ScrollTrigger.create({
      trigger: viaje,
      start: 'top top+=140',
      end: 'bottom bottom',
      onUpdate: function (self) {
        var p = self.progress;
        pintarMerma(p < 0.34 ? 0 : p < 0.68 ? 1 : 2);
      }
    });
  } else if (caja && 'IntersectionObserver' in window) {
    // En móvil (y sin GSAP) no hay recorrido: la pieza encoge sola una vez
    // al entrar, y a partir de ahí mandan los botones.
    var yaJugado = false;
    var obsMerma = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting || yaJugado) return;
        yaJugado = true;
        obsMerma.disconnect();
        if (reduce) return;              // sin movimiento automático
        setTimeout(function () { pintarMerma(1); }, 1400);
        setTimeout(function () { pintarMerma(2); }, 3200);
      });
    }, { threshold: 0.4 });
    obsMerma.observe(caja);
  }

  /* ---------- 9 · el muestrario de esmaltes gotea ---------- */
  var muestrario = document.getElementById('muestrario');
  if (muestrario && 'IntersectionObserver' in window) {
    var muestras = Array.prototype.slice.call(muestrario.querySelectorAll('.muestra'));
    var obsM = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        obsM.unobserve(e.target);
        var i = muestras.indexOf(e.target);
        var goteo = [14, 22, 9, 26, 12, 18, 30, 11][i % 8];
        setTimeout(function () {
          e.target.style.setProperty('--goteo', (reduce ? goteo : goteo) + 'px');
        }, reduce ? 0 : i * 90);
      });
    }, { threshold: 0.3 });
    muestras.forEach(function (m) { obsM.observe(m); });
  }

  /* ---------- 10 · fotos con máscara ---------- */
  // Un IntersectionObserver, no un ScrollTrigger con once:true: si la figura
  // ya está en pantalla al cargar, el ScrollTrigger puede no dispararse.
  var figuras = document.querySelectorAll('figure[data-mascara]');
  if ('IntersectionObserver' in window) {
    var obsF = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        obsF.unobserve(e.target);
      });
    }, { threshold: 0.18 });
    figuras.forEach(function (f) { obsF.observe(f); });
  } else {
    figuras.forEach(function (f) { f.classList.add('visible'); });
  }

  /* ---------- 11 · la taza del hero encoge al salir ---------- */
  var tazaHero = document.querySelector('.taza--hero');
  if (movimiento && tazaHero) {
    gsap.fromTo(tazaHero,
      { scale: 1, transformOrigin: '50% 100%' },
      {
        scale: .86, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
      });
  }

  /* ---------- 12 · cursor y botones magnéticos ---------- */
  var cursor = document.getElementById('cursor');
  var cursorTexto = document.getElementById('cursorTexto');
  var finoPuntero = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && finoPuntero && movimiento) {
    var cx = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var destino = { x: cx.x, y: cx.y };
    window.addEventListener('mousemove', function (ev) {
      destino.x = ev.clientX; destino.y = ev.clientY;
      cursor.classList.add('activo');
    }, { passive: true });
    gsap.ticker.add(function () {
      cx.x += (destino.x - cx.x) * .18;
      cx.y += (destino.y - cx.y) * .18;
      cursor.style.transform = 'translate(' + cx.x + 'px,' + cx.y + 'px) translate(-50%,-50%)';
    });

    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorTexto.textContent = el.getAttribute('data-cursor');
        cursor.classList.add('etiqueta');
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('etiqueta');
      });
    });
  }

  if (movimiento && finoPuntero) {
    document.querySelectorAll('.magnetico').forEach(function (el) {
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (ev.clientX - (r.left + r.width / 2)) * .28,
          y: (ev.clientY - (r.top + r.height / 2)) * .34,
          duration: .5, ease: 'power3.out'
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, .45)' });
      });
    });
  }

  /* ---------- 13 · abierto / cerrado, con el día de hoy marcado ---------- */
  // Martes a viernes 10:30–14:00; jueves y viernes también 17:00–20:00;
  // sábado 11:00–14:00. Lunes y domingo, cerrado.
  var TRAMOS = {
    1: [],
    2: [[630, 840]],
    3: [[630, 840]],
    4: [[630, 840], [1020, 1200]],
    5: [[630, 840], [1020, 1200]],
    6: [[660, 840]],
    0: []
  };
  var NOMBRES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function hhmm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ':' + (m < 10 ? '0' + m : m);
  }
  function pintarEstado() {
    var estado = document.getElementById('estado');
    var texto = document.getElementById('estadoTexto');
    if (!estado || !texto) return;
    var ahora = new Date();
    var dia = ahora.getDay();
    var min = ahora.getHours() * 60 + ahora.getMinutes();
    var tramos = TRAMOS[dia] || [];
    var abierto = tramos.some(function (t) { return min >= t[0] && min < t[1]; });

    estado.classList.toggle('abierto', abierto);
    estado.classList.toggle('cerrado', !abierto);

    if (abierto) {
      var t = tramos.filter(function (t) { return min >= t[0] && min < t[1]; })[0];
      texto.textContent = 'Abierto ahora · cierra a las ' + hhmm(t[1]);
    } else {
      var siguiente = tramos.filter(function (t) { return min < t[0]; })[0];
      if (siguiente) {
        texto.textContent = 'Cerrado ahora · abre hoy a las ' + hhmm(siguiente[0]);
      } else {
        var d = dia, vueltas = 0;
        do { d = (d + 1) % 7; vueltas++; } while (!(TRAMOS[d] || []).length && vueltas < 8);
        var prim = (TRAMOS[d] || [[630, 840]])[0];
        texto.textContent = 'Cerrado ahora · abre el ' + NOMBRES[d] + ' a las ' + hhmm(prim[0]);
      }
    }

    // marcar el día de hoy en la tabla (lunes en la primera fila)
    var filas = document.querySelectorAll('#horarioCuerpo tr');
    var indiceHoy = (dia + 6) % 7;
    filas.forEach(function (f, i) { f.classList.toggle('hoy', i === indiceHoy); });
  }
  pintarEstado();
  setInterval(pintarEstado, 60000);

  /* ---------- 14 · el mapa solo si lo pides ---------- */
  var mapaBoton = document.getElementById('mapaBoton');
  if (mapaBoton) {
    mapaBoton.addEventListener('click', function () {
      var hueco = document.getElementById('mapaConsent');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.google.com/maps?q=' +
        encodeURIComponent('Ponteceso, A Coruña') + '&output=embed';
      iframe.title = 'Mapa de Ponteceso (A Coruña), donde estaría el taller';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      hueco.replaceWith(iframe);
    });
  }

  /* ---------- 15 · refresco final ---------- */
  if (hayGsap) {
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
})();
