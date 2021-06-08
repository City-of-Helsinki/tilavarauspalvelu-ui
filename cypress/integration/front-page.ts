import {
  applicationRound,
  interceptApplicationRounds,
} from '../fixtures/applicationRound';

import browseAllButton from '../model/home';

describe('Tilavaraus ui', () => {
  it('Frontpage displays applicationRounds', () => {
    interceptApplicationRounds([applicationRound]);
    cy.visit('https://localhost:3000');
    cy.get('h1').should('contain', 'Vakiovuoron hakeminen');
  });

  it('Page is accessible', () => {
    interceptApplicationRounds([applicationRound]);
    cy.visit('https://localhost:3000');
    cy.a11yCheck();
  });
});
