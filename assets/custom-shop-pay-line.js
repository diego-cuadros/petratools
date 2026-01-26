(() => {
              function normalizeShopPayTerms() {
                const terms = document.querySelector('shopify-payment-terms');
                if (!terms?.shadowRoot) return false;

                const container = terms.shadowRoot.querySelector('#shopify-installments');
                if (!container) return false;

                /* Force centered single-line layout */
                container.style.flexDirection = 'row';
                container.style.flexWrap = 'nowrap';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';
                container.style.gap = '6px';
                container.style.textAlign = 'center';

                /* Reduce SVG size so it never wraps */
                const svg = container.querySelector('svg');
                if (svg) {
                  svg.style.width = '48px';
                  svg.style.height = '12px';
                  svg.style.flexShrink = '0';
                  svg.style.display = 'inline-block';
                }

                /* Hide Learn more CTA */
                const cta = terms.shadowRoot.querySelector('#shopify-installments-cta');
                if (cta) {
                  cta.style.display = 'none';
                }

                return true;
              }

              // Run immediately if possible
              if (normalizeShopPayTerms()) return;

              // Retry until Shopify finishes rendering
              const interval = setInterval(() => {
                if (normalizeShopPayTerms()) {
                  clearInterval(interval);
                }
              }, 50);
            })();