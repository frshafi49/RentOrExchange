// fetching user and institution schema
const User = require('../models/user/user');



module.exports = {


    // user signup controller

    signupGet: async (req, res) => {

        res.status(200).json({
            msg: 'Signup here!'
        });
    },

    signupPost: async (req, res) => {

        const body = req.body;
        console.log('body: ', body);

        // cheking if any user is already signup with this email
        let isUserExistsAlready = await User.findOne({
            email: body.email
        });

        //if any user is already signup with this email,then restricts user to go further 
        if (isUserExistsAlready) {
            res.status(409).json({
                msg: 'User already exists with email: ' + body.email
            });
        }
        //else save new user in the database 
        else {

            let newUser = new User();
            newUser.first_name = body.first_name;
            newUser.last_name = body.last_name;
            newUser.email = body.email;
            newUser.password = newUser.generateHash(body.password);
            newUser.profile_image = body.profile_image;
            newUser.mobile_no = body.mobile_no;
            newUser.age = body.age;
            newUser.gender = body.gender;
            newUser.address = body.address;
            newUser.city_or_region = body.city_or_region;
            newUser.user_type = body.user_type;

            console.log('newUser data: ', newUser);
            await newUser.save();

           // if everything ok, then save user data in session
                // and take user to the home page
                req.session.user = newUser;
                console.log('sessioned user is: ', req.session.user);
                res.redirect('/');

        }
    },

    // login controller
    loginGet: async (req, res) => {
        res.status(200).json({
            msg: 'Login here!'
        });
    },

    loginPost: async (req, res) => {

        email = req.body.email;
        password = req.body.password;

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({
            'email': email
        }, (err, user) => {

            // if there are any errors, return the error before anything else
            if (err)
                res.status(403).json({
                    msg: 'Error occured during finding user!'
                });

            // if no user is found, return the message
            else if (!user) {
                req.flash('login-message', 'No user found with this email!'); //flashdata using connect-flash
                res.json({
                    msg: 'No user found with the email ' + email
                });
            }

            // if the user is found but the password is wrong
            else if (!user.isPasswordValid(password)) {
                req.flash('loginMessage', 'Oops! Wrong password.') //flashdata using connect-flash
                res.json({
                    msg: 'Oops! Wrong password for the email: ' + email
                }); //flashdata using connect-flash
            } else {

                // if everything ok, then save user data in session
                // and take user to the home page
                req.session.user = user;
                console.log('sessioned user is: ', req.session.user);
                res.redirect('/');
                
            }

        });


    },


    // home page
    homePage: async (req, res) => {

        if (req.session.user && req.cookies.user_id) {
            res.json({
                msg: 'User is from session ',
                session_user_email: req.session.user.email
            });
        } else {
             res.redirect('/login');
        }
    },

    // middleware function to check for logged-in users
    sessionChecker: async (req, res, next) => {
        if (req.session.user && req.cookies.user_id && req.session.user.email == req.body.email) {
            res.redirect('/');
        } else {
            next();
        }
    },

    // logout
    logout: async (req, res) => {

        if (req.session.user && req.cookies.user_id) {
            res.clearCookie('user_id');
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    }

};