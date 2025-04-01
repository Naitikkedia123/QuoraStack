const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const postSchema = new mongoose.Schema({
        uuid: { type: String, default: uuidv4}, 
        ownerid:{type: String},
        followid:{type: String},
        image: {
        type: String,
        },
        username: {
            type: String,
        },
        content: {
            type: String,
        },
        like: {
            type: Number,
            default: 0,
        },
        dislike: {
            type: Number,
            default: 0,
        },
        Comment: {
            type:[String],
            default: [],
        },
        name:{
            type:[String],
            default: [],
        },
        likedUsers: {
            type:[String],
            default: [],
        },
        dislikedUsers: {
            type:[String],
            default: [],
        },
});
const post = mongoose.model('post', postSchema);
const home = mongoose.model('home', postSchema);
const software = mongoose.model('software', postSchema);
const apple = mongoose.model('apple', postSchema);
const smartphones = mongoose.model('smartphones', postSchema);
const cs=mongoose.model('cs', postSchema);
const electronics=mongoose.model('electronics', postSchema);
const cricket=mongoose.model('cricket', postSchema);
const business=mongoose.model('business', postSchema);
const management=mongoose.model('management', postSchema);
const follow= mongoose.model('follow', postSchema);
const newPost = mongoose.model('newPost', postSchema);
module.exports = {management,business,cricket,electronics,cs,smartphones,apple,software,home,post,follow,newPost};
