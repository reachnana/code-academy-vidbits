const {jsdom} = require('jsdom');

const Video = require('../models/video');

// Create and return a sample Video object
const buildVideoObject = (options = {}) => {
  const title = options.title || 'Best Dog Video';
  const url = options.url || generateRandomUrl('example.com');
  const description = options.description || 'Watch this dog do tricks.';
  const gif = false;
  return {title, description, url, gif};
};

// Create and return a sample Video object with gif
const buildGifObject = (options = {}) => {
  const title = options.title || 'Doggy Meme Gif';
  const url = options.url || generateRandomGifUrl();
  const description = options.description || 'These dogs make me LOL';
  const gif = true;
  return {title, description, url, gif};
};

// Add a sample Video object to mongodb
const seedVideoToDatabase = async (options = {}) => {
  const video = await Video.create(buildVideoObject(options));
  return video;
};

// Add a sample Gif object to mongodb
const seedGifToDatabase = async (options = {}) => {
  const video = await Video.create(buildGifObject(options));
  return video;
};

// extract text from an Element by selector.
const parseTextFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.textContent;
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

// extract src from an Element by selector.
const parseSrcFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.getAttribute('src');
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

// extract value from an Element by selector.
const parseValueFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.value;
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

// generate a random URL for a video
const generateRandomUrl = (domain) => {
  return `http://${domain}/${Math.random()}`;
};

// generate a random URL for a gif
const generateRandomGifUrl = () => {
  const gifIds = [
    'dog-pretty-Pn1gZzAY38kbm',
    'RQSuZfuylVNAY',
    'wjK3YnjoQf0go',
    'mrw-boy-51Uiuy5QBZNkoF3b2Z',
    'dog-summer-vacation-IvjjgsEhnLCzm',
    'dog-nirvana-doggie-dTJd5ygpxkzWo',
    'dog-puppy-dottie-3o7abAHdYvZdBNnGZq',
    'exercise-derp-derpy-Pk20jMIe44bHa'
  ];
  const randomId = Math.floor(Math.random() * (gifIds.length));
  const gifIdString = gifIds[randomId];
  const result = `https://media.giphy.com/media/${gifIdString}/giphy.gif`;
  return result;
};

module.exports = {
  buildVideoObject,
  buildGifObject,
  seedVideoToDatabase,
  seedGifToDatabase,
  parseTextFromHTML,
  parseSrcFromHTML,
  parseValueFromHTML,
  generateRandomUrl,
  generateRandomGifUrl
};
