describe('Header Typography Dump', () => {
  it('records computed typography for top-level nav items', () => {
    cy.viewport(1280, 220);
    cy.visit('/');
    cy.get('header nav', { timeout: 60000 }).should('exist');
    cy.wait(1000);

    cy.window().then((win) => {
      const items = [...win.document.querySelectorAll(
        '.nav-sections .default-content-wrapper > ul > li',
      )].map((li) => {
        const textNode = li.querySelector(':scope > p, :scope > a, :scope > p > a');
        const target = textNode || li;
        const style = win.getComputedStyle(target);
        const rect = target.getBoundingClientRect();

        return {
          text: (target.textContent || '').trim(),
          tag: target.tagName,
          font: style.font,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          display: style.display,
          height: rect.height,
          top: rect.top,
        };
      });

      const brand = win.document.querySelector('.nav-brand a');
      const brandStyle = win.getComputedStyle(brand);
      const brandRect = brand.getBoundingClientRect();

      cy.writeFile('tmp/header-typography-debug.json', {
        brand: {
          text: 'brand',
          tag: brand.tagName,
          font: brandStyle.font,
          fontSize: brandStyle.fontSize,
          fontWeight: brandStyle.fontWeight,
          lineHeight: brandStyle.lineHeight,
          letterSpacing: brandStyle.letterSpacing,
          display: brandStyle.display,
          height: brandRect.height,
          top: brandRect.top,
        },
        items,
      });
    });
  });
});
