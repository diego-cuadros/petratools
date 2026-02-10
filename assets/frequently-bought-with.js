if (!customElements.get('frequently-bought-with')) {
  customElements.define(
    'frequently-bought-with',
    class FrequentlyBoughtWith extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.checkbox = this.querySelector('.frequently-bought-with-checkbox');
        this.card = this.querySelector('.frequently-bought-with-card');
        
        if (this.checkbox) {
          this.checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
          
          // Make clicking on card toggle checkbox
          this.card?.addEventListener('click', (e) => {
            if (e.target !== this.checkbox && !e.target.closest('a')) {
              this.checkbox.checked = !this.checkbox.checked;
              this.handleCheckboxChange();
            }
          });
        }
      }

      handleCheckboxChange() {
        const isChecked = this.checkbox.checked;
        const productId = this.checkbox.dataset.productId;
        const variantId = this.checkbox.dataset.variantId;
        const productTitle = this.checkbox.dataset.productTitle;
        const productPrice = this.checkbox.dataset.productPrice;

        // Update card visual state
        if (isChecked) {
          this.card?.classList.add('frequently-bought-with-card--selected');
        } else {
          this.card?.classList.remove('frequently-bought-with-card--selected');
        }

        // Dispatch custom event for parent components to listen to
        this.dispatchEvent(
          new CustomEvent('frequently-bought-with:change', {
            detail: {
              isChecked,
              productId,
              variantId,
              productTitle,
              productPrice
            },
            bubbles: true,
            composed: true
          })
        );

        // You can add cart functionality here if needed
        if (isChecked) {
          this.addToCart(variantId);
        } else {
          this.removeFromCart(productId);
        }
      }

      addToCart(variantId) {
        const formData = {
          items: [
            {
              id: parseInt(variantId, 10),
              quantity: 1
            }
          ]
        };

        fetch(`${window.Shopify.routes.root}cart/add.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
          .then((response) => response.json())
          .then((data) => {
            // Dispatch event to notify cart was updated
            window.dispatchEvent(
              new CustomEvent('cart:updated', {
                detail: data
              })
            );
          })
          .catch((error) => {
            console.error('Error adding to cart:', error);
          });
      }

      removeFromCart(productId) {
        // Get current cart and find the line item to remove
        fetch(`${window.Shopify.routes.root}cart.js`)
          .then((response) => response.json())
          .then((cart) => {
            // Find the line item index for this product
            let lineIndex = 0;
            for (let i = 0; i < cart.items.length; i++) {
              if (cart.items[i].product_id === parseInt(productId, 10)) {
                lineIndex = i + 1;
                break;
              }
            }

            if (lineIndex > 0) {
              const formData = new FormData();
              formData.append('updates', JSON.stringify({ [lineIndex]: 0 }));

              return fetch(`${window.Shopify.routes.root}cart/update.js`, {
                method: 'POST',
                body: formData
              });
            }
          })
          .then((response) => response.json())
          .then((data) => {
            // Dispatch event to notify cart was updated
            window.dispatchEvent(
              new CustomEvent('cart:updated', {
                detail: data
              })
            );
          })
          .catch((error) => {
            console.error('Error removing from cart:', error);
          });
      }
    }
  );
}
