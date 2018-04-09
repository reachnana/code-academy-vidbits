const {assert} = require('chai');
const {mongoose, databaseUrl, options} = require('../../database');
const Video = require('../../models/video');
const {connectDatabase, disconnectDatabase} = require('../database-utilities');

describe('Model: Video', () => {
  beforeEach(connectDatabase);
  afterEach(disconnectDatabase);

  describe('#title', () => {
    it('is a String', () => {
      const titleAsNonString = 1;
      const item = new Video({title: titleAsNonString});
      assert.strictEqual(item.title, titleAsNonString.toString());
    });
    it('is required', () => {
      const item = new Video({});
      item.validateSync();
      assert.equal(item.errors.title.message, 'Path `title` is required.');
    });
  });

  describe('#description', () => {
    it('is a String', () => {
      const descriptionAsNonString = 1;
      const item = new Video({description: descriptionAsNonString});
      assert.strictEqual(item.description, descriptionAsNonString.toString());
    });
    it('is required', () => {
      const item = new Video({});
      item.validateSync();
      assert.equal(item.errors.description.message, 'Path `description` is required.');
    });
  });

  describe('#url', () => {
    it('is a String', () => {
      const urlAsNonString = 1;
      const item = new Video({url: urlAsNonString});
      assert.strictEqual(item.url, urlAsNonString.toString());
    });
    it('is required', () => {
      const item = new Video({});
      item.validateSync();
      assert.equal(item.errors.url.message, 'Path `url` is required.');
    });
  });

});

module.exports = {
  connectDatabase,
  disconnectDatabase,
}
