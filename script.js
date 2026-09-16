const galleryGrid = document.querySelector('.gallery-grid');
const hero = document.querySelector('.hero');
const heroImages = ['hero1.webp', 'hero2.webp', 'hero3.webp', 'hero4.webp'];
const rootPhotos = Array.from(
  { length: 29 },
  (_, index) => `gallery/photo-${String(index + 1).padStart(2, '0')}.jpg`
);
const videoAssets = [
  { src: 'gallery/video-01-web.webm', poster: 'gallery/photo-05.jpg' },
  { src: 'gallery/video-02-web.webm', poster: 'gallery/photo-06.jpg' },
  { src: 'gallery/video-03-web.webm', poster: 'gallery/photo-07.jpg' },
];
const videoPosterPaths = new Set(videoAssets.map((video) => video.poster));
const reservedPhotoPaths = new Set(videoPosterPaths);
const photoAssets = rootPhotos
  .filter((path) => path !== 'gallery/photo-12.jpg')
  .filter((path) => !reservedPhotoPaths.has(path));

const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
};

const heroImage = heroImages[Math.floor(Math.random() * heroImages.length)];
hero.style.setProperty('--hero-image', `url("gallery/${heroImage}")`);

const imageOrientation = (path) => {
  const filename = path.match(/(?:photo|vertical)-(\d+)/)?.[1];
  const isVertical = Number(filename) <= 10;
  return isVertical ? 'media-vertical' : 'media-horizontal';
};

const createImageTile = (path, index) => {
  const tile = document.createElement('figure');
  const image = document.createElement('img');
  tile.className = `media-tile ${imageOrientation(path)}`;
  image.alt = `Zdjęcie z imprezy ${index + 1}`;
  image.src = path;
  tile.append(image);
  return tile;
};

const createVideoTile = (path, index) => {
  const tile = document.createElement('figure');
  const image = document.createElement('img');
  const trigger = document.createElement('button');
  const playIcon = document.createElement('i');
  const triggerLabel = document.createElement('span');
  const caption = document.createElement('figcaption');
  tile.className = 'media-tile video-tile media-vertical';
  tile.dataset.video = path.src;
  image.alt = 'Krótkie, dynamiczne ujęcia z imprezy urodzinowej';
  image.src = path.poster;
  trigger.className = 'video-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', 'Zobacz rolkę z imprezy urodzinowej');
  playIcon.className = 'play-icon fa-solid fa-play';
  triggerLabel.textContent = 'Zobacz rolkę';
  trigger.append(playIcon, triggerLabel);
  caption.className = 'tile-label';
  caption.textContent = 'Rolka z imprezy urodzinowej';
  tile.append(image, trigger, caption);
  return tile;
};

galleryGrid.innerHTML = '';
const shuffledPhotos = shuffle(photoAssets);
const shuffledVideos = shuffle(videoAssets);
let videoIndex = 1;

galleryGrid.append(createVideoTile(shuffledVideos[0], 0));

shuffledPhotos.forEach((path, index) => {
  galleryGrid.append(createImageTile(path, index));
  if ((index + 1) % 7 === 0 && videoIndex < videoAssets.length) {
    galleryGrid.append(createVideoTile(shuffledVideos[videoIndex], videoIndex));
    videoIndex += 1;
  }
});

const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('.lightbox-image');
const lightboxVideo = lightbox.querySelector('.lightbox-video');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
const lightboxClose = lightbox.querySelector('.lightbox-close');

const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImage.hidden = false;
  lightboxImage.src = '';
  lightboxVideo.pause();
  lightboxVideo.removeAttribute('src');
  lightboxVideo.load();
};

const openImage = (image) => {
  lightboxImage.hidden = false;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxVideo.hidden = true;
  lightboxCaption.textContent = image.alt;
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
};

const openVideo = (tile) => {
  const poster = tile.querySelector('img');
  lightboxImage.hidden = true;
  lightboxVideo.hidden = false;
  lightboxVideo.poster = poster.currentSrc || poster.src;
  lightboxVideo.src = tile.dataset.video;
  lightboxCaption.textContent = poster.alt;
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxVideo.play().catch(() => {});
  lightboxClose.focus();
};

document.querySelectorAll('.media-tile:not(.video-tile)').forEach((tile) => {
  const image = tile.querySelector('img');
  tile.setAttribute('tabindex', '0');
  tile.setAttribute('role', 'button');
  tile.setAttribute('aria-label', `Powiększ zdjęcie: ${image.alt}`);

  tile.addEventListener('click', () => openImage(image));
  tile.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openImage(image);
    }
  });
});

document.querySelectorAll('.video-tile').forEach((tile) => {
  const trigger = tile.querySelector('.video-trigger');
  tile.setAttribute('tabindex', '0');
  tile.setAttribute('role', 'button');
  tile.setAttribute('aria-label', `Otwórz video: ${tile.querySelector('img').alt}`);

  tile.addEventListener('click', () => openVideo(tile));
  tile.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openVideo(tile);
    }
  });
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    openVideo(tile);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
});

// Formularz kontaktowy jest w index.html zakomentowany, więc nie zakładamy, że istnieje.
const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = document.querySelector('#form-status');
    status.textContent =
      'Dziękuję. Formularz jest gotowy do podpięcia pod [DO PODMIANY] adres e-mail lub CRM.';
  });
}
