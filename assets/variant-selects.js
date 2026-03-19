if (!customElements.get('variant-selects')) {
  customElements.define(
    'variant-selects',
    class VariantSelects extends HTMLElement {
      constructor() {
        super();
      }

      get selectedOptionValues() {
        console.log("🔥VARIANT SELECTS:Getting selected option values...");
        return Array.from(this.querySelectorAll('select option[selected], fieldset input:checked')).map(
          ({ dataset }) => dataset.optionValueId
        );
      }

      getInputForEventTarget(target) {
        console.log("🔥VARIANT SELECTS:Getting input for event target...");
        return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
      }

      connectedCallback() {
        console.log("🔥VARIANT SELECTS:Connected to the DOM.");
        this.addEventListener('change', (event) => {
          console.log("🔥Change event detected on variant-selects.");
          const target = this.getInputForEventTarget(event.target);
          this.updateSelectedSwatchValue(event);
          FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.optionValueSelectionChange, {
            data: {
              event,
              target,
              selectedOptionValues: this.selectedOptionValues,
            },
          });
        });
      }

      updateSelectedSwatchValue({ target }) {
        console.log("🔥VARIANT SELECTS:Updating selected swatch value...");
        const { value, tagName } = target;

        if (tagName === 'SELECT' && target.selectedOptions.length) {
          console.log("🔥VARIANT SELECTS:Updating selected swatch value for select input...");
          Array.from(target.options)
            .find((option) => option.getAttribute('selected'))
            .removeAttribute('selected');
          target.selectedOptions[0].setAttribute('selected', 'selected');

          const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
          const selectedDropdownSwatchValue = target
            .closest('.product-form__input')
            .querySelector('[data-selected-value] > .swatch');
          if (!selectedDropdownSwatchValue) return;
          if (swatchValue) {
            selectedDropdownSwatchValue.style.setProperty('--swatch--background', swatchValue);
            selectedDropdownSwatchValue.classList.remove('swatch--unavailable');
          } else {
            selectedDropdownSwatchValue.style.setProperty('--swatch--background', 'unset');
            selectedDropdownSwatchValue.classList.add('swatch--unavailable');
          }

          selectedDropdownSwatchValue.style.setProperty(
            '--swatch-focal-point',
            target.selectedOptions[0].dataset.optionSwatchFocalPoint || 'unset'
          );
        } else if (tagName === 'INPUT' && target.type === 'radio') {
          console.log("🔥VARIANT SELECTS:Updating selected swatch value for radio input...");
          const selectedSwatchValue = target.closest(`.product-form__input`).querySelector('[data-selected-value]');
          if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;
        }
      }
    }
  );
}
