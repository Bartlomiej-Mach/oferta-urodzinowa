/* Animacje GSAP dla oferty Maszon Photo.
 *
 * Plik ładuje się na końcu <body>, po vendor/gsap.min.js, vendor/ScrollTrigger.min.js
 * i script.js (wszystkie z "defer"), więc galeria generowana dynamicznie przez
 * script.js jest już w DOM w momencie startu animacji.
 *
 * Animacje uruchamiamy zawsze – świadomie ignorujemy systemowe ustawienie
 * "prefers-reduced-motion" (właśnie dlatego nie ma tu żadnego wczesnego returnu).
 * Jeśli kiedyś będzie chciał je uszanować, wystarczy na początku dopisać:
 * if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 *
 * Zachowanie awaryjne: gdy GSAP się nie wczyta, strona działa jak wcześniej
 * (hero korzysta wtedy z animacji CSS klasy .reveal).
 *
 * Diagnostyka: stan jest widoczny w atrybucie data-animations na <html> oraz w konsoli
 * jako komunikat "[animacje] ...".
 *
 * Intro hero startuje po stałej heroIntroDelay (1 sekunda od wejścia na stronę) –
 * zmień tę liczbę, jeśli chcesz inne opóźnienie lub start od razu (0).
 */

(() => {
  const gsap = window.gsap;
  const root = document.documentElement;

  if (!gsap) {
    root.dataset.animations = 'brak-gsap';
    console.warn('[animacje] Brak GSAP – sprawdź, czy vendor/gsap.min.js wczytuje się bez błędu.');
    return;
  }

  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const plugins = ScrollTrigger ? ' + ScrollTrigger' : ' (bez ScrollTriggera)';
  root.dataset.animations = ScrollTrigger ? 'aktywne' : 'tylko-intro';
  console.info(`[animacje] GSAP ${gsap.version}${plugins}`);

  const $ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* 1. Intro w hero ------------------------------------------------------ */
  // Pauza (w sekundach) między wejściem na stronę a startem animacji hero.
  const heroIntroDelay = 0.5;
  const heroContent = document.querySelector('.hero-content');

  if (heroContent) {
    // Przejmujemy animację od CSS (.reveal), żeby ten sam element nie animował się dwa razy.
    heroContent.style.animation = 'none';

    // Stan wyjściowy ustawiamy od razu, żeby w czasie pauzy hero było ukryte,
    // a nie mrugało treścią tuż przed startem animacji.
    // Nagłówek animujemy linia po linii (.hero-line), więc nie ma go w tym zbiorze.
    gsap.set('.site-nav .logo', { opacity: 0, y: -18 });
    gsap.set('.hero-content .eyebrow, .hero-lead, .hero-content .button', { opacity: 0, y: 26 });
    gsap.set('.hero-line', { opacity: 0, y: 26 });
    gsap.set('.hero-note', { opacity: 0, y: 12 });

    gsap
      .timeline({ delay: heroIntroDelay, defaults: { ease: 'power3.out', duration: 0.9 } })
      .to('.site-nav .logo', { opacity: 1, y: 0, duration: 0.7 }, 0)
      .to('.hero-content .eyebrow', { opacity: 1, y: 0, duration: 0.7 }, 0.15)
      .to('.hero-line', { opacity: 1, y: 0, duration: 0.85, stagger: 0.18 }, 0.3)
      .to('.hero-lead', { opacity: 1, y: 0 }, 0.85)
      .to('.hero-content .button', { opacity: 1, y: 0 }, 1.05)
      .to('.hero-note', { opacity: 1, y: 0, duration: 0.6 }, 1.2);
  }

  /* 2. Parallax hero przy przewijaniu ------------------------------------ */
  // Zdjęcie i wideo to osobne warstwy, więc przesuwamy je transformacją (tanio, na GPU).
  // Zapas na ruch daje skala: przy scale 1.15 warstwa ma 7,5% zapasu z każdej strony,
  // więc yPercent nie może przekroczyć ±7. Chcesz mocniej? Podnoś scale i yPercent razem.
  if (ScrollTrigger) {
    const heroScrollConfig = () => ({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    });

    gsap.fromTo(
      '.hero-media',
      { scale: 1.15, yPercent: -6 },
      { scale: 1.15, yPercent: 30, ease: 'none', scrollTrigger: heroScrollConfig() }
    );

    gsap.fromTo(
      '.hero-video',
      { scale: 1.15, yPercent: -6 },
      { scale: 1.15, yPercent: 30, ease: 'none', scrollTrigger: heroScrollConfig() }
    );

    gsap.to('.hero-content', { yPercent: -26, ease: 'none', scrollTrigger: heroScrollConfig() });

    gsap.to('.hero-note', { yPercent: 160, ease: 'none', scrollTrigger: heroScrollConfig() });
  }

  // Odsłanianie przy scrollu wymaga ScrollTriggera – bez niego kończymy na intro.
  if (!ScrollTrigger) return;

  /* 3. Pomocnik: odsłanianie elementów wraz ze scrollem ------------------ */
  // Lista animacji, które jeszcze nie wystartowały – używa jej showUnreachable() niżej.
  const pendingReveals = [];

  const reveal = (targets, options = {}) => {
    const elements = typeof targets === 'string' ? $(targets) : targets;

    elements.forEach((element, index) => {
      const tween = gsap.from(element, {
        opacity: 0,
        x: options.x || 0,
        y: options.y ?? 28,
        duration: options.duration || 0.9,
        ease: 'power3.out',
        delay: options.stagger ? Math.min(index * options.stagger, 0.5) : 0,
        scrollTrigger: { trigger: element, start: options.start || 'top 85%', once: true },
      });

      pendingReveals.push(tween);
    });
  };

  /* 4. Sekcje: nagłówki, karty i teksty ---------------------------------- */
  reveal('.about-photo', { x: -40, y: 0, duration: 1 });
  reveal('.about-copy .eyebrow, .about-copy h2, .about-copy > p:not(.signature), .signature', {
    y: 24,
    stagger: 0.08,
  });

  reveal('.gallery-heading > div > *, .gallery-heading > p', { y: 24, stagger: 0.08 });
  reveal('.quotes-head .eyebrow, .quotes-head h2, .quote-mark', { y: 24, stagger: 0.08 });
  reveal('.quote-grid blockquote', { y: 34, stagger: 0.14 });
  reveal('.quotes-cta-text, .quotes-cta-buttons .button', { y: 22, stagger: 0.1 });

  reveal('.pricing-header > div > *, .pricing-header > p', { y: 24, stagger: 0.08 });
  reveal('.package-standard, .delivery-note', { y: 24, stagger: 0.08 });
  reveal('.package', { y: 40, stagger: 0.1 });
  reveal('.extras-heading > *, .extra', { y: 28, stagger: 0.08 });

  reveal('.process .eyebrow, .process h2', { y: 24, stagger: 0.08 });
  reveal('.process-step', { y: 34, stagger: 0.1 });
  reveal('.process-step .step-number', { y: 0, x: -18, duration: 0.6, stagger: 0.1 });

  reveal('.contact .eyebrow, .contact h2, .contact-lead, .contact-details', {
    y: 24,
    stagger: 0.08,
  });
  // Stopka celowo bez animacji: leży na samym dole dokumentu, więc jej górna krawędź
  // nigdy nie przekroczy linii startu 'top 85%' i gsap.from() zostawiłby ją trwale ukrytą.
  // Gdybyś chciał ją jednak animować, użyj start: 'top bottom' – wtedy odpala się zawsze.

  /* 5. Kafle galerii – pojawiają się partiami wraz ze scrollem ------------ */
  const tiles = $('.gallery-grid .media-tile');

  if (tiles.length) {
    ScrollTrigger.batch(tiles, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          opacity: 0,
          y: 40,
          scale: 0.97,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.08,
        }),
    });
  }

  /* 6. Otwieranie powiększenia (lightbox) -------------------------------- */
  const lightbox = document.querySelector('#lightbox');

  if (lightbox) {
    const observer = new MutationObserver(() => {
      if (!lightbox.classList.contains('is-open')) return;

      const media = lightbox.querySelector(
        '.lightbox-image:not([hidden]), .lightbox-video:not([hidden])'
      );
      const closeButton = lightbox.querySelector('.lightbox-close');

      if (media) gsap.from(media, { opacity: 0, scale: 0.94, duration: 0.5, ease: 'power3.out' });
      if (closeButton) gsap.from(closeButton, { opacity: 0, duration: 0.4, delay: 0.1 });
    });

    observer.observe(lightbox, { attributes: true, attributeFilter: ['class'] });
  }

  /* 7. Zabezpieczenie: elementy, które nigdy nie dotrą do linii startu --- */
  // Gdyby górna krawędź elementu leżała tak nisko, że nawet przy maksymalnym przewinięciu
  // nie przekroczy linii 'top 85%', jego animacja nigdy się nie odpali, a gsap.from()
  // zostawi go trwale ukrytym. Takie elementy pokazujemy od razu w finalnym stanie.
  const showUnreachable = () => {
    const startLine = window.innerHeight * 0.85;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    pendingReveals.forEach((tween) => {
      if (!tween.scrollTrigger || tween.progress() > 0) return;

      const top = tween.targets()[0].getBoundingClientRect().top + window.scrollY;
      const topAtMaxScroll = top - maxScroll;

      if (topAtMaxScroll >= startLine) {
        tween.scrollTrigger.kill();
        tween.progress(1).kill();
      }
    });
  };

  /* 8. Przeliczenie pozycji po wczytaniu zdjęć -------------------------- */
  // Kafle galerii nie mają sztywnego aspect-ratio, więc zdjęcia zmieniają wysokość
  // strony dopiero po wczytaniu – ScrollTrigger musi wtedy przeliczyć swoje punkty.
  let refreshTimer = 0;
  const refreshSoon = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      showUnreachable();
    }, 200);
  };

  refreshSoon();
  window.addEventListener('load', refreshSoon);
  $('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', refreshSoon, { once: true });
  });
})();