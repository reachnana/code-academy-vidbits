const {assert} = require('chai');
const {buildVideoObject, buildGifObject, seedVideoToDatabase} = require('../test-utils');

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
  // click edit on show page
  browser.click('#edit');
};

describe('User visiting edit page', () => {
  describe('updates the video', () => {
    it('and displays the change in the show page', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      const updateTitle = 'Doggo is good boi';
      // edit video and submit
      browser.setValue('#title-input', updateTitle);
      browser.click('#submit-button');
      // verify on show page
      assert.include(await browser.getText('body'), updateTitle);
    });

    it('without creating a new video', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      const updateTitle = 'Doggo is good boi';
      // edit video and submit
      browser.setValue('#title-input', updateTitle);
      browser.click('#submit-button');
      // verify on show page
      assert.notInclude(await browser.getText('body'), video.title);
    });
  });

  describe('updates the video to a gif', () => {
    it('and displays the change in the show page', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      const gif = buildGifObject();
      // edit video and submit
      browser.setValue('#title-input', gif.title);
      browser.setValue('#url-input', gif.url);
      browser.click('#gif-input');
      browser.click('#submit-button');
      // verify on show page
      assert.equal(await browser.getAttribute('#video-url', 'src'), gif.url);
    });

    it('without creating a new gif', async () => {
      const video = buildVideoObject();
      setValuesAndClick(video);
      const gif = buildGifObject();
      // edit video and submit
      browser.setValue('#title-input', gif.title);
      browser.setValue('#url-input', gif.url);
      browser.click('#gif-input');
      browser.click('#submit-button');
      // verify on show page
      assert.notInclude(await browser.getText('body'), video.title);
    });
  });
});
