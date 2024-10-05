const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    newsId: {
        type: Schema.Types.ObjectId,
        ref: 'news'
    },
    createdUser: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
}, {
    timestamps: true,
})

const Comment = model("comment", commentSchema);

module.exports = Comment;