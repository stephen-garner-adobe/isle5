describe('Header Layout Geometry', () => {
  const widths = [320, 360, 390, 414, 900, 1024, 1100, 1200, 1280];

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0
      && rect.height > 0
      && style.display !== 'none'
      && style.visibility !== 'hidden';
  }

  it('keeps primary nav and tool controls inside the viewport', () => {
    widths.forEach((width) => {
      cy.viewport(width, 900);
      cy.visit('/');
      cy.get('header nav', { timeout: 60000 }).should('exist');

      cy.window().then((win) => {
        const selectors = [
          '.nav-sections .default-content-wrapper > ul > li > a',
          '.nav-tools > .wishlist-wrapper > button',
          '.nav-tools > .minicart-wrapper > button',
          '.nav-tools > .search-wrapper > button',
          '.nav-tools > .dropdown-wrapper > button',
        ];

        const candidates = selectors.flatMap((selector) => [...win.document.querySelectorAll(selector)]);
        const visible = candidates.filter((el) => isVisible(el));

        expect(visible.length, `visible header controls at ${width}px`).to.be.greaterThan(0);

        visible.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const label = (el.textContent || el.getAttribute('aria-label') || el.className || el.tagName).trim();

          expect(rect.left, `${label} left edge at ${width}px`).to.be.gte(-2);
          expect(rect.right, `${label} right edge at ${width}px`).to.be.lte(win.innerWidth + 2);
        });
      });
    });
  });
});
