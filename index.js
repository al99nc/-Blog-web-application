import express from "express";
import bodyParser from "body-parser";
import session from 'express-session'
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}))

let posts = [];

function id_gen() {
    return uuidv4();
}

app.get("/", (req, res) => {
    res.render("homePage.ejs", {
        posts,
        id: id_gen()
    });
});


app.get("/submit-cp", (req, res) => {
    res.render("creatPost.ejs", {
        id: id_gen()
    });
});

app.get("/submit-id", (req, res) => {
    res.render("id-search.ejs", {
        id: id_gen(),
        savedDataT: null,
        savedDataB: null,
        searchId: null
    });
});

// Middleware to attach request body to request object
app.use((req, res, next) => {
  req.globalBody = req.body; // Attach request body to req.globalBody
  next();
});

app.post("/submit-id", (req, res) => {
    const searchId = posts.find(post => post.id === parseInt(req.body['search_id'], 10));
    req.session.searchData = searchId;
    res.render("id-search.ejs", {
        searchId: searchId || null,
        savedDataT: searchId ? searchId.Title : null,
        savedDataB: searchId ? searchId.body_post : null,
        id: id_gen()
    });
});


app.post("/submit-id-update", (req, res) => {
    const savedData = req.session.searchData;
    if (!savedData) {
        return res.redirect("/");
    }
    
    // Find and update the existing post
    const postToUpdate = posts.find(post => post.id === savedData.id);
    if (postToUpdate) {
        postToUpdate.Title = req.body['Title'];
        postToUpdate.body_post = req.body['body_post'];
        console.log('Updated post:', postToUpdate);
    }
    
    res.redirect("/");
});


app.post("/submit-id-delete", (req, res) => {
    const deleteData = req.session.searchData;
        if (!deleteData) {
        return res.redirect("/");
    }
    const postToDelete = posts.find(post => post.id === deleteData.id);
    if (postToDelete) {
        const delObj = posts[postToDelete];
        posts.splice(delObj, 1);
    };
    res.redirect("/")
});


app.post("/submit-cp", (req, res) => {
    const post = {
        Title: req.body['Title'],
        body_post: req.body['body_post'],
        id: id_gen()
    };
    
    posts.push(post);
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
