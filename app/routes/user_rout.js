// fetching UsercController
const user_controller = require('../controller/UserController');
const multer  = require('multer');
const path = require('path');

module.exports = (app) => {


     // multer is being used for catching user image
     // as well as we are getting field data from post form
     // through multer by calling req.body
     const storage = multer.diskStorage({
          destination: function (req, file, cb) {
               cb(null, 'public/images/image_storage');
          },
          filename: function (req, file, cb) {
               cb(null, Date.now() + '_' + file.fieldname + path.extname(file.originalname));
          }
     })
     const upload = multer({
          storage: storage
     });

     app.route('/signup')
          .get(user_controller.signupGet)
          .post(upload.single('profile_image'),user_controller.sendMailForUserVerfication, user_controller.signupPost);

     app.route('/login')
          .get(user_controller.loginGet)
          .post(user_controller.sessionChecker, user_controller.loginPost);

     app.route('/logout')
          .get(user_controller.logout);

     app.route('/')
          .get(user_controller.homePage);

     app.route('/verify')
          .get(user_controller.verficationValidationFromGmail);



};