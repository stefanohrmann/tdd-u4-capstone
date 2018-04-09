const {assert} = require('chai');

const {buildVideoObject, submitVideoForm} = require('../test-utils');
const {connectDatabaseAndDropData, disconnectDatabase} = require('../database-utilities');

describe('User visits landing page', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);
  
  describe('without existing videos', () => {
    it('starts blank', () => {
      browser.url('/');

      const videoContainerText = browser.getText('#videos-container');

      assert.equal(videoContainerText, '');
    });
  });

  describe('and can navigate', () => {
    it('to /videos/create', () => {
      browser.url('/');

      browser.click('a[href="/videos/create"]');

      const bodyText = browser.getText('body');

      assert.include(bodyText, 'Save a video');
    });
  });

  describe('with existing video', () => {
    it('renders it in the list', () => {
      const video = buildVideoObject();

      browser.url('/videos/create');
      submitVideoForm(browser, video);

      browser.url('/');

      const videosText = browser.getText('#videos-container');
      const iframe = browser.getHTML(`#videos-container iframe[src="${video.url}"]`);
      assert.include(videosText, video.title);
      assert.exists(iframe);
    });

    it('renders title as link', () => {
      const video = buildVideoObject();

      browser.url('/videos/create');
      submitVideoForm(browser, video);

      browser.url('/');

      const titleLink = browser.getHTML('#videos-container .video-title a');
      assert.exists(titleLink);
    });
  });
});
