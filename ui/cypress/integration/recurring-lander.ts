import { breadcrumbWrapper } from "model/breadcrumb";
import { languageSelector, languageSelectorMenuItem } from "model/navigation";
import { applicationRoundContainer } from "model/recurring-lander";
import { checkBreadcrumbs } from "../model/breadcrumb";

describe("recurring search lander", () => {
  beforeEach(() => {
    cy.visit("/recurring");
    cy.injectAxe();
    Cypress.config("defaultCommandTimeout", 20000);
  });

  it("displays correct application rounds", () => {
    cy.get("h1").should("contain", "Kausivaraus");

    applicationRoundContainer("active")
      .children("div")
      .should("have.length", 2)
      .find("button")
      .should("contain.text", "Täytä hakemus");
    applicationRoundContainer("active")
      .children("h2")
      .should("contain.text", "Käynnissä olevat haut");

    applicationRoundContainer("pending")
      .children("div")
      .should("have.length", 1)
      .find("button")
      .should("not.exist");
    applicationRoundContainer("pending")
      .children("h2")
      .should("contain.text", "Tulevat haut");

    applicationRoundContainer("past")
      .children("div")
      .should("have.length", 5)
      .find("button")
      .should("not.exist");
    applicationRoundContainer("past")
      .children("h2")
      .should("contain.text", "Päättyneet haut");

    cy.checkA11y(null, null, null, true);

    applicationRoundContainer("active")
      .children("div")
      .first()
      .find("button")
      .click();

    cy.url().should("contain", "/search?applicationRound=1");
  });

  it("displays correct breadcrumbs", () => {
    const breadcrumbs = {
      fi: [{ title: "Etusivu", url: "/" }, { title: "Kausivaraus" }],
      en: [{ title: "Home", url: "/en" }, { title: "Seasonal booking" }],
      sv: [{ title: "Hemsidan", url: "/sv" }, { title: "Säsongbokning" }],
    };

    checkBreadcrumbs(breadcrumbs, "/recurring");
  });
});
