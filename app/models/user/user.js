// load the things we need
const mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// creating schema for individual user
// note : here type means whether user is person or institution
const userSchema = mongoose.Schema({
    
    name: {type:String,required: true},
    profile_image:String,
    email:{type:String,required: true},
    mobile_no:[String],
    password:{type:String,required: true},
    address: String,
    city_or_region:String,
    user_type:{type:String,required: true},
    isAccountVerified:{type:Boolean,default:false}
    
});


// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid or not
userSchema.methods.isPasswordValid = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
