// load the things we need
const mongoose = require('mongoose');

// creating schema for post
const postSchema = mongoose.Schema({
    
    post_type:{type:String},
    rent_title: {type:String},
    exchange_title: {type:String},
    rent_category:{type:String},
    rent_count_duration:{type:String},
    rent_cost:{type:String},
    exchange_category:{type:String},
    rent_description:{type:String},
    exchange_description:{type:String},
    exchange_with:{type:String},
    post_images:[String],
    mobile_no:{type:[String]},
    contact_address: String,
    city_or_region:String,
    posted_by:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, 
    created_at: { type: Date, default: Date.now }
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postSchema);
