import {
  applicationRound,
  interceptApplicationRounds,
} from '../fixtures/applicationRound';

const urlPrefix = process.env.UI_URL || 'https://localhost:3000';
describe('Tilavaraus ui', () => {
  it('Frontpage displays applicationRounds', () => {
    interceptApplicationRounds([applicationRound]);
    cy.visit(urlPrefix);
    cy.get('h1').should('contain', 'Vakiovuoron hakeminen');
  });

  it('Page is accessible', () => {
    interceptApplicationRounds([applicationRound]);
    cy.visit(urlPrefix);
    cy.a11yCheck();
  });
});
