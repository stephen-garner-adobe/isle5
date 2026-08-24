describe('Product Detail Page Smoke', () => {
  it('renders the product details and add-to-cart controls', () => {
    cy.visit('/products/play-create-repeat-crewneck/adb388');
    cy.get('.product-details__header', { timeout: 60000 }).should('be.visible');
    cy.get('.product-details__buttons__add-to-cart button', { timeout: 60000 })
      .should('be.visible');
  });
});
