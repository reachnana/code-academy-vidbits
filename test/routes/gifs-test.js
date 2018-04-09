const {assert} = require('chai');
const request = require('supertest');
const {jsdom} = require('jsdom');

const app = require('../../app');
const Video = require('../../models/video');

const {parseTextFromHTML, parseSrcFromHTML, parseValueFromHTML, buildVideoObject, buildGifObject, generateRandomUrl, seedVideoToDatabase, seedGifToDatabase} = require('../test-utils');
const {connectDatabase, disconnectDatabase} = require('../database-utilities');

describe('Gifs: ', () => {

  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  // GET LANDING PAGE
  describe('GET /videos', () => {
    it('renders existing Gifs', async () => {
      const existingVideo = await seedGifToDatabase();
      const response = await request(app).get('/videos');
      assert.equal(parseTextFromHTML(response.text, '#videos-container .video-title-text'), existingVideo.title);
    });
  });

  // GET SHOW PAGE
  describe('GET /videos/:id', () => {
    it('renders the Gif', async () => {
      const existingVideo = await seedGifToDatabase();
      const response = await request(app).get(`/videos/${existingVideo._id}`);
      assert.equal(parseTextFromHTML(response.text, '#video-title'), existingVideo.title);
      assert.equal(parseTextFromHTML(response.text, '#video-description'), existingVideo.description);
      assert.equal(parseSrcFromHTML(response.text, 'img#video-url'), existingVideo.url);
    });
  });

  // POST FROM CREATE PAGE
  describe('POST /videos', () => {
    let videoToCreate;
    let response;

    beforeEach(async () => {
      // set up to create video and post submission
      videoToCreate = buildGifObject();
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

    it('saves a gif document', async () => {
      const createdVideo = await Video.findOne(videoToCreate);
      assert.isOk(createdVideo, 'Gif was not created successfully in the database');
    });
  });

  // GET EDIT PAGE
  describe('GET /videos/:id/edit', () => {
    it('renders a form for the gif', async () => {
      const existingVideo = await seedGifToDatabase();
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
      // set up to create existing gif and post update
      video = await seedGifToDatabase();
      updateVideo = buildGifObject();
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

  // DELETE POST FROM SHOW PAGE
  describe('POST /videos/:id/deletions', () => {
    let video;
    let response;

    beforeEach(async () => {
      // set up to create existing video and post deletion
      video = await seedGifToDatabase();
      response = await request(app)
        .post(`/videos/${video._id}/deletions`)
        .type('form')
        .send({});
    });

    it('removes the record', async () => {
      const deletedVideo = await Video.findById(video._id);
      assert.equal(deletedVideo, null, 'Gif was not deleted!');
    });

    it('and redirects to the landing page', async () => {
      assert.equal(response.headers.location, '/');
    });
  });

});
