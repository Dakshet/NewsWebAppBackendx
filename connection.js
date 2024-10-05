const mongoose = require("mongoose");

async function handleToDB(url) {
    try {
        return mongoose.connect(url);

    } catch (error) {
        console.log(error.message);
    }
}

//Export
module.exports = {
    handleToDB,
}   