const {assert} = require('chai');
const request = require('supertest');
const {jsdom} = require('jsdom');

const app = require('../../app');
const Video = require('../../models/video');

const {parseTextFromHTML, parseSrcFromHTML, parseValueFromHTML, buildVideoObject, generateRandomUrl, seedVideoToDatabase, seedGifToDatabase} = require('../test-utils');
const {connectDatabase, disconnectDatabase} = require('../database-utilities');

describe('Videos: ', () => {

  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  // GET LANDING PAGE
  describe('GET /videos', () => {
    it('renders existing Videos', async () => {
      const existingVideo = await seedVideoToDatabase();
      const response = await request(app).get('/videos');
      assert.equal(parseTextFromHTML(response.text, '#videos-container .video-title-text'), existingVideo.title);
    });
  });

  // GET SHOW PAGE
  describe('GET /videos/:id', () => {
    it('renders the Video', async () => {
      const existingVideo = await seedVideoToDatabase();
      const response = await request(app).get(`/videos/${existingVideo._id}`);
      assert.equal(parseTextFromHTML(response.text, '#video-title'), existingVideo.title);
      assert.equal(parseTextFromHTML(response.text, '#video-description'), existingVideo.description);
      assert.equal(parseSrcFromHTML(response.text, 'iframe#video-url'), existingVideo.url);
    });
  });

  // GET CREATE PAGE
  describe('GET /videos/create', () => {
    it('renders empty input fields', async () => {
      const response = await request(app)
        .get('/videos/create');

      assert.equal(parseTextFromHTML(response.text, 'input#title-input'), '');
      assert.equal(parseTextFromHTML(response.text, 'textarea#description-input'), '');
      assert.equal(parseTextFromHTML(response.text, 'input#url-input'), '');
    });
  });

  // POST FROM CREATE PAGE
  describe('POST /videos', () => {
    let videoToCreate;
    let response;

    beforeEach(async () => {
      // set up to create video and post submission
      videoToCreate = buildVideoObject();
      response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
    });

    it('returns 302 status', () => {
      assert.equal(response.status, 302);
    });

    it('redirects to the Videos show page', async () => {
      const video = await Video.findOne({});
      const singlePage = await request(app).get(response.header.location);
      assert.include(parseTextFromHTML(singlePage.text, '#video-title'), video.title);
      assert.include(parseTextFromHTML(singlePage.text, '#video-description'), video.description);
      assert.include(parseSrcFromHTML(singlePage.text, '#video-url'), video.url);
    });

    it('saves a video document', async () => {
      const createdVideo = await Video.findOne(videoToCreate);
      assert.isOk(createdVideo, 'Video was not created successfully in the database');
    });
  });

  // POST FROM CREATE PAGE
  describe('POST /videos with missing title', () => {
    let invalidVideoToCreate;
    let response;

    beforeEach(async () => {
      // set up to create invalid video and post submission
      invalidVideoToCreate = {
        description: 'My dog likes to play hide and seek.',
        url: generateRandomUrl('example.com')
      };
      response = await request(app)
        .post('/videos')
        .type('form')
        .send(invalidVideoToCreate);
    });

    it('does not save the video', async () => {
      const allVideos = await Video.find({});
      assert.equal(allVideos.length, 0);
    });

    it('returns 400 status', () => {
      assert.equal(response.status, 400);
    });

    it('renders the video form', () => {
      assert.include(parseTextFromHTML(response.text, '#title-headline'), 'Save a video');
      assert.equal(parseTextFromHTML(response.text, 'input#title-input'), '');
    });

    it('renders the validation error message', () => {
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('preserves the other field values', () => {
      assert.equal(parseTextFromHTML(response.text, 'textarea#description-input'), invalidVideoToCreate.description);
      assert.equal(parseValueFromHTML(response.text, 'input#url-input'), invalidVideoToCreate.url);
    });
  });

  // POST FROM CREATE PAGE
  describe('POST /videos with missing url', () => {
    let invalidVideoToCreate;
    let response;

    beforeEach(async () => {
      // set up to create invalid video and post submission
      invalidVideoToCreate = {
        title: 'Play time',
        description: 'My dog likes to play hide and seek.',
      };
      response = await request(app)
        .post('/videos')
        .type('form')
        .send(invalidVideoToCreate);
    });

    it('renders the validation error message', () => {
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });

    it('preserves the other field values', () => {
      assert.equal(parseTextFromHTML(response.text, 'textarea#description-input'), invalidVideoToCreate.description);
      assert.equal(parseValueFromHTML(response.text, 'input#title-input'), invalidVideoToCreate.title);
    });
  });

  // GET EDIT PAGE
  describe('GET /videos/:id/edit', () => {
    it('renders a form for the video', async () => {
      const existingVideo = await seedVideoToDatabase();
      const response = await request(app).get(`/videos/${existingVideo._id}/edit`);
      assert.equal(parseValueFromHTML(response.text, '#title-input'), existingVideo.title);
      assert.equal(parseTextFromHTML(response.text, '#description-input'), existingVideo.description);
      assert.equal(parseValueFromHTML(response.text, '#url-input'), existingVideo.url);
    });
  });

  // POST FROM EDIT PAGE
  describe('POST /videos/:id/updates', () => {
    let video;
    let updateVideo;
    let response;

    beforeEach(async () => {
      // set up to create existing video and post update
      video = await seedVideoToDatabase();
      updateVideo = buildVideoObject();
      response = await request(app)
        .post(`/videos/${video._id}/updates`)
        .type('form')
        .send(updateVideo);
    });

    it('updates the record', async () => {
      const checkVideo = await Video.findById(video._id);
      assert.equal(checkVideo.title, updateVideo.title);
      assert.equal(checkVideo.description, updateVideo.description);
      assert.equal(checkVideo.url, updateVideo.url);
    });

    it('returns 302 status', () => {
      assert.equal(response.status, 302);
    });
  });

  // POST FROM EDIT PAGE
  describe('POST /videos/:id/updates with missing title', () => {
    let video;
    let invalidVideo;
    let response;

    beforeEach(async () => {
      // set up to create existing video and post update
      video = await seedVideoToDatabase();
      invalidVideo = {
        description: 'My dog likes to play hide and seek.',
        url: generateRandomUrl('example.com')
      };
      response = await request(app)
        .post(`/videos/${video._id}/updates`)
        .type('form')
        .send(invalidVideo);
    });

    it('does not save', async () => {
      const originalVideo = await Video.findById(video._id);
      assert.equal(originalVideo.title, video.title);
      assert.equal(originalVideo.description, video.description);
      assert.equal(originalVideo.url, video.url);
    });

    it('returns 400 status', () => {
      assert.equal(response.status, 400);
    });

    it('renders the video form', () => {
      assert.include(parseTextFromHTML(response.text, '#title-headline'), 'Edit a video');
      assert.equal(parseTextFromHTML(response.text, 'input#title-input'), '');
    });

    it('renders the validation error message', () => {
      assert.include(parseTextFromHTML(response.text, 'form'), 'required');
    });
  });

  // DELETE POST FROM SHOW PAGE
  describe('POST /videos/:id/deletions', () => {
    let video;
    let response;

    beforeEach(async () => {
      // set up to create existing video and post deletion
      video = await seedVideoToDatabase();
      response = await request(app)
        .post(`/videos/${video._id}/deletions`)
        .type('form')
        .send({});
    });

    it('removes the record', async () => {
      const deletedVideo = await Video.findById(video._id);
      assert.equal(deletedVideo, null, 'Video was not deleted!');
    });

    it('and redirects to the landing page', async () => {
      assert.equal(response.headers.location, '/');
    });
  });

});
