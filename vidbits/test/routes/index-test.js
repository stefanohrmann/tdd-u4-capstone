const {assert} = require('chai');
const request = require('supertest');

const app = require('../../app');
const Video = require('../../models/video');

describe('Server path: /', () => {
  describe('GET', () => {
    it('redirects to /videos', async () => {
      const response = await request(app).get('/');

      assert.strictEqual(response.status, 302);
      assert.equal(response.header.location, '/videos');
    });
  });
});
