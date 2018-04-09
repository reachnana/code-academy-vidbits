const router = require('express').Router();
const Video = require('../models/video');

router.get('/', (req, res, next) => {
  res.redirect('/videos');
});

router.get('/videos', async (req, res, next) => {
  const videos = await Video.find({});
  res.render('videos/index', {videos});
});

router.get('/videos/create', async (req, res, next) => {
  res.render('videos/create');
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

router.post('/videos', async (req, res, next) => {
  const {title, description, url, gif} = req.body;
  const video = new Video({
    title,
    description,
    url,
    gif
  });
  video.validateSync();
  if (video.errors) {
    res.status(400).render('videos/create', {video});
  } else {
    const newVideo = await video.save();
    res.redirect(`/videos/${newVideo._id}`);
  }
});

router.post('/videos/:id/updates', async (req, res, next) => {
  const {title, description, url, gif} = req.body;
  const video = await Video.findById(req.params.id);
  video.set('title', title);
  video.set('description', description);
  video.set('url', url);
  video.set('gif', gif);
  video.validateSync();
  if (video.errors) {
    res.status(400).render('videos/edit', {video});
  } else {
    await video.save();
    res.redirect(`/videos/${video._id}`);
  }
});

router.post('/videos/:id/deletions', async (req, res, next) => {
  const id = req.params.id;
  const video = await Video.remove({ _id: id })
  res.redirect('/');
});
module.exports = router;
