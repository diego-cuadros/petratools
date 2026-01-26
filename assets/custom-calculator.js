const dc_modal = document.getElementById('dc_calculator-modal');
  const dc_trigger = document.getElementById('dc_calcTrigger');
  const dc_closeBtn = document.querySelector('.dc_calculator-close-button');
  const dc_calcBtn = document.getElementById('dc_do-calculate');
  const dc_addToOrderBtn = document.getElementById('dc_add-to-cart-trigger');

  // Store reference to what opened the modal
  let dc_previousActiveElement = null;

  // --- MODAL HELPERS ---
  const dc_openModal = () => {
    // Store the current active element BEFORE opening modal
    dc_previousActiveElement = document.activeElement;

    dc_modal.style.display = 'block';
    document.body.classList.add('dc_modal-open');

    // IMPORTANT: Release any existing focus traps
    if (typeof FoxTheme !== 'undefined' && FoxTheme.a11y) {
      FoxTheme.a11y.removeTrapFocus();
    }
  };

  const dc_closeModal = () => {
    dc_modal.style.display = 'none';
    document.body.classList.remove('dc_modal-open');

    // Restore focus after a small delay to ensure modal is closed
    setTimeout(() => {
      if (dc_previousActiveElement && document.body.contains(dc_previousActiveElement)) {
        dc_previousActiveElement.focus();
      }
      dc_previousActiveElement = null;
    }, 50);
  };

  // Event listeners for modal
  if (dc_trigger) {
    dc_trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      dc_openModal();
    });
  }

  if (dc_closeBtn) {
    dc_closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dc_closeModal();
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === dc_modal) {
      dc_closeModal();
    }
  });

  // --- CALCULATION ---
  if (dc_calcBtn) {
    dc_calcBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const cov = parseFloat(dc_modal.getAttribute('data-coverage')) || 1;
      const w = parseFloat(document.getElementById('dc_calc-width').value) || 0;
      const l = parseFloat(document.getElementById('dc_calc-length').value) || 0;

      const areaM2 = w * l;
      const areaSqFt = areaM2 * 10.764;
      const total = Math.ceil(areaSqFt / cov);

      document.getElementById('dc_area-display').innerHTML = `
        <strong>${areaM2}m2 = ${Math.round(areaSqFt)} Sq. Ft.</strong>
      `;
      document.getElementById('dc_gallons-display').innerText = total;
    });
  }

  // --- ADD TO ORDER (UI SIMULATION VERSION) ---
  if (dc_addToOrderBtn) {
    dc_addToOrderBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // 1. Get the target quantity from the calculator
      const targetQty = parseInt(document.getElementById('dc_gallons-display').innerText) || 1;

      // 2. Find the UI elements on the product page
      const quantityInput = document.querySelector('.quantity__input');
      const plusButton = document.querySelector('button[name="plus"]');
      const minusButton = document.querySelector('button[name="minus"]');
      const mainAddToCartButton = document.querySelector('.product-form__submit');

      if (!quantityInput || !mainAddToCartButton) {
        console.error('Required product form elements not found.');
        return;
      }

      // 3. Close the modal first for a clean handoff
      dc_closeModal();

      // 4. Adjust the quantity by simulating button clicks
      // We do this to ensure all theme-specific "on change" logic is triggered
      let currentQty = parseInt(quantityInput.value) || 1;

      if (currentQty < targetQty) {
        // Need to increase
        const clicksNeeded = targetQty - currentQty;
        for (let i = 0; i < clicksNeeded; i++) {
          if (plusButton) plusButton.click();
        }
      } else if (currentQty > targetQty) {
        // Need to decrease
        const clicksNeeded = currentQty - targetQty;
        for (let i = 0; i < clicksNeeded; i++) {
          if (minusButton && !minusButton.disabled) minusButton.click();
        }
      }

      // Double check: if buttons didn't work for some reason, force the value
      quantityInput.value = targetQty;
      quantityInput.dispatchEvent(new Event('change', { bubbles: true }));

      // 5. Final Step: Simulate clicking the main "Add to Cart" button
      // This allows the theme's native Ajax and Drawer logic to take over
      setTimeout(() => {
        mainAddToCartButton.click();
      }, 100);
    });
  }