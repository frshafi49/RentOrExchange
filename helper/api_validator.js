const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../app/models/user');

module.exports = {

    // checking if user sending token with the request
    ensureToken: (req, res, next) => {

        const bearerHeader = req.headers["authorization"];

        console.log('bearer_header: ', bearerHeader);

        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            req.jwt = bearerToken;
            console.log('jwt token: ', req.jwt);
            next();

        } else {
            console.log("jwt token missing!");
            res.sendStatus(403);
        }
    },

    // cheking if given token is valid or not
    verifyToken: async (req, res, next) => {

        jwt.verify(req.jwt, config.api_secret_key.secret_key, async (err, data) => {

            if (err) {
                console.log("error: ", err)
                res.sendStatus(403).json({
                    msg: "error occured during verifying token!"
                });
            } else {

                console.log("data from jwt token: ", data);
                if (data.exp > Date.now() / 1000) {
                    const user = await User.findOne({
                        email: data.email
                    });
                    if (user) {
                        req.user_id = user._id;
                        console.log("user id: ", req.user_id);
                        next();

                    } else {
                        res.sendStatus(403).json({msg:'no user found with email: '+email});
                    }
                } else {
                    res.status(400).json({
                        msg: "token Expired!"
                    })
                }
            }
        });
    }

};