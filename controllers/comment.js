const { validationResult } = require("express-validator");
const Comment = require("../models/comment");

let success = false;

async function fetchAllComments(req, res) {
    try {
        let comments = await Comment.find({ newsId: req.params.newsId }).populate("createdUser")

        success = true;
        return res.status(200).json({ success, comments })


    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function addComment(req, res) {
    try {
        //Destructure the request
        const { content, newsId } = req.body;

        //Validate the fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({ success, Error: errors.array()[0].msg })
        }


        //Add data in DB
        let comment = await Comment.create({
            content,
            newsId,
            createdUser: req.user.id,
        })

        comment = (await comment.save());

        comment = await comment.populate("createdUser")
        // console.log(comment);

        //Final
        success = true;
        return res.status(201).json({ success, comment })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}

module.exports = {
    fetchAllComments,
    addComment,
}