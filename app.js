var express = require('express'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    app = express();

//APP CONFIG
mongoose.connect('mongodb://localhost/blog_app');

app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
//put the sanitizer always after the body parser
//sanitizer is used to not let users type any js in the <p> <%- blog.body %> </p>
app.use(expressSanitizer());
app.use(methodOverride('_method'));

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model('Blog', blogSchema);

// Blog.create({
//     title: 'Test Blog',
//     image: 'http://www.analystconsult.com/wp-content/uploads/2015/07/Blog.png',
//     body: 'hello this is a blog post!'
// });

//RESTFUL ROUTES
app.get('/', function(rew, res){
    res.redirect('/blogs');
});

app.get('/blogs', function(rew, res){
    Blog.find({}, function(err, blogs){
        if (err){
            console.log('ERROR ' +  err);
        } else {
            res.render('index', {
                blogs: blogs
            });
        }
    });
});

app.get('/blogs/new', function(req, res){
    res.render('new');
});

app.post('/blogs', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            console.log(err);
            res.render('new');
        } else {
            console.log(newBlog);
            res.redirect('/blogs');
        }
    });
});

app.get('/blogs/:id', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err){
            console.log(err);
            res.redirect('/blogs');
        } else {
            console.log(foundBlog);
            res.render('show', {
                blog: foundBlog
            });
        }
    });
});

app.get('/blogs/:id/edit', function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
            res.redirect('/blogs');
        } else {
            res.render('edit', {
                blog: foundBlog
            });
        }
    });
});
//Blog.findByIdAndUpdate takes 3 arguments: the id, the data(whatever we called it
//inside of our form('blog')) and a callback.
app.put('/blogs/:id', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.log(err);
            res.redirect('/blogs');
        } else {
            console.log(updatedBlog);
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

app.delete('/blogs/:id', function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err){
            console.log(err);
            res.redirect('/blogs');
        } else {
            res.redirect('/blogs');
        }

    });
});

app.listen(8080, function(){
    console.log('Listenting on 8080');
});
