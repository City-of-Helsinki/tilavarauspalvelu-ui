const browseAllButton = (): Cypress.Chainable<JQuery<HTMLElement>> =>
  cy.get('#browseAllButton');

export default browseAllButton;
