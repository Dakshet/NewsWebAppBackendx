const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ["ADMIN", "USER", "REPORTER"],
        default: "USER"
    }
}, {
    timestamps: true
})

const User = model("user", userSchema);

module.exports = User;