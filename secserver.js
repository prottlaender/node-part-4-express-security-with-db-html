// secserver.js

// hTTP module
const http = require('http');
// express module
const express = require('express');
// hTTP header security module
const helmet = require('helmet');
// envy module to manage environment variables
const envy = require('envy');
// server side session and cookie module
const session = require('express-session');
// mongodb session storage module
const connectMdbSession = require('connect-mongodb-session');

// load user controller
const userController = require('./database/controllers/userC');

// set the environment variables
const env = envy()
const port = env.port
const mongodbpath = env.mongodbpath
const sessionsecret = env.sessionsecret
const sessioncookiename = env.sessioncookiename

// load StartMongoServer function from db configuration file
const StartMongoServer = require('./database/db');
// start MongoDB server
StartMongoServer();

// Create MongoDB session storage object
const MongoDBStore = connectMdbSession(session)

// create new session store in mongodb
const store = new MongoDBStore({
  uri: mongodbpath,
  collection: 'col_sessions'
});

// catch errors in case store creation fails
store.on('error', function(error) {
  console.log(`error store session in session store: ${error.message}`);
});

// Create the express app
const app = express();

// Set the ip-address of your trusted reverse proxy server (nginx)
// The proxy server should insert the ip address of the remote client
// through request header 'X-Forwarded-For' as
// 'X-Forwarded-For: some.client.ip.address'
// Insertion of the forward header is an option on most proxy software
app.set('trust proxy', '192.168.178.20')

// use secure HTTP headers using helmet
app.use(helmet())
// use express.static file folder in the root of the app
app.use(express.static('static'));
// use express.urlencoded to parse incomming requests with urlencoded payloads
app.use(express.urlencoded({ extended: true }));
// use session to create session and session cookie
app.use(session({
  secret: sessionsecret,
  name: sessioncookiename,
  store: store,
  resave: false,
  saveUninitialized: false,
  // set cookie to 1 week maxAge
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: true
  },

}));

// middleware to redirect authenticated users to their dashboard
const redirectDashboard = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/dashboard')

  } else {
    next()
  }
}

// middleware to redirect not authenticated users to login
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login')
  } else {
    next()
  }
}

// For each navigation link create get routes and send HTML to the Browser
app.get('/', (req, res) => {
  console.log(req.session);
  console.log(req.session.id);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Home Page</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="css/style.css">
    </head>
    <body>

    <div class="grid-container">

      <div class="header" id="responsivenav">
          <!-- (this) refers to the DOM element to which the onclick attribute belongs -->
          <a class="burgericon" onclick="myFunction(this)">
            <div class="burgerline" id="bar1"></div>
            <div class="burgerline" id="bar2"></div>
            <div class="burgerline" id="bar3"></div>
          </a>
          <a class="link" href="/">Home</a>
          <a class="link" href="/login">Login</a>
          <a class="link" href="/register">Register</a>
          <a class="link" href="/dashboard">Dashboard</a>
          <a class="link" href="/logout">Logout</a>
      </div>

      <div class="main">
          <h1>Welcome to my Home Page</h1>
          <p class="maintext">The content of my page goes here</p>
      </div>

      <div class="footer">
          <p class="footertext">Patrick Rottländer all rights reserved</p>
      </div>

    </div>

    <script>
    // the (burgerlines) parameter represent the DOM element that has been given to the function
    function myFunction(burgerlines) {
      burgerlines.classList.toggle('change');

      var reponsiveNavElement = document.getElementById('responsivenav');
        if (reponsiveNavElement.className === 'header') {
          reponsiveNavElement.classList.add('responsive')
        } else {
          reponsiveNavElement.className = 'header';
        }
      }
    </script>

  </body>
  </html>
    `)

});

app.get('/login', redirectDashboard, (req, res) => {
  console.log(req.session);
  console.log(req.session.id);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Home Page</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="css/style.css">
    </head>
    <body>

    <div class="grid-container">

      <div class="header" id="responsivenav">
          <!-- (this) refers to the DOM element to which the onclick attribute belongs -->
          <a class="burgericon" onclick="myFunction(this)">
            <div class="burgerline" id="bar1"></div>
            <div class="burgerline" id="bar2"></div>
            <div class="burgerline" id="bar3"></div>
          </a>
          <a class="link" href="/">Home</a>
          <a class="link" href="/login">Login</a>
          <a class="link" href="/register">Register</a>
          <a class="link" href="/dashboard">Dashboard</a>
          <a class="link" href="/logout">Logout</a>
      </div>

      <div class="main">
          <div class="form">
            <form id='login_form' method='post' action='/login'>
                <label for='email'>Email *
                   <input class="input" type='email' name='email' size='30'>
                </label>
                <label for='password'>Passwort *
                   <input class="input" type='password' name='password' size='30'>
                </label>

                <label for='send'>
                   <input class='sendbutton' type='submit' name='send' value='Send'>
                </label>
              </form>
          </div>
      </div>

      <div class="footer">
          <p class="footertext">Patrick Rottländer all rights reserved</p>
      </div>

    </div>

    <script>
    // the (burgerlines) parameter represent the DOM element that has been given to the function
    function myFunction(burgerlines) {
      burgerlines.classList.toggle('change');

      var reponsiveNavElement = document.getElementById('responsivenav');
        if (reponsiveNavElement.className === 'header') {
          reponsiveNavElement.classList.add('responsive')
        } else {
          reponsiveNavElement.className = 'header';
        }
      }
    </script>

    </body>
    </html>
    `)

});

app.get('/register', redirectDashboard, (req, res) => {
  console.log(req.session);
  console.log(req.session.id);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Home Page</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="css/style.css">
    </head>
    <body>

    <div class="grid-container">

      <div class="header" id="responsivenav">
          <!-- (this) refers to the DOM element to which the onclick attribute belongs -->
          <a class="burgericon" onclick="myFunction(this)">
            <div class="burgerline" id="bar1"></div>
            <div class="burgerline" id="bar2"></div>
            <div class="burgerline" id="bar3"></div>
          </a>
          <a class="link" href="/">Home</a>
          <a class="link" href="/login">Login</a>
          <a class="link" href="/register">Register</a>
          <a class="link" href="/dashboard">Dashboard</a>
          <a class="link" href="/logout">Logout</a>
      </div>

      <div class="main">
          <div class="form">
            <form id='register_form' method='post' action='/register'>
              <label for='name'>Name *
                 <input class='input' type='text' name='name' size='30'>
              </label>
              <label for='lastname'>Lastname *
                 <input class='input' type='text' name='lastname' size='30'>
              </label>
              <label for='email'>Email *
                 <input class='input' type='email' name='email' size='30'>
              </label>
              <label for='password'>Passwort *
                 <input class='input' type='password' name='password' size='30'>
              </label>
              <label for='role'>Role *
                 <input class='input' type='text' name='role' size='30'>
              </label>

              <label for='send'>
                 <input class='sendbutton' type='submit' name='send' value='Send'>
              </label>
            </form>
          </div>
      </div>

      <div class="footer">
          <p class="footertext">Patrick Rottländer all rights reserved</p>
      </div>

    </div>

    <script>
    // the (burgerlines) parameter represent the DOM element that has been given to the function
    function myFunction(burgerlines) {
      burgerlines.classList.toggle('change');

      var reponsiveNavElement = document.getElementById('responsivenav');
        if (reponsiveNavElement.className === 'header') {
          reponsiveNavElement.classList.add('responsive')
        } else {
          reponsiveNavElement.className = 'header';
        }
      }
    </script>

    </body>
    </html>
    `)
});

app.get('/dashboard', redirectLogin, (req, res) => {
  console.log(req.session);
  console.log(req.session.id);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Home Page</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="css/style.css">
    </head>
    <body>

    <div class="grid-container">

      <div class="header" id="responsivenav">
          <!-- (this) refers to the DOM element to which the onclick attribute belongs -->
          <a class="burgericon" onclick="myFunction(this)">
            <div class="burgerline" id="bar1"></div>
            <div class="burgerline" id="bar2"></div>
            <div class="burgerline" id="bar3"></div>
          </a>
          <a class="link" href="/">Home</a>
          <a class="link" href="/login">Login</a>
          <a class="link" href="/register">Register</a>
          <a class="link" href="/dashboard">Dashboard</a>
          <a class="link" href="/logout">Logout</a>
      </div>

      <div class="main">
        <h1>Welcome to your Dashboard</h1>
          <p class="maintext">Your Name is ${req.session.userData.name} ${req.session.userData.lastname}</p>
          <p class="maintext">Your role is ${req.session.userData.role}</p>
      </div>

      <div class="footer">
          <p class="footertext">Patrick Rottländer all rights reserved</p>
      </div>

    </div>

    <script>
    // the (burgerlines) parameter represent the DOM element that has been given to the function
    function myFunction(burgerlines) {
      burgerlines.classList.toggle('change');

      var reponsiveNavElement = document.getElementById('responsivenav');
        if (reponsiveNavElement.className === 'header') {
          reponsiveNavElement.classList.add('responsive')
        } else {
          reponsiveNavElement.className = 'header';
        }
      }
    </script>

    </body>
    </html>
    `)

});

app.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy(function(err) {
    if (err) {
      res.send('An err occured: ' +err.message);
    } else {
      res.clearCookie('express_session').redirect('/')
    }
  });

})

// Post routes to manage user login and user registration
app.post('/login', userController.loginUser);

app.post('/register', userController.createUser);

// Browsers will by default try to request /favicon.ico from the
// root of a hostname, in order to show an icon in the browser tab.
// To avoid that requests returning a 404 (Not Found)
// The favicon.ico request will be catched and send a 204 No Content status
app.get('/favicon.ico', function(req, res) {
    console.log(req.url);
    res.status(204).json({status: 'no favicon'});
});

// create server
const server = http.createServer(app)

// connect server to port
server.listen(port)

console.log(`express secure server start successful on port ${port}`)
