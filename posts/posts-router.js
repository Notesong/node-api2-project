const express = require("express");
const Posts = require("../data/db.js");

const router = express.Router();

////////////////////////////////////////////////////////////////
// handlers for GET
//

// find all posts (working)
router.get("/", (req, res) => {
  Posts.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err =>
      res.status(500).json({
        message:
          "There was an internal error while retrieving the messages from the database"
      })
    );
});

// find post by id (working)
router.get("/:id", (req, res) => {
  const { id } = req.params;

  Posts.findById(id)
    .then(posts => {
      if (posts.length > 0) {
        res.status(200).json(posts);
      } else {
        res.status(404).json({
          success: false,
          message: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        message:
          "There was an internal error while retrieving the messages from the database"
      })
    );
});

// find all comments for a post (working)
router.get("/:id/comments", (req, res) => {
  const { id } = req.params;

  Posts.findPostComments(id)
    .then(posts => {
      if (posts.length > 0) {
        res.status(200).json(posts);
      } else {
        res.status(404).json({
          success: false,
          message: "The post with the specified ID does not exist."
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        success: false,
        message:
          "There was an internal error while retrieving the messages from the database"
      })
    );
});

// find a comment for a post by id (working)
router.get("/:id/comments/:comment_id", (req, res) => {
  const { id, comment_id } = req.params;

  Posts.findCommentById(comment_id)
    .then(comment => {
      if (comment.length > 0 && comment[0].post_id === parseInt(id)) {
        res.status(200).json(comment);
      } else {
        res.status(404).json({
          success: false,
          message:
            "The comment with the specified id does not exist in that post."
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        success: false,
        message:
          "There was an internal error while retrieving the messages from the database"
      })
    );
});

////////////////////////////////////////////////////////////////
// handlers for POST
//

// insert a post (working)
router.post("/", (req, res) => {
  const postInfo = req.body;

  if (postInfo.title && postInfo.contents) {
    Posts.insert(postInfo)
      .then(post => {
        res.status(201).json({ success: true, post });
      })
      .catch(err => {
        res.status(500).json({
          success: false,
          message: "There was an error while saving the post to the database"
        });
      });
  } else {
    res.status(400).json({
      success: false,
      message: "Please provide title and contents for the post."
    });
  }
});

// insert a comment for a post
router.post("/:id/comments", (req, res) => {
  const { id } = req.params;
  const commentText = req.body;
  commentText.post_id = id;

  Posts.findById(id)
    .then(post => {
      if (commentText.text) {
        Posts.insertComment(commentText)
          .then(comment => {
            res.status(201).json({ success: true, comment });
          })
          .catch(err =>
            res.status(500).json({
              success: false,
              message:
                "There was an error while saving the comment to the database"
            })
          );
      } else {
        res.status(400).json({
          success: false,
          message: "Please provide text for the comment."
        });
      }
    })
    .catch(err => {
      res.status(404).json({
        success: false,
        message: "The post with the specified ID does not exist."
      });
    });
});

////////////////////////////////////////////////////////////////
// handlers for DELETE
//

// delete a post

////////////////////////////////////////////////////////////////
// handlers for PUT
//

// update a post

module.exports = router;
