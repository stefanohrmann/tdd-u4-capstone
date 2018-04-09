const {mongoose} = require('../database');

const Video = mongoose.model(
  'Video',
  mongoose.Schema({
    title: {
      type: String,
      required: [true, 'A `title` is required.']
    },
    url: {
      type: String,
      required: [true, 'A `url` is required.']
    },
    description: {
      type: String
    }
  })
);

module.exports = Video;
