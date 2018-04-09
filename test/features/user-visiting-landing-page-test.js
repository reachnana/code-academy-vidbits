const {assert} = require('chai');
const {buildVideoObject} = require('../test-utils');

const generateRandomUrl = (domain) => {
  return `http://${domain}/${Math.random()}`;
};

const setValuesAndClick = async (video) => {
  // create video and submit
  browser.url('/videos/create');
  browser.setValue('#title-input', video.title);
  browser.setValue('#description-input', video.description);
  browser.setValue('#url-input', video.url);
  if (video.gif) {
    browser.click('#gif-input');
  }
  browser.click('#submit-button');
};

describe('User visiting landing page', () => {
  describe('with no videos', () => {
    it('shows no videos', () => {
      browser.url('/');
      assert.equal(browser.getText('#videos-container'), '');
    });
  });

  describe('can navigate to create page', () => {
    it('and render the text "Save a video"', () => {
      browser.url('/');
      browser.click('#create-link');
      assert.equal(browser.getText('#title-headline'), 'Save a video');
    });
  });

  describe('with an existing video', () => {
    it('renders it in the list', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      browser.url('/');
      assert.equal(await browser.getText('#videos-container'), video.title);
    });

    it('and can navigate to a video', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      browser.url('/');
      browser.click('#videos-container .video-title a');
      assert.equal(browser.getText('#video-title'), video.title);
      assert.equal(browser.getText('#video-description'), video.description);
      assert.equal(browser.getAttribute('#video-url', 'src'), video.url);
    });
  });
});
