export function searchButton(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#searchButton");
}

export function fullTextInput(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#search");
}

export function addReservationUnitButton(
  name: string
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy
    .get("#searchResultList > div > div")
    .filter((i, e) => e.innerHTML.indexOf(name) !== -1)
    .first()
    .find("button:not(:disabled)")
    .should("be.visible");
}

export function startApplicationButton(): Cypress.Chainable<
  JQuery<HTMLElement>
> {
  return cy.get("#startApplicationButton").should("be.visible");
}

export function inputMinPersons(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#participantMinCountFilter-toggle-button");
}

export function inputMaxPersons(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#participantMaxCountFilter-toggle-button");
}

export function inputReservationUnitType(): Cypress.Chainable<
  JQuery<HTMLElement>
> {
  return cy.get("#reservationUnitTypeFilter");
}

export function inputReservationUnitTypeOption(
  value: number
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`#reservationUnitTypeFilter_${value}`);
}

export function inputUnit(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#unitFilter-input");
}

export function inputUnitToggler(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#unitFilter");
}

export function inputUnitOption(
  value: number
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`#unitFilter_${value}`);
}

export function inputPurpose(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#purposeFilter-input");
}

export function inputPurposeToggler(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("#purposeFilter");
}

export function inputPurposeOption(
  value: number
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`#purposeFilter_${value}`);
}

export function selectOptions(
  parent: string
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`${parent}`).next("div").find(`input[type="checkbox"]`);
}

export function selectClearButton(
  parent: string
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`${parent}`).next("div").find(`button[type="button"]`);
}

export function filterTags(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('[data-test-id="search-form__filter--tags"]');
}

export function filterTag(tag: string): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`#filter-tag__${tag}`);
}

export function formResetButton(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("[data-test-id='search-form__reset-button']");
}

export function paginationButton(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("[data-test-id='search-form__pagination-button']");
}
