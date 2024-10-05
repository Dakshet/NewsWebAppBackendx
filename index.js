require('dotenv').config()

const express = require("express");
const { handleToDB } = require("./connection");

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URL = process.env.MONGODB_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;
// console.log(FRONTEND_URL);


// Import
const userRoute = require("./routes/user")
const newsRoute = require('./routes/news')
const commentRoute = require("./routes/comment")
const cors = require("cors")
const path = require("path")


// MongoDB connection
handleToDB(MONGODB_URL).then(() => {
    console.log("DB Connected!")
})


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use("/uploads", express.static(path.resolve("./uploads")))


// Engine


// Cors
app.use(cors({
    origin: [FRONTEND_URL],
    // origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
}))



// Routes
app.use("/user", userRoute);

app.use("/news", newsRoute);

app.use('/comment', commentRoute)


// Listen
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});