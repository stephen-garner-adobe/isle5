describe('Header Desktop Screenshot', () => {
  it('captures the desktop header', () => {
    cy.viewport(1280, 220);
    cy.visit('/');
    cy.get('header nav', { timeout: 60000 }).should('exist');
    cy.window().then((win) => {
      const nav = win.document.querySelector('header nav');
      const style = win.getComputedStyle(nav);
      const children = [...nav.children].map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          className: el.className,
          text: (el.textContent || '').trim(),
          display: win.getComputedStyle(el).display,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });

      cy.writeFile('tmp/header-layout-debug.json', {
        nav: {
          display: style.display,
          gridTemplate: style.gridTemplate,
          gridTemplateAreas: style.gridTemplateAreas,
          gridTemplateColumns: style.gridTemplateColumns,
          alignItems: style.alignItems,
          width: nav.getBoundingClientRect().width,
          height: nav.getBoundingClientRect().height,
        },
        children,
      });
    });
    cy.wait(1500);
    cy.screenshot('header-desktop-1280', { capture: 'viewport' });
  });
});
