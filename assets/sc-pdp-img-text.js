function toggleMobileCard(wrapper) {
    if (window.innerWidth > 768) return;

    const card = wrapper.closest('.sc-pdp-card');
    const allCards = document.querySelectorAll('.sc-pdp-card');

    allCards.forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.classList.remove('active');
      }
    });

    card.classList.toggle('active');
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      document.querySelectorAll('.sc-pdp-card').forEach((card) => {
        card.classList.remove('active');
      });
    }
  });