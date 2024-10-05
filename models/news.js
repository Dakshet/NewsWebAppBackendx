const { Schema, model } = require("mongoose");

const newsSchema = new Schema({
    createdUser: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    tag: {
        type: String,
        enum: ["NEWS", "ARTICLE", "INTERVIEW", "EVENT", "MAGAZINE"],
        default: "NEWS",
    },
    coverImageURL: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
})

const News = model("news", newsSchema);

module.exports = News;