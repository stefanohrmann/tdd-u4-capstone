const {assert} = require('chai');
const {buildVideoObject, submitVideoForm} = require('../test-utils');

describe('User visits update page', () => {
  describe('and updates the video title', () => {
    it('renders the new title', () => {
      const videoToCreate = buildVideoObject();
      const newTitle = 'This is my awesome new title';

      // Go to the create page
      browser.url('/videos/create');
      // Fill form and submit -> This redirects to /videos/show
      submitVideoForm(browser, videoToCreate);
      // Click edit -> This redirects to /videos/edit
      browser.click('#edit-button');
      // Set new title and submit -> This redirects to /videos/show
      browser.setValue('#title-input', newTitle);
      browser.click('#submit-button');

      const haystack = browser.getText('body');
      assert.include(haystack, newTitle);
    });

    it('does not create a new entry', () => {
      const videoToCreate = buildVideoObject();
      const newTitle = 'This is another awesome new title';

      // Go to the create page
      browser.url('/videos/create');
      // Fill form and submit -> This redirects to /videos/show
      submitVideoForm(browser, videoToCreate);
      // Click edit -> This redirects to /videos/edit
      browser.click('#edit-button');
      // Set new title and submit -> This redirects to /videos/show
      browser.setValue('#title-input', newTitle);
      browser.click('#submit-button');
      // Go to landing page
      browser.url('/videos');

      const haystack = browser.getText('body');
      assert.include(haystack, newTitle);
      assert.notInclude(haystack, videoToCreate.title);
    });
  });
});
