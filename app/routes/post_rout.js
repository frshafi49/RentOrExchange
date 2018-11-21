// fetching UsercController
const post_controller = require('../controller/PostController');
const multer  = require('multer');
const path = require('path');

module.exports = (app)=>{

    // multer is being used for catching user image
    // as well as we are getting field data from post form
    // through multer by calling req.body
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'public/images/image_storage');
        },
        filename: function (req, file, cb) {
          cb(null,  Date.now()+ '_' +file.fieldname+path.extname(file.originalname));
        }
      })
    const upload = multer({ storage: storage });

    // route get write post page and send post
    app.route('/post')
    .get(post_controller.writePost)
    .post(upload.any(),post_controller.sendPost);


    // rout single post details
    app.route('/post_details/:id')
    .get(post_controller.singlePostDetails);


}