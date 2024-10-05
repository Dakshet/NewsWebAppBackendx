const express = require("express");
const { signupUser, loginUser, loginUserDetails } = require("../controllers/user");

const { body } = require("express-validator");
const { fetchUser } = require("../middlewares/fetchUser");

const router = express.Router();


router.post("/signup", [
    body("name", "Name must be 3 characters").isLength({ min: 3 }),
    body("email", "Enter the valid email").isEmail(),
    body("password", "Password must be 4 characters").isLength({ min: 4 })
], signupUser)

router.post("/login", loginUser)

router.get("/loginuserdetails", fetchUser, loginUserDetails)


module.exports = router;