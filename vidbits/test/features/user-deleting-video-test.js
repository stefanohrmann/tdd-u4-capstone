const {assert} = require('chai');
const {buildVideoObject, submitVideoForm} = require('../test-utils');

describe('User visits delete page', () => {
  describe('and deletes the video', () => {
    it('does not render the video on the landing page', () => {
      const videoToCreate = buildVideoObject();

      // Go to the create page
      browser.url('/videos/create');
      // Fill form and submit -> This redirects to /videos/show
      submitVideoForm(browser, videoToCreate);
      // Click delete -> This redirects to /videos
      browser.click('#delete-button');

      const url = browser.getUrl();
      const haystack = browser.getText('body');
      assert.match(url, /\/videos$/);
      assert.notInclude(haystack, videoToCreate.title);
    });
  });
});
