import { checkBreadcrumbs } from "model/breadcrumb";

describe("applications", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
      cy.visit("/applications");
    });
  });

  it("displays correct breadcrumbs", () => {
    const breadcrumbs = {
      fi: [{ title: "Etusivu", url: "/" }, { title: "Omat hakemukset" }],
      en: [{ title: "Home", url: "/en" }, { title: "My applications" }],
      sv: [{ title: "Hemsidan", url: "/sv" }, { title: "Mina bokningar" }],
    };

    checkBreadcrumbs(breadcrumbs, "/applications");
  });
});
