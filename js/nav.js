// Ljepljiva navigacija: ističe poglavlje koje je trenutno na sredini ekrana.
export function initNav() {
  const links = [...document.querySelectorAll('#navlinks a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = sections.indexOf(e.target);
      links.forEach((l, j) => l.classList.toggle('on', i === j));
      const a = links[i], box = a.parentElement;
      if (box.scrollWidth > box.clientWidth) {
        box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => obs.observe(s));
}
