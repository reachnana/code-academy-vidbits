const {assert} = require('chai');
const {buildVideoObject, seedVideoToDatabase} = require('../test-utils');

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
  // click delete on show page
  browser.click('#delete');
};

describe('User deleting video', () => {
  describe('removes the video', () => {
    it('from the list', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      assert.notInclude(await browser.getText('body'), video.title);
    });
  });
});
