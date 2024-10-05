const express = require("express");
const { fetchAllComments, addComment } = require("../controllers/comment");
const { fetchUser } = require("../middlewares/fetchUser");
const { body } = require("express-validator");

const router = express.Router();

router.get("/fetchallcomments/:newsId", fetchAllComments)

router.post("/addcomment", [
    body("content", "Content must be 3 characters").isLength({ min: 3 }),
], fetchUser, addComment)

module.exports = router;