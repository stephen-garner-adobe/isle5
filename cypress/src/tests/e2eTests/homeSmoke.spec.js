describe('Home Page Smoke', () => {
  it('renders the home page shell and navigation', () => {
    cy.visit('/');
    cy.get('header nav', { timeout: 60000 }).should('be.visible');
    cy.get('main').should('be.visible');
    cy.get('body').should('not.contain', '418');
  });
});
