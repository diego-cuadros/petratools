if (!customElements.get('build-your-kit-bundle')) {
  customElements.define(
    'build-your-kit-bundle',
    class BuildYourKitBundle extends HTMLElement {
      connectedCallback() {
        this.coverage = parseFloat(this.dataset.coverage) || 1;
        this.unitName = this.dataset.unitName || 'units';
        this.moneyFormat =
          (window.FoxTheme && window.FoxTheme.settings && window.FoxTheme.settings.moneyFormat) ||
          this.dataset.moneyFormat ||
          '${{amount}}';

        this.product1VariantId = parseInt(this.dataset.product1VariantId || '0', 10);
        this.product1Price = parseInt(this.dataset.product1Price || '0', 10);
        this.product2VariantId = parseInt(this.dataset.product2VariantId || '0', 10);
        this.product2Price = parseInt(this.dataset.product2Price || '0', 10);

        this.widthInput = this.querySelector('[data-width]');
        this.lengthInput = this.querySelector('[data-length]');
        this.calcButton = this.querySelector('[data-calc]');
        this.addToCartButton = this.querySelector('[data-add-to-cart]');
        this.totalEl = this.querySelector('[data-total]');
        this.qtyEl = this.querySelector('[data-qty]');
        this.unitNameEl = this.querySelector('[data-unit-name]');
        this.product1Checkbox = this.querySelector('[data-product-checkbox="1"]');
        this.product2Checkbox = this.querySelector('[data-product-checkbox="2"]');

        if (this.unitNameEl) {
          this.unitNameEl.textContent = this.unitName;
        }

        console.log('Product 1 Price:', this.product1Price);
        console.log('Product 1 Checked:', this.product1Checkbox?.checked);

        this.product1Qty = 1;
        this.updateTotal();

        this.calcButton && this.calcButton.addEventListener('click', this.handleCalculate);
        this.product1Checkbox && this.product1Checkbox.addEventListener('change', this.updateTotal);
        this.product2Checkbox && this.product2Checkbox.addEventListener('change', this.updateTotal);
        this.addToCartButton && this.addToCartButton.addEventListener('click', this.handleAddToCart);
      }

      handleCalculate = () => {
        const width = parseFloat(this.widthInput?.value || '0');
        const length = parseFloat(this.lengthInput?.value || '0');
        const areaM2 = width * length;
        const areaSqFt = areaM2 * 10.764;
        const calculated = areaSqFt > 0 ? Math.ceil(areaSqFt / this.coverage) : 1;

        this.product1Qty = Math.max(1, calculated);
        if (this.qtyEl) {
          this.qtyEl.textContent = String(this.product1Qty);
        }

        this.updateTotal();
      };

      updateTotal = () => {
        const includeProduct1 = this.product1Checkbox ? this.product1Checkbox.checked : false;
        const includeProduct2 = this.product2Checkbox ? this.product2Checkbox.checked : false;

        let total = 0;
        if (includeProduct1 && this.product1VariantId) {
          total += this.product1Price * this.product1Qty;
        }
        if (includeProduct2 && this.product2VariantId) {
          total += this.product2Price;
        }

        if (this.totalEl) {
          this.totalEl.textContent = this.formatMoney(total);
        }
      };

      formatMoney = (cents) => {
        if (window.FoxTheme && window.FoxTheme.Currency && window.FoxTheme.Currency.formatMoney) {
          return window.FoxTheme.Currency.formatMoney(cents, this.moneyFormat);
        }
        const dollars = (cents / 100).toFixed(2);
        return `$${dollars}`;
      };

      handleAddToCart = (event) => {
        event.preventDefault();

        const items = [];
        if (this.product1Checkbox?.checked && this.product1VariantId) {
          items.push({ id: this.product1VariantId, quantity: this.product1Qty });
        }
        if (this.product2Checkbox?.checked && this.product2VariantId) {
          items.push({ id: this.product2VariantId, quantity: 1 });
        }

        if (!items.length) {
          return;
        }

        const sections = [];
        document.documentElement.dispatchEvent(
          new CustomEvent('cart:grouped-sections', { bubbles: true, detail: { sections } })
        );

        const config =
          window.FoxTheme && window.FoxTheme.utils && window.FoxTheme.utils.fetchConfig
            ? window.FoxTheme.utils.fetchConfig('javascript')
            : {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              };

        config.headers = config.headers || {};
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        config.body = JSON.stringify({
          items,
          sections,
          sections_url: window.location.pathname,
        });

        this.addToCartButton?.setAttribute('aria-disabled', 'true');
        this.addToCartButton?.classList.add('is-loading');
        const lastClicked = event.currentTarget;

        fetch(window.FoxTheme?.routes?.cart_add_url || `${window.Shopify.routes.root}cart/add.js`, config)
          .then((response) => response.json())
          .then(async (parsedState) => {
            if (parsedState.status) {
              return;
            }

            const cartJson = await (
              await fetch(window.FoxTheme?.routes?.cart_url || `${window.Shopify.routes.root}cart.js`)
            ).json();
            cartJson.sections = parsedState.sections;

            if (window.FoxTheme?.pubsub) {
              window.FoxTheme.pubsub.publish(window.FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate, { cart: cartJson });
            }

            const cartDrawer = document.querySelector('cart-drawer');
            if (cartDrawer && typeof cartDrawer.show === 'function') {
              cartDrawer.show(lastClicked);
            }
          })
          .catch(() => {})
          .finally(() => {
            this.addToCartButton?.removeAttribute('aria-disabled');
            this.addToCartButton?.classList.remove('is-loading');
          });
      };
    }
  );
}
