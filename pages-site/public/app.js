/* Motion direction adapted from MotionSites' free Prisma Creative Studio prompt.
   Native CSS / Web APIs keep the static portfolio portable to GitHub Pages. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = $('.menu-toggle');
  const navigation = $('#navigation');

  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', '展开导航');
    navigation.classList.remove('is-open');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '收起导航' : '展开导航');
    navigation.classList.toggle('is-open', open);
  });
  $$('a', navigation).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });

  // Prisma: pull-up text, 20 px travel with 80 ms stagger.
  if (!reducedMotion.matches) {
    $$('.hero-copy h1, .hero-copy h2, .section h2').forEach(heading => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        if (!walker.currentNode.parentElement.closest('.name-stamp')) nodes.push(walker.currentNode);
      }
      let i = 0;
      nodes.forEach(node => {
        const text = node.textContent;
        if (!text.trim()) return;
        const span = document.createElement('span');
        span.className = 'pull-up';
        span.style.setProperty('--word-delay', `${i++ * 80}ms`);
        span.textContent = text;
        node.replaceWith(span);
      });
    });
  }

  if ('IntersectionObserver' in window) {
    if (!reducedMotion.matches) document.documentElement.classList.add('js-motion');
    $$('.project-grid .reveal, .life-grid .reveal').forEach((element, i) => {
      element.style.setProperty('--reveal-delay', `${innerWidth > 760 ? (i % 2) * 150 : 0}ms`);
    });
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
    $$('.reveal').forEach(element => revealObserver.observe(element));
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('#navigation a').forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-15% 0px -65% 0px'});
    $$('main > section').forEach(section => sectionObserver.observe(section));
  }

  // Prisma: character opacity follows reading progress, 0.2 → 1.
  const intro = $('.intro-text');
  let letters = [];
  if (!reducedMotion.matches) {
    const text = intro.textContent;
    const accessible = document.createElement('span');
    accessible.className = 'sr-only';
    accessible.textContent = text;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    letters = [...text].map(char => {
      const letter = document.createElement('span');
      letter.className = 'intro-letter';
      letter.textContent = char;
      visual.append(letter);
      return letter;
    });
    intro.replaceChildren(accessible, visual);
  }
  let framePending = false;
  function updateScroll() {
    framePending = false;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    $('.reading-progress').style.width = `${scrollable > 0 ? scrollY / scrollable * 100 : 0}%`;
    if (letters.length && !reducedMotion.matches) {
      const rect = intro.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight * .88 - rect.top) / (innerHeight * .36)));
      letters.forEach((letter, i) => {
        const fraction = i / letters.length;
        const local = Math.max(0, Math.min(1, (progress - fraction * .7) / .3));
        letter.style.opacity = String(.2 + local * .8);
      });
    }
  }
  function queueScroll() {
    if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
  }
  addEventListener('scroll', queueScroll, {passive: true});
  addEventListener('resize', queueScroll, {passive: true});
  updateScroll();

  const pavilion = $('#pavilion');
  const drawingToggle = $('#drawing-toggle');
  drawingToggle.disabled = true;
  fetch('./assets/pavilion.svg').then(response => {
    if (!response.ok) throw new Error('Drawing unavailable');
    return response.text();
  }).then(source => {
    const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) throw new Error('Invalid drawing');
    const svg = document.importNode(parsed.documentElement, true);
    pavilion.replaceChildren(svg);
    pavilion.classList.add('is-ready');
    drawingToggle.disabled = false;
    drawingToggle.addEventListener('click', () => {
      const expanded = drawingToggle.getAttribute('aria-pressed') !== 'true';
      svg.classList.toggle('exploded', expanded);
      drawingToggle.setAttribute('aria-pressed', String(expanded));
      drawingToggle.replaceChildren(document.createTextNode(expanded ? '收起图纸 ' : '展开图纸 '));
      const arrow = document.createElement('span');
      arrow.textContent = expanded ? '↙' : '↗';
      drawingToggle.append(arrow);
      $('#view-caption').textContent = expanded ? 'A—A / 分层视图' : 'A—A / 结构视图';
    });
  }).catch(() => {
    // The image fallback and all personal content remain available offline.
    drawingToggle.hidden = true;
  });

  if (matchMedia('(pointer: fine)').matches && !reducedMotion.matches) {
    $('.hero-art').addEventListener('pointermove', event => {
      const rect = event.currentTarget.getBoundingClientRect();
      $('#coord-x').textContent = String(Math.round(event.clientX - rect.left)).padStart(3, '0');
      $('#coord-y').textContent = String(Math.round(event.clientY - rect.top)).padStart(3, '0');
    }, {passive: true});
  }

  // Native dialog supplies focus trapping, Escape support and modal semantics.
  const dialog = $('#archive-dialog');
  let dialogTrigger;
  const archiveRows = $$('.archive-row');
  archiveRows.forEach(row => row.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    dialogTrigger = row;
    const imagePath = `./assets/${row.dataset.image}`;
    $('#dialog-image').src = imagePath;
    $('#dialog-image').alt = row.dataset.title + '原始材料';
    $('#dialog-title').textContent = row.dataset.title;
    $('#dialog-description').textContent = row.dataset.description;
    $('#dialog-original').href = imagePath;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    dialogTrigger?.focus({preventScroll:true});
  });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    $$('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    archiveRows.forEach(row => {
      row.hidden = category !== 'all' && row.dataset.category !== category;
      if (!row.hidden) count++;
    });
    $('.filter-status').textContent = `显示 ${count} 项成果`;
    queueScroll();
  }));

  $('#copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('mshuwhu@whu.edu.cn');
      $('#copy-status').textContent = '邮箱已复制';
    } catch {
      const email = $('.contact-links strong');
      const range = document.createRange();
      range.selectNodeContents(email);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      $('#copy-status').textContent = '已选中邮箱，可手动复制';
    }
  });
})();
