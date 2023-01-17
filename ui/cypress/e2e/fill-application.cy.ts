import { checkBreadcrumbs } from "model/breadcrumb";
import {
  firstAvailableApplicationRound,
  selectApplicationRoundButton,
  proceedToPage1Button,
  applicationName,
  numPersons,
  selectOption,
  acceptAndSaveEvent,
  nextButton,
  timeSelectorButton,
  fillAsIndividual,
  acceptTerms,
  submitApplication,
  selectPriority,
  timeSummary,
  resetButton,
  addNewApplicationButton,
  notificationTitle,
  applicationEventAccordion,
  copyCellsButton,
  minDurationNotification,
  minDurationNotificationText,
  successNotification,
} from "../model/application";
import {
  addReservationUnitButton,
  clearSelectionsButton,
  startApplicationButton,
} from "../model/search";

const applicationEventNames = ["Kurikan vimma", "Toca", "Kolmas"];

describe("application", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
      cy.visit("/search/?search=");
      cy.injectAxe();
    });
  });

  it("can be submitted and is accessible", () => {
    startApplicationButton().should("not.exist");
    addReservationUnitButton(2).click();
    clearSelectionsButton().click();
    startApplicationButton().should("not.exist");
    addReservationUnitButton(2).click();
    startApplicationButton().should("exist");
    addReservationUnitButton(2).click();
    startApplicationButton().should("not.exist");
    addReservationUnitButton(2).click();

    cy.get("h1").should("contain", "Varaa tila koko kaudeksi");
    cy.checkA11y(undefined, undefined, undefined, true);

    startApplicationButton().click();

    cy.get("h1").should("contain", "Kausivaraushakemus");

    selectApplicationRoundButton().click();
    firstAvailableApplicationRound().click();

    cy.checkA11y(undefined, undefined, undefined, true);

    proceedToPage1Button().click();

    cy.get("h1").should("contain", "varauksen tiedot");

    cy.checkA11y(undefined, undefined, undefined, true);

    applicationName(0).clear().type(applicationEventNames[0]);
    numPersons(0).type("3");
    selectOption("applicationEvents[0].ageGroupId", 1);
    selectOption("applicationEvents[0].purposeId", 1);
    cy.pause();
    acceptAndSaveEvent(0).click();

    addNewApplicationButton().click();
    applicationName(1).clear().type(applicationEventNames[1]);
    numPersons(1).type("4");
    selectOption("applicationEvents[1].ageGroupId", 2);
    selectOption("applicationEvents[1].purposeId", 2);
    acceptAndSaveEvent(1).click();

    applicationName(2).clear().type(applicationEventNames[2]);
    numPersons(2).type("4");
    selectOption("applicationEvents[2].ageGroupId", 2);
    selectOption("applicationEvents[2].purposeId", 2);
    acceptAndSaveEvent(2).click();

    nextButton().click();

    cy.get("h1").should("contain", "ajankohta");

    minDurationNotification().should("be.visible");
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[0]
    );
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[1]
    );

    timeSelectorButton(0, 7, 0).click();
    timeSelectorButton(0, 8, 0).click();
    timeSelectorButton(0, 9, 0).click();

    timeSummary(0, 0).should(
      "contain.text",
      "Ensisijaiset aikatoiveetMaanantai:7-10TiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    minDurationNotificationText().should(
      "not.contain.text",
      applicationEventNames[0]
    );
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[1]
    );

    selectPriority(0, 1);

    timeSelectorButton(0, 9, 0).click();
    timeSelectorButton(0, 8, 3).click();
    timeSelectorButton(0, 9, 3).click();

    timeSummary(0, 0).should(
      "contain.text",
      "Ensisijaiset aikatoiveetMaanantai:7-9TiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    timeSummary(0, 1).should(
      "contain.text",
      "Muut aikatoiveetMaanantai:9-10TiistaiKeskiviikkoTorstai:8-10PerjantaiLauantaiSunnuntai"
    );
    minDurationNotificationText().should(
      "not.contain.text",
      applicationEventNames[0]
    );
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[1]
    );

    resetButton(0).click();

    timeSummary(0, 0).should(
      "contain.text",
      "Ensisijaiset aikatoiveetMaanantaiTiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    timeSummary(0, 1).should(
      "contain.text",
      "Muut aikatoiveetMaanantaiTiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[0]
    );
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[1]
    );

    timeSelectorButton(0, 10, 1).click();
    timeSelectorButton(0, 11, 1).click();

    cy.wait(100);

    timeSummary(0, 0).should(
      "contain.text",
      "Ensisijaiset aikatoiveetMaanantaiTiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    timeSummary(0, 1).should(
      "contain.text",
      "Muut aikatoiveetMaanantaiTiistai:10-12KeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    minDurationNotificationText().should(
      "not.contain.text",
      applicationEventNames[0]
    );
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[1]
    );

    nextButton().click();

    cy.get("[data-testid='application__page2--notification-error'").should(
      "contain.text",
      "Lisää kaikille kausivarauksille vähintään yksi aika"
    );

    applicationEventAccordion(1).click();

    timeSummary(1, 0).should(
      "contain.text",
      "Ensisijaiset aikatoiveetMaanantaiTiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    timeSummary(1, 1).should(
      "contain.text",
      "Muut aikatoiveetMaanantaiTiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    minDurationNotificationText().should(
      "not.contain.text",
      applicationEventNames[0]
    );
    minDurationNotificationText().should(
      "contain.text",
      applicationEventNames[1]
    );

    copyCellsButton(0).click();

    timeSummary(1, 0).should(
      "contain.text",
      "Ensisijaiset aikatoiveetMaanantaiTiistaiKeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    timeSummary(1, 1).should(
      "contain.text",
      "Muut aikatoiveetMaanantaiTiistai:10-12KeskiviikkoTorstaiPerjantaiLauantaiSunnuntai"
    );
    minDurationNotification().should("not.exist");

    cy.get("[data-testid='application__page2--notification-success']").should(
      "contain.text",
      "Ajat kopioitu onnistuneesti kaikille varaustoiveille"
    );

    cy.get("[data-testid='application__page2--notification-success']")
      .find("button")
      .click();

    nextButton().click();

    cy.get("h1").should("contain", "varaajan tiedot");

    cy.checkA11y(undefined, undefined, undefined, true);

    fillAsIndividual();

    cy.fixture("v1/application/put_page_3").then((json) => {
      cy.intercept("PUT", "/v1/application/138", json);
      cy.intercept("GET", "/v1/application/138/*", json);
    });

    nextButton().click();

    cy.get("h1").should("contain", "lähetä hakemus");

    timeSummary(0, 0).should(
      "contain.text",
      "Ensisijaiset aikatoiveetMaanantaiTiistai:10-11KeskiviikkoTorstai:15-16PerjantaiLauantaiSunnuntai"
    );
    timeSummary(0, 1).should(
      "contain.text",
      "Muut aikatoiveetMaanantaiTiistaiKeskiviikkoTorstaiPerjantaiLauantai:17-18Sunnuntai"
    );

    acceptTerms();

    submitApplication();

    cy.get("h1").should("contain", "Kiitos hakemuksesta!");

    const breadcrumbs = {
      en: [
        { title: "Home", url: "/en" },
        { title: "Seasonal booking", url: "/en/recurring" },
        { title: "Seasonal booking application" },
      ],
      sv: [
        { title: "Hemsidan", url: "/sv" },
        { title: "Säsongbokning", url: "/sv/recurring" },
        { title: "Säsongbokningsansökan" },
      ],
      fi: [
        { title: "Etusivu", url: "/" },
        { title: "Kausivaraus", url: "/recurring" },
        { title: "Kausivaraushakemus" },
      ],
    };

    checkBreadcrumbs(breadcrumbs, "/application/138/sent");
  });
});
