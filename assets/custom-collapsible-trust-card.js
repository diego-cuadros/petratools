document.querySelectorAll('.dc-trust-item__header').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
      const item = button.closest('.dc-trust-item');
      item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
    });
  });