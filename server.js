
// set up ======================================================================
// get all the tools we need

const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');
const flash    = require('connect-flash');

const passport =  require('passport');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');

// database configuration, right now local database
const conigDB = require('./config/database');

// connecting with mongodb using mongoose
mongoose.connect(conigDB.url,{
    /* other options gose here */
    useNewUrlParser:true
});

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)


// this is the latest method of using body-parser
// get information from html forms
// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded p ost data
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for session
app.use(session({key: 'user_id',resave:false,saveUninitialized:true, secret: 'rentorexchange' })); // session secret


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
// app.use((req, res, next) => {
//     if (req.cookies.user_id && !req.session.user) {
//         res.clearCookie('user_id');        
//     }
//     next();
// });


app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static('public')); // static folder for direct use

//load our routes
require('.//app/routes/user_rout.js')(app); 
require('.//app/routes/post_rout.js')(app); 


// launch ======================================================================
app.listen(port);
console.log('Happily running on port ' + port);