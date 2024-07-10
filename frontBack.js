//The front and back end are both here in one
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const { DAL } = require('./DAL');
const port = 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ //used for keeping a session with expressSession
    secret: 'GurrenLagannIsTheBestAnimeEver', //its true
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Front-end routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/api/stats", (req, res) => {
    res.render("apiStats");
});


app.post('/register', async (req, res) => { //retrieves the data from the register page, salts and hashes the password, and calls the DAL to create user
    const { username, password, email, age, question1, question2, question3 } = req.body;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const data = {
        username,
        password: hash,
        email,
        age,
        question1,
        question2,
        question3
    };
    await DAL.registerPerson(data);
    res.redirect('/home');
});

app.post('/login', async (req, res) => { //Logs the user in by calling the DAL and comparing the password with bcrypt and setting the profile info if correct
    const { username, password } = req.body;
    console.log(password);
    const user = await DAL.getUser(username);
    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return;
            }
        
            if (result) {
                req.session.loggedIn = true;
                req.session.username = username;
                req.session.email = user.email;
                req.session.age = user.age;
                req.session.question1 = user.question1;
                req.session.question2 = user.question2;
                req.session.question3 = user.question3;
                console.log('Passwords match! User authenticated.');
                res.redirect('/');
            } else {
                console.log('Passwords do not match! Authentication failed.');
                res.redirect('/login');
            }
        });
    } else {
        console.log('User not found! Authentication failed.');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => { //destroys the session allowing logout
    req.session.destroy();
    res.redirect('/');
});

app.get("/profile/:userId", async (req, res) => { //allows a user to search for other user profiles by adding their userID to the link
    const userId = req.params.userId;
    try {
        const user = await DAL.getUser(userId);
        if (user) {
            res.render('profile', { user: user, session: req.session });
        } else {
            res.redirect('/');
        }   
    } catch (error) {
        console.log("Error:", error);
        res.redirect('/');
    }
});

app.post('/changeAnswers', async (req, res) => { //grabs al the information on a user's page and updates it to the new or same values
    const { username, password, email, age, question1, question2, question3 } = req.body;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const data = {
        username,
        password: hash,
        email,
        age,
        question1,
        question2,
        question3
    };
    await DAL.updateUser(data, req.session.username);
    req.session.destroy();
    res.redirect('/login');
})

// Start the server
app.listen(port, () => {
    console.log(`Express is running on port ${port}`);
});
