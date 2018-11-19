const bcrypt = require('bcrypt-nodejs');
const user_controller = require('../controller/UserController');

module.exports = (app) => {

     app.route('/signup')
     .get(user_controller.signupGet)
     .post(user_controller.signupPost);

     app.route('/login')
     .get(user_controller.loginGet)
     .post(user_controller.sessionChecker,user_controller.loginPost);

     app.route('/logout')
     .get(user_controller.logout);

     app.route('/')
     .get(user_controller.homePage);
    
   

};
