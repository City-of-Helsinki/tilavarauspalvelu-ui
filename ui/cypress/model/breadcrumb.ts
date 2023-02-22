import {
  languageSelector,
  languageSelectorMenu,
  languageSelectorMenuItem,
} from "model/navigation";

type langs = "fi" | "sv" | "en";

type BreadcrumbsByLang = {
  [key in langs]: Breadcrumb[];
};

type Breadcrumb = {
  title: string;
  url?: string;
};

function breadcrumbsRoot(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("[data-testid='breadcrumb__wrapper']");
}

export const checkBreadcrumbs = ({
  breadcrumbs,
  url,
}: {
  breadcrumbs: BreadcrumbsByLang;
  url: string;
}) => {
  for (const [key, value] of Object.entries(breadcrumbs)) {
    const keyString = key === "fi" ? "" : `/${key}`;
    cy.visit(`${keyString}${url}`);

    breadcrumbsRoot()
      .find("*[class^='Breadcrumb__Item']")
      .each((el, index) => {
        const isLastElement = !value[index].url;
        const wrappedEl = isLastElement
          ? cy.wrap(el).find("span[class^='Breadcrumb__Slug']")
          : cy.wrap(el).find("a[class^='Breadcrumb__Anchor']");
        wrappedEl.should("contain.text", value[index].title);
        wrappedEl.should("have.attr", "title", value[index].title);

        if (!isLastElement) {
          wrappedEl.should("have.attr", "href", value[index].url);
        }
      });
  }
};

export function breadcrumbWrapper(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get("[data-testid='breadcrumb__wrapper']");
}
