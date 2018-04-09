const {jsdom} = require('jsdom');

const Video = require('../models/video');

const generateRandomUrl = (domain) => {
  return `http://${domain}/${Math.random()}`;
};

// Create and return a sample Item object
const buildVideoObject = (options = {}) => {
  const title = options.title || 'My favorite video';
  const url = options.url || generateRandomUrl('youtube'); //'https://youtu.be/embed/vPujtrae_WM';
  const description = options.description || 'Just the best video';
  return {title, url, description};
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

// Add a sample Video object to mongodb
const seedVideoToDatabase = async (options = {}) => {
  const video = await Video.create(buildVideoObject(options));
  return video;
};

const findElementInHTML = (htmlAsString, selector) => {
  const element = jsdom(htmlAsString).querySelector(selector);
  if (element !== null) {
    return element;
  } else {
    throw new Error(`Element with selector "${selector}" not found in HTML string`);
  }
};

const submitVideoForm = (browser, video) => {
  browser.setValue('#title-input', video.title);
  browser.setValue('#description-input', video.description);
  browser.setValue('#url-input', video.url);
  browser.click('#submit-button');
};

module.exports = {
  buildVideoObject,
  parseTextFromHTML,
  seedVideoToDatabase,
  findElementInHTML,
  submitVideoForm
};
