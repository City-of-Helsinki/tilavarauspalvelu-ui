import { addDays, addHours, addMinutes, format } from "date-fns";
import {
  hzNavigationFwd,
  reservationSubmitButton,
  timeColumn,
} from "model/calendar";
import {
  confirmationParagraph,
  reservationConfirmationTimeRange,
  formField,
  reservationTitle,
  updateButton,
  cancelButton,
  calendarUrlLink,
  reservationInfoPrice,
  dateSelector,
  hourSelectorToggle,
  minuteSelectorToggle,
  reservationEvent,
  durationSelectorToggle,
} from "model/reservation";

const matchEvent = (): void => {
  reservationEvent()
    .find(".rbc-event-label")
    .invoke("text")
    .then((text) => {
      const eventText = text.startsWith("0") ? text.substring(1) : text;
      hourSelectorToggle()
        .invoke("text")
        .then((hours) => {
          minuteSelectorToggle()
            .invoke("text")
            .then((minutes) => {
              durationSelectorToggle()
                .invoke("text")
                .then((duration) => {
                  const startTime = `${hours}.${minutes}`;
                  const [durationHours, durationMinutes] = duration.split(":");
                  const endTime = format(
                    addMinutes(
                      addHours(
                        new Date().setHours(Number(hours), Number(minutes)),
                        Number(durationHours)
                      ),
                      Number(durationMinutes)
                    ),
                    "H.mm"
                  );
                  expect(eventText).to.eq(`${startTime} – ${endTime}`);
                });
            });
        });
    });
};

const drawReservation = (): void => {
  hzNavigationFwd().click();

  timeColumn(0).within(() => {
    cy.get(".rbc-time-slot")
      .eq(6)
      .trigger("mousedown", { force: true, button: 0 })
      .trigger("mousemove", 0, 400, { force: true });
    cy.get(".rbc-time-slot").eq(6).trigger("mouseup", { force: true });
  });
  reservationSubmitButton().should("be.disabled");

  timeColumn(1).within(() => {
    cy.get(".rbc-time-slot")
      .eq(8)
      .trigger("mousedown", { force: true, button: 0 })
      .trigger("mousemove", 0, 40, { force: true });
    cy.get(".rbc-time-slot").eq(6).trigger("mouseup", { force: true });
  });
  reservationSubmitButton().should("not.disabled");
  matchEvent();
};

describe("Tilavaraus ui reservation unit page (single)", () => {
  Cypress.config("defaultCommandTimeout", 20000);

  beforeEach(() => {
    cy.visit("/reservation-unit/single/48");
    cy.injectAxe();
  });

  it("allows making a reservation", () => {
    cy.get("h1").should("contain", "Pukinmäen nuorisotalon keittiö");

    drawReservation();

    cy.checkA11y(null, null, null, true);

    reservationSubmitButton().click();

    const formFieldsNValues = [
      { label: "reserveeFirstName", value: "Etunimi" },
      { label: "reserveeLastName", value: "Sukunimi" },
      { label: "reserveePhone", value: "+3581234567" },
      { label: "name", value: "Varaus" },
      { label: "description", value: "Kuvaus" },
      { label: "spaceTerms" },
      { label: "resourceTerms" },
    ];

    updateButton().click();
    formFieldsNValues.forEach((field) => {
      cy.get(`#${field.label}-error`).should("exist");
    });

    formFieldsNValues.forEach((field) => {
      if (field.value) {
        formField(field.label).type(field.value);
      } else {
        formField(field.label).click();
      }
    });

    formFieldsNValues.forEach((field) => {
      cy.get(`#${field.label}-error`).should("not.exist");
    });

    cy.checkA11y(null, null, null, true);

    updateButton().click();

    calendarUrlLink()
      .invoke("attr", "href")
      .should("eq", "http://calendarUrl/42");

    confirmationParagraph()
      .eq(0)
      .find("span")
      .eq(0)
      .should("have.text", "Varauksen nimi (julkinen)")
      .parent()
      .find("span")
      .eq(1)
      .should("have.text", formFieldsNValues[3].value);

    confirmationParagraph()
      .eq(1)
      .find("span")
      .eq(0)
      .should("have.text", "Varaajan nimi")
      .parent()
      .find("span")
      .eq(1)
      .should(
        "have.text",
        `${formFieldsNValues[0].value} ${formFieldsNValues[1].value}`
      );

    confirmationParagraph()
      .eq(2)
      .find("span")
      .eq(0)
      .should("have.text", "Varauksen kuvaus")
      .parent()
      .find("span")
      .eq(1)
      .should("have.text", formFieldsNValues[4].value);

    confirmationParagraph()
      .eq(3)
      .find("span")
      .eq(0)
      .should("have.text", "Varauksen ajankohta")
      .parent()
      .find("span")
      .eq(1)
      .invoke("text")
      .then((text) => {
        reservationConfirmationTimeRange().should("contain.text", text);
      });

    confirmationParagraph()
      .eq(4)
      .find("span")
      .eq(0)
      .should("have.text", "Tila")
      .parent()
      .find("span")
      .eq(1)
      .invoke("text")
      .then((text) => {
        reservationTitle().should("have.text", text);
      });

    confirmationParagraph()
      .eq(5)
      .find("span")
      .eq(0)
      .should("have.text", "Puhelin")
      .parent()
      .find("span")
      .eq(1)
      .should("have.text", formFieldsNValues[2].value);

    cy.checkA11y(null, null, null, true);
  });

  it("can cancel reservation process", () => {
    drawReservation();

    cy.checkA11y(null, null, null, true);

    reservationSubmitButton().click();

    cy.checkA11y(null, null, null, true);

    cancelButton().click();

    cy.url().should("contain", "/reservation-unit/single/48");
  });

  it("can do the reservation with form inputs", () => {
    const today = format(new Date(), "d.M.yyyy");
    dateSelector()
      .invoke("val")
      .then((value) => {
        expect(value).to.eq(today);
      });

    reservationInfoPrice()
      .invoke("text")
      .then((text) => {
        expect(text).to.equal("Maksuton");
      });

    dateSelector()
      .parent()
      .find('button[aria-label="Valitse päivämäärä"]')
      .click();

    dateSelector()
      .parent()
      .find('select[aria-label="Kuukausi"]')
      .invoke("val")
      .then((value) => {
        expect(value).to.eq(new Date().getMonth().toString());
      });

    dateSelector()
      .parent()
      .find('button[aria-label="Seuraava kuukausi"]')
      .click();

    dateSelector()
      .parent()
      .find('select[aria-label="Kuukausi"]')
      .invoke("val")
      .then((value) => {
        expect(value).to.eq((new Date().getMonth() + 1).toString());
      });

    const nextWeek = format(addDays(new Date(), 7), "d.M.yyyy");

    dateSelector().clear().type(nextWeek);

    hourSelectorToggle()
      .click()
      .siblings("ul")
      .children("li:nth-of-type(10)")
      .click();

    minuteSelectorToggle()
      .click()
      .siblings("ul")
      .children("li:nth-of-type(1)")
      .click();
    matchEvent();

    minuteSelectorToggle()
      .click()
      .siblings("ul")
      .children("li:nth-of-type(2)")
      .click();
    matchEvent();

    durationSelectorToggle()
      .click()
      .siblings("ul")
      .children("li:nth-of-type(2)")
      .click();
    matchEvent();

    cy.checkA11y(null, null, null, true);
  });
});
