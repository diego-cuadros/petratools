document.addEventListener('click', function(e) {
  const header = e.target.closest('.dc-collapsible-with-table__header');
  if (header) {
    e.preventDefault();
    e.stopImmediatePropagation();
    
    const item = header.closest('.dc-collapsible-with-table__item');
    if (item) {
      item.classList.toggle('dc-collapsible-with-table-is-open');
      header.setAttribute('aria-expanded', 'true');
    }
  }
});