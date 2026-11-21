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

const track = document.querySelector('.services-track');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const cards = Array.from(track.children);
const copies = cards.map(card => {
  const copy = card.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  return copy;
});
let inView = false;
let touching = false;
let frame;
let previousTime;
let position;

function advanceCarousel(time) {
  if (previousTime === undefined || Math.abs(track.scrollLeft - position) > 2) {
    position = track.scrollLeft;
  }
  const cycleWidth = copies[0].offsetLeft - cards[0].offsetLeft;
  if (previousTime !== undefined && cycleWidth > 0) {
    position = (position + Math.min(time - previousTime, 50) * 0.045) % cycleWidth;
    track.scrollLeft = position;
  }
  previousTime = time;
  frame = requestAnimationFrame(advanceCarousel);
}

function syncCarousel() {
  cancelAnimationFrame(frame);
  previousTime = undefined;
  if (inView && !motionPreference.matches && !document.hidden && !touching && !track.matches(':hover, :focus-within')) {
    frame = requestAnimationFrame(advanceCarousel);
  }
}

function updateMotion() {
  if (motionPreference.matches) {
    const cycleWidth = copies[0].offsetLeft - cards[0].offsetLeft;
    if (cycleWidth > 0) track.scrollLeft %= cycleWidth;
    copies.forEach(copy => copy.remove());
  } else {
    track.append(...copies);
  }
  syncCarousel();
}

if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncCarousel();
  }).observe(track);
  motionPreference.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', syncCarousel);
  for (const event of ['mouseenter', 'mouseleave', 'focusin']) {
    track.addEventListener(event, syncCarousel);
  }
  track.addEventListener('focusout', () => setTimeout(syncCarousel, 0));
  track.addEventListener('touchstart', () => {
    touching = true;
    syncCarousel();
  }, { passive: true });
  for (const event of ['touchend', 'touchcancel']) {
    track.addEventListener(event, () => {
      touching = false;
      syncCarousel();
    }, { passive: true });
  }
  updateMotion();
}
