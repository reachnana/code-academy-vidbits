const {assert} = require('chai');
const {buildVideoObject, buildGifObject} = require('../test-utils');

const setValuesAndClick = (video) => {
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

describe('User visiting create page', () => {
  describe('fills out the form', () => {
    it('and can save a video', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      assert.include(await browser.getText('body'), video.title);
      assert.include(await browser.getText('body'), video.description);
      assert.equal(await browser.getAttribute('#video-url', 'src'), video.url);
    });

    it('and can save a gif', async () => {
      const video = buildGifObject();
      setValuesAndClick(video);
      assert.include(await browser.getText('body'), video.title);
      assert.include(await browser.getText('body'), video.description);
      assert.equal(await browser.getAttribute('#video-url', 'src'), video.url);
    });
  });
});
