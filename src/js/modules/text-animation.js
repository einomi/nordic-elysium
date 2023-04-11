import gsap from 'gsap';

/** @param {import('../layers/menu-layer/menu-layer.js').default} menuLayer */
export function animateTextElements(menuLayer) {
  const titleEl = document.querySelector('[data-title]');

  if (!titleEl) {
    throw new Error('No title element found');
  }

  const titleSource = titleEl.querySelector('[data-source]');
  const titleLetters = titleEl.querySelector('[data-letters]');

  if (!titleLetters) {
    throw new Error('No title letters found');
  }

  if (!titleSource) {
    throw new Error('No title source found');
  }

  // break into letters, get text from source and put into letters element
  const letters = (titleSource.textContent || '').split('');
  titleLetters.innerHTML = letters
    .map((letter) => `<span>${letter}</span>`)
    .join('');

  const spans = titleLetters.querySelectorAll('span');

  gsap.set(titleLetters, { alpha: 1 });
  gsap.set(spans, { alpha: 0 });

  gsap.to(spans, {
    duration: 1.5,
    alpha: 1,
    ease: 'sine.out',
    stagger: 0.05,
    delay: 0.3,
  });

  const listItems = document.querySelectorAll('[data-list-item]');
  gsap.to(menuLayer.opacity, {
    duration: 1.5,
    value: 1,
    ease: 'sine.out',
    delay: 0.3,
  });

  gsap.fromTo(
    listItems,
    {
      autoAlpha: 0,
      x: 20,
    },
    {
      duration: 1,
      autoAlpha: 1,
      x: 0,
      stagger: 0.15,
      ease: 'sine.out',
      delay: 0.3,
    }
  );
}
