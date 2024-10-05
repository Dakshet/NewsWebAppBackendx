const { validationResult } = require("express-validator");
const User = require("../models/user");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const JWT_SECURE = process.env.JWT_SECURE

let success = false;

async function signupUser(req, res) {
    try {
        //Destructure the user
        const { name, email, password, profileImageURL } = req.body;

        //Validate the fields
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({ success, Error: errors.array()[0].msg })
        }

        //Verify the user
        let user = await User.findOne({ email: req.body.email })

        if (user) {
            success = false;
            return res.status(400).json({ success, Error: "User with this email id are already register!" })
        }

        //Create the salt
        const salt = await bcrypt.genSalt(10);
        const securePass = await bcrypt.hash(req.body.password, salt);


        //Save data in the database
        user = await User.create({
            name,
            email,
            password: securePass,
            profileImageURL
        })

        user = await user.save();

        //Token
        const payload = {
            user: {
                id: user.id,
            }
        }
        const token = jwt.sign(payload, JWT_SECURE);


        //Final
        success = true;
        return res.status(201).json({ success, token })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}

async function loginUser(req, res) {
    try {
        //Destructure the user
        const { email, password } = req.body;

        //Validate the user
        let user = await User.findOne({ email: req.body.email })

        if (!user) {
            success = false;
            return res.status(404).json({ success, Error: "User is not found!" })
        }

        //validate the Password
        let comparePass = await bcrypt.compare(req.body.password, user.password)

        if (!comparePass) {
            success = false;
            return res.status(404).json({ success, Error: "Password doesn't match!" })
        }

        // console.log(user.id)
        //Create the token
        const payload = {
            user: {
                id: user.id,
            }
        }

        const token = jwt.sign(payload, JWT_SECURE);
        // console.log("con", token)

        //Final
        success = true;
        return res.status(200).json({ success, token })


    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}

async function loginUserDetails(req, res) {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        success = true;
        return res.status(200).json({ success, user })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


module.exports = {
    signupUser,
    loginUser,
    loginUserDetails
}