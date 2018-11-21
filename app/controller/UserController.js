// fetching user schema
const User = require('../models/user/user');
const Post = require('../models/post/post');

// nod-mailer for email verification
const nodemailer = require('nodemailer');

// getting 'dotenv' module for accessing environment variable data(secure data)
require('dotenv').config();

let rand, mailOptions, host, link;

module.exports = {

    // home page
    homePage: async (req, res) => {

        // finding all the posts for showing in the index page
        // we will also show two featured posts in the index page

        let perPage = 8;
        let page = req.params.page || 1;

        const posts = await Post.find({})
            .populate('posted_by', 'name')
            .skip((perPage * page) - perPage)
            .sort({
                'created_at': -1
            })
            .limit(perPage);

        // getting two featured posts
        // const featuredPosts = await Post.find({post_category:'Featured'})
        // .sort({'post_created_at': -1})
        // .limit(2);

        if (posts) {
            const count = await Post.count();
            res.render('index.ejs', {
                posts: posts,
                user: req.session.user,
                pages: Math.ceil(count / perPage)
            });

            console.log(posts);
            console.log('home page sessioned user: ' + req.session.user);
        }

    },



    // user signup controller
    signupGet: async (req, res) => {

        res.status(200).render('signup');
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
            // sending flash message to the user
            req.flash("msg", "User already exists with this email, try another.");
            res.locals.messages = req.flash();
            res.render('signup');
        } else if (req.body.password != req.body.password_repeated) {

            // sending flash message to the user
            req.flash("msg", "Password mismatched, please check again.");
            res.locals.messages = req.flash();
            res.render('signup');
        }
        //else save new user in the database 
        else {

            let newUser = new User();
            newUser.name = body.name;
            newUser.email = body.email;
            newUser.password = newUser.generateHash(body.password);
            newUser.profile_image = body.profile_image;

            console.log('profile image: ' + req.files);
            console.log('profile image: ' + req.file);

            // if user gives photo,add it to 
            if (req.file) {

                console.log('profile image name: ' + req.file.filename);
                const host_image_folder_url = "http://localhost:8080/images/image_storage/"
                let single_image_url = host_image_folder_url + req.file.filename;
                newUser.profile_image = single_image_url;
            }
            // if user gives mobile number, then add it
            if (body.mobile) {
                body.mobile.forEach(element => {
                    if (element.length > 0) {
                        newUser.mobile_no.push(element);
                    }
                });

            }

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

        res.status(200).render('login');
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

                // sending flash message to the user
                req.flash("msg", "No user found with this email !");
                res.locals.messages = req.flash();
                res.render('login');

            }
            // if the user is found but the password is wrong
            else if (!user.isPasswordValid(password)) {

                console.log('Password did not match');

                // sending flash message to the user
                req.flash("msg", 'Oops! Wrong password.');
                res.locals.messages = req.flash();
                res.render('login');

            } else {

                // if everything ok, then save user data in session
                // and take user to the home page
                req.session.user = user;
                console.log('sessioned user is: ', req.session.user);
                res.redirect('/');

            }

        });


    },
    // middleware function to check for logged-in users
    sessionChecker: async (req, res, next) => {
        if (req.session.user && req.cookies.user_id) {
            res.redirect('/');
        } else {
            next();
        }
    },

    // logout
    logout: async (req, res) => {

        if (req.session.user && req.cookies.user_id) {
            res.clearCookie('user_id');
            res.clearCookie('post_user_id');
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    },


    // =====================================
    // Email-verfication ===================
    // =====================================

    // route middlewear to send email to the user for verification
    // setting smtp requiremet for sending mail to the user

    // getting email and password of the app for send mail to the user
    // in this blog, it is my email and password,
    // which I saved in .env file
    sendMailForUserVerfication: async (req, res, next) => {

        const smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.MY_GMAIL_ID, // loading from environment variable
                pass: process.env.MY_GMAIL_PASS // loading from environment variable
            }
        });

        // creating random number for checking if user is fake or not
        rand = Math.floor((Math.random() * 10000) + 54);
        host = req.get('host');
        link = "http://" + host + "/verify?id=" + rand + "&email=" + req.body.email;

        // nodemailer mail option setup
        mailOptions = {
            to: req.body.email,
            subject: "Rent or Exchange",
            html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
        };

        console.log(mailOptions);

        // sending email
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                res.send(error);
            } else {

                console.log("Message sent: " + response.message);
                return next(); // if mail is sent the go for signup
            }
        });
    },


    // controlling call back from mail and validate user
    verficationValidationFromGmail: async (req, res) => {

        console.log(req.protocol + ":/" + req.get('host'));
        if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
            console.log("Domain is matched. Information is from Authentic email");

            console.log('random value is: ' + rand);
            console.log('query value is: ' + req.query.id);
            if (req.query.id == rand) {
                console.log("email is verified");
                console.log(req.user);

                // if user comes from correct link, update user's isVerified variable in database
                const email = req.query.email;
                console.log("user email is " + email);
                User.findOne({
                    'email': email
                }, function (err, user) {
                    if (err) return handleError(err);

                    user.isAccountVerified = true;

                    // if session user and this user is same
                    // then make session user verified also

                    if (req.session.user.email == email) {
                        req.session.user.isAccountVerified = true;
                    }
                    user.save(function (err, updatedUser) {

                        if (err) return handleError(err);
                        //res.send(updatedUser);
                        const url = "http://localhost:8080";
                        res.end("<h1>Email " + mailOptions.to + " is successfully verified</br>" +
                            "<a href=" + url + ">Go back to home</a>");

                    });
                });
            } else {
                console.log("email is not verified");
                res.end("<h1>Bad Request</h1>");
            }
        } else {
            res.end("<h1>Request is from unknown source");
        }

    }



};