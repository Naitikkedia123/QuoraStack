const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 10000;
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
const session =require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const {isLoggedIn} = require('./middleware.js');
const mongoose = require('mongoose');
const{ management, business, cricket, electronics, cs, smartphones, apple, software, home, post, follow, newPost } = require('./models/schema');
main()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://kedianaitik2006:naitik123@cluster0.w4spnbk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
}
const spaces = [
    { id:"cricket",name: "Cricket (Sport)", description: "Latest updates, matches, and discussions on Cricket.", image: "cricket.jpeg" },
    { id:"management",name: "Management", description: "Insights, strategies, and tips for effective business management.", image: "management.jpeg" },
    { id:"business",name: "Business Strategy", description: "Learn how to build, scale, and strategize for business success.", image: "business_strategy.jpeg" },
    { id:"electronics",name: "Electronics", description: "All about the latest gadgets, innovations, and electronic devices.", image: "electronics.jpeg" },
    { id:"cs",name: "Computer Science", description: "Programming, algorithms, and latest tech trends in Computer Science.", image: "computer_science.jpeg" },
    { id:"smartphones",name: "Smartphones", description: "Explore the latest smartphones, reviews, and technology updates.", image: "smartphones.jpeg" },
    { id:"apple",name: "Apple Products", description: "News and discussions about Apple devices and their ecosystem.", image: "apple_products.jpeg" },
    { id:"software",name: "Software and Applications", description: "Discuss and explore the latest software tools and applications.", image: "software_apps.jpeg" }
];
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Ensure 'uploads' folder exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store in 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage: storage });
const store=MongoStore.create({
    mongoUrl:'mongodb://127.0.0.1:27017/quora',
    crypto:{
        secret: 'your-secret-key',
    },
    touchAfter:24*3600,
});
const sessionOptions = {
    store,
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+(1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();}); 
app.get('/signup', (req, res) => {
    // Pass query parameters to the view
    res.render('signup.ejs', { status: req.query.status });
});

app.post('/signup', async (req, res) => { 
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username: username, email: email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            res.redirect('/post?status=success');
        });
    } catch (e) {
        console.error(e);
        res.redirect('/signup?status=error');
    }
});

app.get('/login', (req, res) => {
    res.render('login.ejs', { status: req.query.status });
})
app.post('/login', passport.authenticate('local', {
    successRedirect: '/post?status=succes',
    failureRedirect: '/login?status=error'  
}),
async (req, res) => {
    if(req.user){
        res.redirect('/post?status=succes');
    }
}); 
app.get('/logout', (req, res,next) => {
    req.logout((err) =>{
    if(err){
        return next(err);
    }
    res.redirect('/post?status=loggedout');
});
});
app.get('/post/management',isLoggedIn, async (req, res) => {
    let managements = await management.find();
    res.render('management.ejs', { managements });
});

app.get('/post/business',isLoggedIn, async(req, res) => {
    let businesss = await business.find();
    res.render('business.ejs', { businesss });
});

app.get('/post/electronics',isLoggedIn, async(req, res) => {
    let electronicss = await electronics.find();
    res.render('electronics.ejs', { electronicss });
});

app.get('/post/cs',isLoggedIn, async(req, res) => {
    let css = await cs.find();
    res.render('cs.ejs', { css });
});

app.get('/post/smartphones',isLoggedIn, async(req, res) => {
    let smartphoness = await smartphones.find();
    res.render('smartphones.ejs', { smartphoness });
});

app.get('/post/apple',isLoggedIn, async(req, res) => {
    let apples = await apple.find();
    res.render('apple.ejs', { apples });
});
app.get('/post/software',isLoggedIn, async(req, res) => {
    let softwares = await software.find();
    res.render('software.ejs', { softwares });
});
app.get('/post/about',isLoggedIn, (req, res) => {
    res.render('about.ejs');
}); 
app.get('/post/careers',isLoggedIn, (req, res) => {
    res.render('carrer.ejs');
});
app.get('/post', async(req, res) => {
    let homes = await home.find();
    res.render('index.ejs', { homes, status: req.query.status });
});
app.get('/post/terms',isLoggedIn, (req, res) => {
    res.render('terms.ejs');
});
app.get('/post/privacy',isLoggedIn, (req, res) => {
    res.render('privacy.ejs');
});
app.get('/post/acceptable',isLoggedIn, (req, res) => {
    res.render('acceptable.ejs');
});
app.get('/post/cricket',isLoggedIn, async(req, res) => {
    let crickets = await cricket.find();
    res.render('cricket.ejs', { crickets });
});
app.get('/post/:uuid/edit',isLoggedIn, async(req, res) => {
    let { uuid } = req.params;
    let posts = await post.findOne({ uuid: uuid });
    res.render('edit.ejs', { posts });
});
app.get('/post/new',isLoggedIn, (req, res) => {
    res.render('new.ejs');
});
app.get('/post/yourpost',isLoggedIn, async(req, res) => {
    let newPosts=await newPost.find({ownerid : req.user._id});
    res.render('yourpost.ejs', { newPosts });
});
app.get('/post/follow',isLoggedIn, async(req, res) => { 
    let follows = await follow.find({followid : req.user._id  });
    res.render('follow.ejs', { follows });
});
app.get('/post/people',isLoggedIn, (req, res) => {
    res.render('people.ejs',{spaces});
});
app.get('/post/game',isLoggedIn, (req, res) => {
    res.render('game.ejs');
});
app.get('/post/simon',isLoggedIn, (req, res) => {
    res.render('simon.ejs',{});
});
app.get('/post/tictactoe',isLoggedIn, (req, res) => {
    res.render('tictactoe.ejs');
});
app.get('/post/:uuid',isLoggedIn, async(req, res) => {
    let { uuid } = req.params;
    let posts=await post.findOne({ uuid: uuid });
    res.render('show.ejs', {posts});
});
app.put('/post/follow/:uuid', isLoggedIn, async (req, res) => {
    let { uuid } = req.params;

    let alreadyFollowed = await follow.findOne({ uuid: uuid, followid: req.user._id });

    if (alreadyFollowed) {
        return res.json({ success: false, message: "You have already followed this post!" });
    }

    let postToFollow = await post.findOne({ uuid: uuid });

    let followedPost = new follow({
        uuid: postToFollow.uuid,
        followid: req.user._id,
        username: postToFollow.username,
        content: postToFollow.content,
        image: postToFollow.image,
        like: postToFollow.like,
        dislike: postToFollow.dislike,
        Comment: postToFollow.Comment
    });

    await followedPost.save();
    res.json({ success: true, message: "Followed successfully" });
});
// Handle Image Upload in Form
app.post('/post/new', upload.single('image'),isLoggedIn, (req, res) => {
    const { username, content } = req.body;
    let uuid = uuidv4();
    let ownerid = req.user._id;
    let image = req.file ? req.file.filename : 'default.jpg'; // Default if no image
    let newhome= new home ({ uuid, username, content, image });
    newhome.save();
    let newpost = new newPost({ uuid,ownerid, username, content, image });
    newpost.save();
    let newpost1 = new post({ uuid, username, content, image });
    newpost1.save();
    res.redirect('/post');
});

app.put('/post/:uuid',upload.single('image'),isLoggedIn, async(req, res) => {
    let { uuid } = req.params;
    let image = req.file ? req.file.filename : 'default.jpg';
    const { username, content } = req.body;
    let posts = await post.findOneAndUpdate({ uuid: uuid },{username:username,content:content,image:image});
    let homes =await home.findOneAndUpdate({ uuid: uuid },{username:username,content:content,image:image});
    let newposts = await newPost.findOneAndUpdate({ uuid: uuid },{username:username,content:content,image:image});
    res.redirect('/post');
});
app.patch('/post/:uuid/:collection/like', isLoggedIn, async (req, res) => {
    let { collection, uuid } = req.params;
    let Model = mongoose.model(collection);

    let postToUpdate = await Model.findOne({ uuid: uuid });

    if (postToUpdate.likedUsers.includes(req.user._id)) {
        return res.json({ success: false, message: "You have already liked this post!" });
    }

    await Model.findOneAndUpdate(
        { uuid: uuid },
        { $inc: { like: 1 }, $push: { likedUsers: req.user._id } },
        { new: true }
    );

    // Fetch the updated post to get the correct like count
    postToUpdate = await Model.findOne({ uuid: uuid });

    res.json({ success: true, message: "Post liked successfully", likes: postToUpdate.like });
});



app.patch('/post/:uuid/:collection/dislike', isLoggedIn, async (req, res) => {
    let { collection, uuid } = req.params;
    let Model = mongoose.model(collection);

    let postToUpdate = await Model.findOne({ uuid: uuid });

    if (postToUpdate.dislikedUsers.includes(req.user._id)) {
        return res.json({ success: false, message: "You have already disliked this post!" });
    }

    await Model.findOneAndUpdate(
        { uuid: uuid },
        { $inc: { dislike: 1 }, $push: { dislikedUsers: req.user._id } },
        { new: true }
    );

    // Fetch the updated post to get the correct dislike count
    postToUpdate = await Model.findOne({ uuid: uuid });

    res.json({ success: true, message: "Post disliked successfully", dislikes: postToUpdate.dislike });
});

app.patch('/post/comment/:uuid',isLoggedIn, async(req, res) => {
    let { uuid } = req.params;
    const {comment} = req.body;
    
    let posts = await post.findOneAndUpdate(
        {uuid:uuid},
        { $push: { Comment: comment, name: req.user.username} },
    )
    let arr=[management, business, cricket, electronics, cs, smartphones, apple, software, home] 
    for(el of arr){
        let postToUpdate = await el.findOneAndUpdate(
            { uuid: uuid },
            { $push: { Comment: comment, name: req.user.username} },
        )
    }
    res.redirect('/post');
});
app.delete('/post/yourpost/:uuid',isLoggedIn,async (req, res) => {
    let { uuid } = req.params;
    let homes = await home.findOneAndDelete({uuid:uuid});
    let newPosts=await newPost.findOneAndDelete({uuid:uuid});
    let posts =await post.findOneAndDelete({uuid:uuid});
    res.redirect('/post/yourpost');
});
app.delete('/post/unfollow/:uuid',isLoggedIn, async(req, res) => {
    let { uuid } = req.params;
    let follows = await follow.findOneAndDelete({uuid:uuid});
    res.redirect('/post/follow');
}); 

app.post('/search',isLoggedIn, async(req, res) => {
    const { search } = req.body;
    let posts = await post.find({ 
        username: { $regex: new RegExp(search, "i") } // Case-insensitive search
    });
    console.log(posts);
    res.render('search.ejs', { post: posts });
});
app.patch('/post/simon', isLoggedIn, async (req, res) => {
    const { score } = req.body;
    try {
        let user = await User.findById(req.user._id);
        if (user.highscore < score) {
            user.highscore = score;
            await user.save();
            return res.json({ success: true, message: "High score updated", highscore: user.highscore });
        } else {
            return res.json({ success: true, message: "High score unchanged", highscore: user.highscore });
        }
    } catch (e) {
        console.error("Error updating highscore:", e);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
