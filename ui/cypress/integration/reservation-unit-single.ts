describe("Tilavaraus ui reservation unit page (single)", () => {
  beforeEach(() => {
    cy.visit("/reservation-unit/single/36");
  });

  it("displays default elements", () => {
    cy.get("h1").should("contain", "Pukinmäen nuorisotalon keittiö");
  });
});
