const {assert} = require('chai');
const {buildVideoObject, submitVideoForm} = require('../test-utils');

describe('User visits create page', () => {
  describe('and saves a new video', () => {
    it('is rendered', () => {
      const videoToCreate = buildVideoObject();

      browser.url('/videos/create');
      submitVideoForm(browser, videoToCreate);

      const haystack = browser.getText('body');
      const urls = browser.getAttribute('body iframe', 'src');
      assert.include(haystack, videoToCreate.title);
      assert.include(haystack, videoToCreate.description);
      assert.include(urls, videoToCreate.url);
    });
  });
});
