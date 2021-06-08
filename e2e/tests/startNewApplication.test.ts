import home from './model/home';
import search from './model/search';
import application from './model/application';
import config from '../config';

fixture('e2e test poc').page(config.BASE_URL);

test('Start new application', async (t) => {
  await t
    .click(home.browseAllButton)
    .typeText(search.searchText, 'Studio')
    .click(search.searchButton)
    .click(search.selectReservationUnitButton)
    .click(search.startApplicationButton);
  // skip intro
  await t.click(application.intro.startApplication);
  await t
    .expect(application.page1.applicationEventNameInput.value)
    .eql('Nimetön vakiovuoro');
});
