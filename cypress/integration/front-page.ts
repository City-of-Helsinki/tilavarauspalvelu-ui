import {
  applicationRound,
  interceptApplicationRounds,
} from '../fixtures/applicationRound';



describe('Tilavaraus ui', () => {
  it('Frontpage displays applicationRounds', () => {
    interceptApplicationRounds([applicationRound]);
    cy.visit('/');
    cy.get('h1').should('contain', 'Vakkiovuoron hakeminen');
  });

  it('Page is accessible', () => {
    interceptApplicationRounds([applicationRound]);
    cy.visit('/');
    cy.a11yCheck();
  });
});
