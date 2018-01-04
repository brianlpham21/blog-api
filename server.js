const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const uuid = require('uuid');
const morgan = require('morgan');

const app = express();

const {BlogPosts} = require('./models');

// logs the http layer
app.use(morgan('common'));

// create some blog posts so there is some initial data
BlogPosts.create('First Post', 'I enjoy food.', 'Brian Pham');
BlogPosts.create('Second Post', 'I enjoy music.', 'Brian Pham');
BlogPosts.create('Third Post', 'I enjoy football.', 'Brian Pham');

app.get('/blog-posts', (req, res) => {
  res.json(BlogPosts.get());
});

app.post('/blog-posts', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  };

  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author);
  res.status(201).json(item);
});

app.put('/blog-posts/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  };

  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and reuest body id (${req.body.id}) must match`
    console.error(message);
    return res.status(400).send(message);
  };

  console.log(`Updating blog item \`${req.params.id}\``);
  BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  });
  res.status(204).end();
});

app.delete('/blog-posts/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted Blog Post \`${req.params.id}\``);
  res.status(204).end();
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
