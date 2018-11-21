// fetching user schema
const User = require('../models/user/user');
const Post = require('../models/post/post');
let usernew;
module.exports = {


    // post controller
    writePost: async (req, res) => {

        // if any user is logged in then let him post

        console.log('writePost session user'+req.session.user);
        if (req.session.user) {

            // passing session user also
            // because we need user's information while posting

            // also passing user id to the browser, because user id is needed during post

            console.log('sessioned user id: '+req.session.user._id);
            res.cookie('post_user_id' , req.session.user._id);
            res.render('create_post', {
                user: req.session.user
            });

        }else{

            // no user is logged in(because no one in session)
            // so take user for login
            res.redirect('/login'); 

        }
       

    },
    sendPost: async (req, res) => {

        console.log('image length is: ' + req.files.length);

        const poster_id = req.cookies.post_user_id;
        console.log('sendPost user id: '+poster_id);

        // we allow max three images
        if (req.files.length > 3) {

            // sending flash message to the user about image limit exceeded
            console.log('image limit exceed!');
            console.log('Maximum image limit 3 but found' + req.files.length);
            req.flash("msg", "Maximum three images are allowed.");
            res.locals.messages = req.flash();
            res.render('create_post');

        }
        // if everything is ok then save post in database
        else {

            const post = new Post();
            console.log('body is: ');
            console.log(req.body);

            // checking if user is posting rent or exchange

            // user is posting a rent
            // so enter the rent data in the database
            if (req.body.rent_title) {
                console.log("rent title is: " + req.body.rent_title);

                post.post_type = "Rent";
                post.rent_title = req.body.rent_title;
                post.rent_category = req.body.rent_category;
                post.rent_count_duration = req.body.rent_count_duration;
                post.rent_cost = req.body.rent_cost;
                post.rent_description = req.body.rent_description;
                post.contact_address = req.body.contact_address;
                post.city_or_region = req.body.city_or_region;


            }
            // user is posting a exchange
            // so enter the exchange data in the database
            else if (req.body.exchange_title) {

                console.log('exchange title is: ' + req.body.exchange_title);
                post.post_type = "Exchange";
                post.exchange_title = req.body.exchange_title;
                post.exchange_category = req.body.exchange_category;
                post.exchange_description = req.body.exchange_description;
                post.exchange_with = req.body.exchange_with;
                post.contact_address = req.body.contact_address;
                post.city_or_region = req.body.city_or_region;
            }

            // also added poster id
            post.posted_by = poster_id;

            // commong things for both type of post (mobile no and photo)
            // if user gives photo,add it to post schema
            if (req.files.length > 0) {

                req.files.forEach(element => {
                    console.log(req.files.filename);
                    const host_image_folder_url = "http://localhost:8080/images/image_storage/"
                    let single_image_url = host_image_folder_url + element.filename;
                    post.post_images.push(single_image_url);
                });
            }
            // if user gives mobile number, then add it post schema
            if (req.body.mobile) {
                req.body.mobile.forEach(element => {
                    if (element.length > 0)
                        post.mobile_no.push(element);
                });

            }

            //saving new post in the database
            await post.save();
            console.log('new post: ' + post);

        
    
            // now redirecting to home page
            res.redirect('/');

        }
    },

    singlePostDetails: async(req,res) =>{
        
        const id = req.params.id;
        console.log('single post id: '+id);

        Post.findOne({_id:id},(err,post)=>{
           
            console.log('single post: '+post);
            res.render('single_post_details',{ 
                post:post,
                user: req.session.user
            });
            
        }).populate('posted_by');

    }
}