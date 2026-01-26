document.querySelectorAll('.dc-trust-item__header').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.dc-trust-item');
      item.classList.toggle('is-open');
    });
  });