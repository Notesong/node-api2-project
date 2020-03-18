const express = require("express");
const Posts = require("../data/db.js");

const router = express.Router();

////////////////////////////////////////////////////////////////
// handlers for GET
//

// find all posts
router.get("/", (req, res) => {
  Posts.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err =>
      res.status(500).json({
        message:
          "There was an internal error while retrieving the messages from the database."
      })
    );
});

// find post by id
router.get("/:id", (req, res) => {
  const { id } = req.params;

  Posts.findById(id)
    .then(post => {
      if (post.length > 0) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        message:
          "There was an internal error while retrieving the messages from the database."
      })
    );
});

// find all comments for a post
router.get("/:id/comments", (req, res) => {
  const { id } = req.params;

  Posts.findPostComments(id)
    .then(comments => {
      if (comments.length > 0) {
        res.status(200).json(comments);
      } else {
        res.status(404).json({
          message: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        message:
          "There was an internal error while retrieving the messages from the database."
      })
    );
});

// find a comment for a post by id
router.get("/:id/comments/:comment_id", (req, res) => {
  const { id, comment_id } = req.params;

  Posts.findCommentById(comment_id)
    .then(comment => {
      if (comment.length > 0 && comment[0].post_id === parseInt(id)) {
        res.status(200).json(comment);
      } else {
        res.status(404).json({
          message:
            "The comment with the specified id does not exist in that post."
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        message:
          "There was an internal error while retrieving the messages from the database."
      })
    );
});

////////////////////////////////////////////////////////////////
// handlers for POST
//

// insert a post
router.post("/", (req, res) => {
  const postInfo = req.body;

  // make sure the title and contents were included in the body
  if (postInfo.title !== undefined && postInfo.contents !== undefined) {
    // insert the post into the database
    Posts.insert(postInfo)
      .then(post => {
        // get the newly inserted post to send back to the user
        Posts.findById(post.id)
          .then(newPost => {
            res.status(201).json(newPost);
          })
          .catch(err => {
            res.status(500).json({
              message: "There was an error while retriving the created message."
            });
          });
      })
      .catch(err => {
        res.status(500).json({
          message: "There was an error while saving the post to the database."
        });
      });
  } else {
    res.status(400).json({
      message: "Please provide title and contents for the post."
    });
  }
});

// insert a comment for a post
router.post("/:id/comments", (req, res) => {
  const { id } = req.params;
  const commentText = req.body;
  commentText.post_id = id;

  // find the post to be sure it exists
  Posts.findById(id)
    .then(post => {
      // if the post exists...
      if (post.length > 0) {
        // make sure there is data in the req body
        if (commentText.text) {
          // insert the comment into the database
          Posts.insertComment(commentText)
            .then(comment => {
              // find the new comment in the database and return it
              Posts.findCommentById(comment.id)
                .then(newComment => {
                  res.status(201).json(newComment);
                })
                .catch(err => {
                  res.status(500).json({
                    error:
                      "There was an error while retrieving the new comment."
                  });
                });
            })
            .catch(err =>
              res.status(500).json({
                error:
                  "There was an error while saving the comment to the database."
              })
            );
        } else {
          res.status(400).json({
            error: "Please provide text for the comment."
          });
        }
      } else {
        res.status(404).json({
          error: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        error:
          "There was an internal error while finding the post in the database."
      })
    );
});

////////////////////////////////////////////////////////////////
// handlers for DELETE
//

// remove a post
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // make sure the post exists
  Posts.findById(id)
    .then(post => {
      // if the post exists...
      if (post.length > 0) {
        // set the post to deletedPost
        const deletedPost = post;
        // then remove the post
        Posts.remove(id)
          // and then return the deleted post to the user
          .then(result => {
            res.status(200).json(deletedPost);
          })
          .catch(err => {
            res.status(500).json({
              error: "There was an internal error while removing the post."
            });
          });
      } else {
        res.status(404).json({
          error: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error:
          "There was an internal error while finding the id to remove the post."
      });
    });
});

////////////////////////////////////////////////////////////////
// handlers for PUT
//

// update a post
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const post = req.body;

  // make sure there are a title and contents in the request body
  if (post.title !== undefined && post.contents !== undefined) {
    // if there are, find the post by id
    Posts.findById(id)
      .then(posts => {
        // if the post is found...
        if (posts.length > 0) {
          // update the post
          Posts.update(id, post)
            .then(result => {
              console.log(result);
              // then get the newly updated post and return it
              Posts.findById(id)
                .then(post => {
                  res.status(200).json(post);
                })
                .catch(err => {
                  res.status(500).json({
                    error:
                      "There was an internal error while returning the post."
                  });
                });
            })
            .catch(err => {
              res.status(500).json({
                error: "There was an internal error while updating the post."
              });
            });
        } else {
          res.status(404).json({
            error: "The post with the specified ID does not exist."
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          error: "There was an internal error while finding the post."
        });
      });
  } else {
    res.status(400).json({
      error: "Please provide a title and contents for the post."
    });
  }
});

module.exports = router;
