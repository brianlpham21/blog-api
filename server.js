const express = require('express');
const router = express.Router();

const app = express();

const morgan = require('morgan');

const blogPostRouter = require('./blogPostRouter');

// logs the http layer
app.use(morgan('common'));

app.use('/blog-posts', blogPostRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
