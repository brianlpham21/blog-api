const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog Posts', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list posts on GET', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);

        const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
        res.body.forEach(function(post) {
          post.should.be.a('object');
          post.should.include.keys(expectedKeys);
        });
      });
  });

  it('should create posts on POST', function() {
    const newPost = {title: 'NEW Post', content: 'This are the contents of my new post', author: 'Brian'};

    return chai.request(app)
      .post('/blog-posts')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
        res.body.id.should.not.be.null;
//
        // res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id}));
      });
  });

  it('should update a post on PUT', function() {
    const updatePostData = {title: 'NEWER Post', content: 'This are the contents of my newer post', author: 'Brian'}

    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        updatePostData.id = res.body[0].id;
        return chai.request(app)
          .put(`/blog-posts/${updatePostData.id}`)
          .send(updatePostData);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  it('should delete a post on DELETE', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`)
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
