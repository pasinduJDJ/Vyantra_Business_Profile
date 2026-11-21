'use strict';

/* ─── Mobile nav ─────────────────────────────────────────────────────────── */
const menuButton = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.navlinks');
menuButton.hidden = false;
menuButton.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}));

/* ─── Footer year ────────────────────────────────────────────────────────── */
document.querySelector('#year').textContent = String(new Date().getFullYear());

/* ─── Save contact (vCard) ───────────────────────────────────────────────── */
document.querySelector('#save-contact').addEventListener('click', () => {
  const vcard = [
    'BEGIN:VCARD', 'VERSION:3.0',
    'FN:Vyantra Global Engineering (Pvt) Ltd',
    'ORG:Vyantra Global Engineering (Pvt) Ltd',
    'TEL;TYPE=WORK,VOICE:+94715532956',
    'EMAIL;TYPE=WORK:vyantraglobalengineering@gmail.com',
    'URL:https://vyantraglobal.com',
    'NOTE:Engineering Beyond Boundaries',
    'END:VCARD'
  ].join('\r\n');
  const url    = URL.createObjectURL(new Blob([vcard], { type: 'text/vcard;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'Vyantra-Global-Engineering.vcf';
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});


const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const loader = document.querySelector('.site-loader');
if (!motionPreference.matches) {
  loader.hidden = false;
  setTimeout(() => loader.remove(), 1650);
}

const track = document.querySelector('.services-track');
const cards = Array.from(track.children);
for (const card of cards) {
  const copy = card.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.classList.add('carousel-copy');
  track.append(copy);
}

const firstCopy = track.children[cards.length];
let autoplay = !motionPreference.matches;
let inView = false;
let touching = false;
let frame = 0;
let lastTime;
let position;

function animate(time) {
  if (lastTime === undefined || Math.abs(track.scrollLeft - position) > 2) {
    position = track.scrollLeft;
  }
  const cycleWidth = firstCopy.offsetLeft - cards[0].offsetLeft;
  if (lastTime !== undefined && cycleWidth > 0) {
    position = (position + Math.min(time - lastTime, 50) * 0.045) % cycleWidth;
    track.scrollLeft = position;
  }
  lastTime = time;
  frame = requestAnimationFrame(animate);
}

function syncCarousel() {
  cancelAnimationFrame(frame);
  lastTime = undefined;
  track.classList.toggle('is-playing', autoplay);
  if (autoplay && inView && !document.hidden && !touching && !track.matches(':hover, :focus-within')) {
    frame = requestAnimationFrame(animate);
  }
}

function setAutoplay(enabled) {
  if (!enabled && autoplay) {
    const cycleWidth = firstCopy.offsetLeft - cards[0].offsetLeft;
    if (cycleWidth > 0) track.scrollLeft %= cycleWidth;
  }
  autoplay = enabled;
  syncCarousel();
}

motionPreference.addEventListener('change', event => {
  if (event.matches) {
    setAutoplay(false);
    loader.remove();
  }
});
for (const event of ['mouseenter', 'mouseleave', 'focusin', 'focusout']) {
  track.addEventListener(event, syncCarousel);
}
track.addEventListener('touchstart', () => {
  touching = true;
  syncCarousel();
}, { passive: true });
function endTouch() {
  touching = false;
  syncCarousel();
}
track.addEventListener('touchend', endTouch, { passive: true });
track.addEventListener('touchcancel', endTouch, { passive: true });
document.addEventListener('visibilitychange', syncCarousel);
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncCarousel();
}).observe(track);
setAutoplay(autoplay);

/* Reveal each section detail on its first entry into the viewport. */
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!motionPreference.matches) target.classList.add('scroll-revealed');
    }
  }, { threshold: 0.12 });

  document.querySelectorAll(
    '.about-content, .about-photo, .equipment-card, .solutions .section-heading, .contact-panel'
  ).forEach(element => revealObserver.observe(element));
}
