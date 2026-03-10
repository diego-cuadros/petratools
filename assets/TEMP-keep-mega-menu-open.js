// TEMPORARY DEV HELPER — remove before deploying
// Keeps the first mega menu item open for easier styling/development.
// To target a specific item, change the querySelector to match its id, e.g.:
//   document.querySelector('#Mega-menu-item-BLOCK_ID')

(function keepMegaMenuOpen() {
  const TARGET_INDEX = 0; // 0 = first mega menu item; change as needed

  function forceOpen() {
    const menus = document.querySelectorAll('details[is="details-mega"]');
    const target = menus[TARGET_INDEX];
    if (!target) return;

    target.open = true;

    // Re-open immediately if something tries to close it
    target.addEventListener('toggle', () => {
      if (!target.open) target.open = true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceOpen);
  } else {
    forceOpen();
  }
})();
