const {assert} = require('chai');

const {connectDatabaseAndDropData, disconnectDatabase} = require('../database-utilities');

const Video = require('../../models/video');

describe('Model: Video', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('#title', () => {
    it('is a string', () => {
      const titleAsInt = 1;
      const video = new Video({
        title: titleAsInt
      });

      assert.strictEqual(video.title, titleAsInt.toString());
    });

    it('is required', () => {
      const video = new Video({
        title: ''
      });

      video.validateSync();

      assert.equal(video.errors.title.message, 'A `title` is required.');
    });
  });

  describe('#description', () => {
    it('is a string', () => {
      const descriptionAsInt = 1;
      const video = new Video({
        description: descriptionAsInt
      });

      assert.strictEqual(video.description, descriptionAsInt.toString());
    });
  });

  describe('#url', () => {
    it('is a string', () => {
      const urlAsInt = 1;
      const video = new Video({
        url: urlAsInt
      });

      assert.strictEqual(video.url, urlAsInt.toString());
    });

    it('is required', () => {
      const video = new Video({
        url: ''
      });

      video.validateSync();

      assert.equal(video.errors.url.message, 'A `url` is required.');
    });
  });
});
