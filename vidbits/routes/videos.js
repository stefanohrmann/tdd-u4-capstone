const router = require('express').Router();

const Video = require('../models/video');

router.get('/videos', async (req, res, next) => {
  const videos = await Video.find({});
  res.render('videos/index', {videos});
});

router.get('/videos/create', (req, res, next) => {
  res.render('videos/create');
});

router.post('/videos', async (req, res, next) => {
  const {title, description, url} = req.body;
  const video = new Video({title, description, url});
  video.validateSync();
  
  if (video.errors) {
    res
      .status(400)
      .render('videos/create', {video});
  } else {
    await video.save();
    res
      .redirect(`/videos/${video.id}`);
  }
});

router.get('/videos/:id', async (req, res, next) => {
  const id = req.params.id;
  const video = await Video.findById(id);

  res.render('videos/show', {video});
});

router.get('/videos/:id/edit', async (req, res, next) => {
  const id = req.params.id;
  const video = await Video.findById(id);

  res.render('videos/edit', {video});
});

router.post('/videos/:id/edit', async (req, res, next) => {
  const id = req.params.id;
  const {title, description, url} = req.body;
  const video = await Video.findById(id);

  video.title = title;
  video.description = description;
  video.url = url;

  video.validateSync();

  if (video.errors) {
    res
      .status(400)
      .render('videos/edit', {video});
  } else {
    await video.save();
    res
      .redirect(`/videos/${video.id}`);
  }
});

router.post('/videos/:id/delete', async (req, res, next) => {
  const _id = req.params.id;
  await Video.deleteOne({_id});
  res.redirect('/videos');
});

module.exports = router;