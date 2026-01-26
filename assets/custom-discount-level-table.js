let currentDiscountLevel = 1;

  function ruleMatchesQuantity(rule, qty) {
    rule = rule.trim();

    if (/^\d+$/.test(rule)) {
      return qty === Number(rule);
    }

    if (/^\d+\s*-\s*\d+$/.test(rule)) {
      const [min, max] = rule.split('-').map(Number);
      return qty >= min && qty <= max;
    }

    if (/^\d+\+$/.test(rule)) {
      const min = Number(rule.replace('+', ''));
      return qty >= min;
    }

    return false;
  }

  function updateDiscountFromQuantity(qty) {
    const rows = document.querySelectorAll('.dc_row');
    let matchedLevel = 1;

    rows.forEach((row, index) => {
      const rule = row.dataset.qtyRule;
      if (rule && ruleMatchesQuantity(rule, qty)) {
        matchedLevel = index + 1;
      }
    });

    setDiscount(matchedLevel);
  }

  function bindQuantityListener() {
    const qtyInput = document.querySelector('.quantity__input');
    if (!qtyInput) return;

    const handler = () => {
      const qty = Number(qtyInput.value) || 1;
      updateDiscountFromQuantity(qty);
    };

    qtyInput.addEventListener('change', handler);
    qtyInput.addEventListener('input', handler);

    // Initial sync (CRITICAL)
    handler();
  }

  function updateUI() {
    for (let i = 1; i <= 3; i++) {
      const circle = document.getElementById(`dc-circle-${i}`);
      const lineTop = document.getElementById(`dc-line-${i}-top`);
      const lineBtm = document.getElementById(`dc-line-${i}-btm`);
      const lock = document.getElementById(`dc-lock-${i}`);

      if (i <= currentDiscountLevel) {
        circle?.classList.add('dc_indicator--active');
        if (lock) lock.style.display = 'none';

        if (lineTop) lineTop.classList.add('dc_row__line-top--active');
        if (lineBtm && i < currentDiscountLevel) {
          lineBtm.classList.add('dc_row__line-bottom--active');
        } else if (lineBtm) {
          lineBtm.classList.remove('dc_row__line-bottom--active');
        }
      } else {
        circle?.classList.remove('dc_indicator--active');
        if (lock) lock.style.display = 'inline';
        if (lineTop) lineTop.classList.remove('dc_row__line-top--active');
        if (lineBtm) lineBtm.classList.remove('dc_row__line-bottom--active');
      }
    }
  }

  function setDiscount(lvl) {
    currentDiscountLevel = lvl;
    updateUI();
  }

  function parseTimeToSeconds(timeString) {
    const parts = timeString.split(':').map(Number);
    if (parts.length !== 3) return 0;
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }

  function startTimer() {
    const display = document.getElementById('dc-timer');
    if (!display) return;

    let totalSeconds = parseTimeToSeconds(display.dataset.startTime || '00:00:00');

    setInterval(() => {
      if (totalSeconds <= 0) return;

      totalSeconds--;

      const h = Math.floor(totalSeconds / 3600)
        .toString()
        .padStart(2, '0');
      const m = Math.floor((totalSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const s = (totalSeconds % 60).toString().padStart(2, '0');

      display.textContent = `${h}:${m}:${s}`;
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindQuantityListener();
    startTimer();
  });