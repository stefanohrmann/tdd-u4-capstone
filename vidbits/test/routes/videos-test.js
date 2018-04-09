const {assert} = require('chai');
const request = require('supertest');
const {jsdom} = require('jsdom');

const app = require('../../app');
const Video = require('../../models/video');

const {
  buildVideoObject, 
  parseTextFromHTML, 
  seedVideoToDatabase,
  findElementInHTML
} = require('../test-utils');

const {
  connectDatabaseAndDropData, 
  disconnectDatabase
} = require('../database-utilities');

describe('Server path: /videos', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('GET', () => {
    it('renders existing videos', async () => {
      const video = await seedVideoToDatabase();

      const response = await request(app).get('/videos');

      assert.include(parseTextFromHTML(response.text, '.video-title'), video.title);
      const iframe = findElementInHTML(response.text, `iframe[src="${video.url}"]`);
      assert.equal(iframe.src, video.url);
    });
  });

  describe('POST', () => {
    it('redirects with status code 302', async () => {
      const videoToCreate = buildVideoObject();

      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
      const video = await Video.findOne(videoToCreate);

      assert.strictEqual(response.status, 302);
      assert.include(response.header.location, video.id);
    });

    it('creates an entry in the database', async () => {
      const videoToCreate = buildVideoObject();

      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
      const createdVideo = await Video.findOne({});

      assert.strictEqual(createdVideo.title, videoToCreate.title);
      assert.strictEqual(createdVideo.description, videoToCreate.description);
      assert.strictEqual(createdVideo.url, videoToCreate.url);
    });

    it('redirected page shows created video', async () => {
      const videoToCreate = buildVideoObject();

      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
      const response2 = await request(app)
        .get(response.header.location);

      const haystack = parseTextFromHTML(response2.text, 'body');
      const videoElement = findElementInHTML(response2.text, 'body iframe');

      assert.include(haystack, videoToCreate.title);
      assert.include(haystack, videoToCreate.description);
      assert.strictEqual(videoElement.src, videoToCreate.url);
    });
  });

  describe('POST with title missing', () => {
    const videoToCreate = buildVideoObject();
    videoToCreate.title = '';
  
    it('does not save the video', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
      const videos = await Video.find({});

      assert.isEmpty(videos);
    });

    it('responds with status code 400', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      assert.strictEqual(response.status, 400);
    });

    it('displays form again', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      const titleInput = findElementInHTML(response.text, '#title-input');
      assert.exists(titleInput);
    });

    it('displays validation error message', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('displays form filled with other entries', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      const descriptionInput = findElementInHTML(response.text, '#description-input');
      const urlInput = findElementInHTML(response.text, '#url-input');
      assert.include(descriptionInput.textContent, videoToCreate.description);
      assert.equal(urlInput.value, videoToCreate.url);
    });
  });

  describe('POST with url missing', () => {
    const videoToCreate = buildVideoObject();
    videoToCreate.url = '';
  
    it('does not save the video', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
      const videos = await Video.find({});

      assert.isEmpty(videos);
    });

    it('responds with status code 400', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      assert.strictEqual(response.status, 400);
    });

    it('displays form again', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      const urlInput = findElementInHTML(response.text, '#url-input');
      assert.exists(urlInput);
    });

    it('displays validation error message', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('displays form filled with other entries', async () => {
      const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);

      const descriptionInput = findElementInHTML(response.text, '#description-input');
      const titleInput = findElementInHTML(response.text, '#title-input');
      assert.include(descriptionInput.textContent, videoToCreate.description);
      assert.equal(titleInput.value, videoToCreate.title);
    });
  });
});

describe('Server path: /videos/:id', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('GET', () => {
    it('renders existing video', async () => {
      const video = await seedVideoToDatabase();

      const response = await request(app).get(`/videos/${video.id}`);

      assert.include(parseTextFromHTML(response.text, 'body'), video.title);
      const iframe = findElementInHTML(response.text, `iframe[src="${video.url}"]`);
      assert.equal(iframe.src, video.url);
    });
  });
});

describe('Server path: /videos/:id/edit', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  const createUpdate = (video) => {
    // The desconstruction is necessary, because supertest
    // has problems to convert a database object to form
    // fields.
    let {id, title, description, url} = video;
    title = 'This is my awesome new title';
    description = 'An aweseome new description';
    url = 'https://localhost/WhatAVideo';
    return {id, title, description, url};
  }

  describe('GET', () => {
    it('renders form with video data', async () => {
      const video = await seedVideoToDatabase();

      const response = await request(app).get(`/videos/${video.id}/edit`);

      const titleInput = findElementInHTML(response.text, '#title-input');
      const descriptionInput = findElementInHTML(response.text, '#description-input');
      const urlInput = findElementInHTML(response.text, '#url-input');
      assert.equal(titleInput.value, video.title);
      assert.equal(descriptionInput.value, video.description);
      assert.equal(urlInput.value, video.url);
    });
  });

  describe('POST', () => {
    let videoUpdate;
    let url;

    beforeEach(async () => {
      videoUpdate = createUpdate(await seedVideoToDatabase());
      url = `/videos/${videoUpdate.id}/edit`;
    })

    it('redirects with status code 302', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);
      const video = await Video.findOne({});

      assert.strictEqual(response.status, 302);
      assert.strictEqual(response.header.location, `/videos/${video.id}`);
    });

    it('updates an entry in the database', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);
      const video = await Video.findOne({});

      assert.strictEqual(video.title, videoUpdate.title);
      assert.strictEqual(video.description, videoUpdate.description);
      assert.strictEqual(video.url, videoUpdate.url);
    });

    it('redirected page shows updated video', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);
      const response2 = await request(app)
        .get(response.header.location);

      const haystack = parseTextFromHTML(response2.text, 'body');
      const videoElement = findElementInHTML(response2.text, 'body iframe');

      assert.include(haystack, videoUpdate.title);
      assert.include(haystack, videoUpdate.description);
      assert.strictEqual(videoElement.src, videoUpdate.url);
    });
  });

  describe('POST with title missing', () => {
    let videoOriginal;
    let videoUpdate;
    let url;

    beforeEach(async () => {
      videoOriginal = await seedVideoToDatabase();
      videoUpdate = createUpdate(videoOriginal);
      videoUpdate.title = '';
      url = `/videos/${videoUpdate.id}/edit`;
    })

    it('does not save the video', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);
      const video = await Video.findOne({});

      assert.strictEqual(video.title, videoOriginal.title, 'title');
      assert.strictEqual(video.description, videoOriginal.description, 'description');
      assert.strictEqual(video.url, videoOriginal.url, 'url');
    });

    it('responds with status code 400', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      assert.strictEqual(response.status, 400);
    });

    it('displays form again', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      const titleInput = findElementInHTML(response.text, '#title-input');
      assert.exists(titleInput);
    });

    it('displays validation error message', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('displays form filled with other entries', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      const descriptionInput = findElementInHTML(response.text, '#description-input');
      const urlInput = findElementInHTML(response.text, '#url-input');
      assert.include(descriptionInput.textContent, videoUpdate.description);
      assert.equal(urlInput.value, videoUpdate.url);
    });
  });

  describe('POST with url missing', () => {
    let videoOriginal;
    let videoUpdate;
    let url;

    beforeEach(async () => {
      videoOriginal = await seedVideoToDatabase();
      videoUpdate = createUpdate(videoOriginal);
      videoUpdate.title = '';
      url = `/videos/${videoUpdate.id}/edit`;
    })
  
    it('does not save the video', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);
      const video = await Video.findOne({});

      assert.strictEqual(video.title, videoOriginal.title, 'title');
      assert.strictEqual(video.description, videoOriginal.description, 'description');
      assert.strictEqual(video.url, videoOriginal.url, 'url');
    });

    it('responds with status code 400', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      assert.strictEqual(response.status, 400);
    });

    it('displays form again', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      const urlInput = findElementInHTML(response.text, '#url-input');
      assert.exists(urlInput);
    });

    it('displays validation error message', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('displays form filled with other entries', async () => {
      const response = await request(app)
        .post(url)
        .type('form')
        .send(videoUpdate);

      const descriptionInput = findElementInHTML(response.text, '#description-input');
      const titleInput = findElementInHTML(response.text, '#title-input');
      assert.include(descriptionInput.textContent, videoUpdate.description);
      assert.equal(titleInput.value, videoUpdate.title);
    });
  });
});

describe('Server path: /videos/:id/delete', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('POST', () => {
    let videoToDelete;
    let url;
    
    beforeEach(async () => {
      videoToDelete = await seedVideoToDatabase();
      url = `/videos/${videoToDelete.id}/delete`;
    });
    
    it('deletes existing video', async () => {
      const response = await request(app).post(url);
      const videos = await Video.find({});

      assert.isEmpty(videos);
    });

    it('redirects with status code 302', async () => {
      const response = await request(app).post(url);

      assert.strictEqual(response.status, 302);
      assert.strictEqual(response.header.location, '/videos');
    });

    it('redirected page shows not deleted video', async () => {
      const response = await request(app).post(url);
      const response2 = await request(app).get(response.header.location);

      const haystack = parseTextFromHTML(response2.text, 'body');

      assert.notInclude(haystack, videoToDelete.title);
    });
  });
});
