'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogPostData() {
  console.info('seeding blog post data');
  const seedData = [];

  for (let i = 0; i < 10; i++) {
    seedData.push(generateBlogPostData());
  };

  return BlogPost.insertMany(seedData);
};

function generateBlogPostData() {
  return {
    title: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }
  };
};

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe('Blog Posts API Resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET Endpoint', function() {
    it('should return all existing posts', function() {
      let res;
      return chai.request(app)
        .get('/blogposts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.blogposts).to.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body.blogposts).to.have.length(count);
        });
    });

    it('should return blog posts with right fields', function() {
      let resBlogPost;
      return chai.request(app)
        .get('/blogposts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.blogposts).to.be.a('array');
          expect(res.body.blogposts).to.have.length.of.at.least(1);

          res.body.blogposts.forEach(function(blogpost) {
            expect(blogpost).to.be.a('object');
            expect(blogpost).to.include.keys(
              'id', 'title', 'content', 'author');
          });
          resBlogPost = res.body.blogposts[0];
          return BlogPost.findById(resBlogPost.id);
        })
        .then(function(blogpost) {
          expect(resBlogPost.id).to.equal(blogpost.id);
          expect(resBlogPost.title).to.equal(blogpost.title);
          expect(resBlogPost.content).to.equal(blogpost.content);
          expect(resBlogPost.author).to.contain(blogpost.author.firstName);
          expect(resBlogPost.author).to.contain(blogpost.author.lastName);
        });
    });
  });

  describe('POST Endpoint', function() {
    it('should add a new blog post', function() {
      const newBlogPost = generateBlogPostData();

      return chai.request(app)
        .post('/blogposts')
        .send(newBlogPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'title', 'content', 'author');
          expect(res.body.id).to.not.be.null;
          expect(res.body.title).to.equal(newBlogPost.title);
          expect(res.body.content).to.equal(newBlogPost.content);
          expect(res.body.author).to.contain(newBlogPost.author.firstName);
        })
    });
  });

  describe('PUT Endpoint', function() {
    it('should update blog posts fields by id', function() {
      const updateData = {
        title: "New Updated Title",
        content: "New Updated Content",
        author: {
          firstName: "New First Name",
          lastName: "New Last Name"
        }
      };

      return BlogPost
        .findOne()
        .then(function(blogpost) {
          updateData.id = blogpost.id;
          return chai.request(app)
            .put(`/blogposts/${updateData.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return BlogPost.findById(updateData.id)
        })
        .then(function(blogpost) {
          expect(blogpost.title).to.equal(updateData.title);
          expect(blogpost.content).to.equal(updateData.content);
        });
    });
  });

  describe('DELETE Endpoint', function() {
    it('deletes a post by id', function() {
      let blogpost;

      return BlogPost
        .findOne()
        .then(function(_blogpost) {
          blogpost = _blogpost;
          return chai.request(app).delete(`/blogposts/${blogpost.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(blogpost.id);
        })
        .then(function(_blogpost) {
          expect(_blogpost).to.be.null;
        });
    });
  });
});
