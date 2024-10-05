const jwt = require("jsonwebtoken");

const JWT_SECURE = process.env.JWT_SECURE

let success = false;


const fetchUser = (req, res, next) => {
    try {

        const token = req.header("auth_token")

        // console.log(token);

        if (!token) {
            success = false;
            return res.status(404).json({ success, Error: "Token is not found" })
        }


        try {
            const payload = jwt.verify(token, JWT_SECURE);

            req.user = payload.user;

            next();

        } catch (error) {
            console.log(error.message);
            success = false
            return res.status(400).json({ success, Error: "Please Authentication using valid token" })
        }



    } catch (error) {
        console.log(error);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured" })
    }
}

module.exports = {
    fetchUser,
}