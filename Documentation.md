# Documentation of NIC Drone Monitoring Nodejs Backend Server
The whole project consists of two different parts one as frontend which is written in ***HTMl-ejs,CSS,JavaScript*** and second as backend which is written in ***Nodejs*** 

Backend uses different packages to make the project running. 
 
Top level file structure is shown below:

 ```
 .
├── node_modules
├── package.json
├── package-lock.json
├── public
├── server
└── README.md
 ```
node_modules - It consists of packages required by the program.

package.json - It consists of :
    
    1. name of project (name) : nicwebpage
    2. version of project (version) : 1.0.0
    3. description of project (description) : A project which is for monitoring the drone.
    4. name of main file (main)  : server/server.js 
    5. scripts to run (scripts) : 
       1. start : node server/server.js
       2. devstart : nodemon start
       3. test : -
    6. version of nodejs used (engines) : node@9.6.1
    7. author name (author) : Sushil
    8. license used (license) : ISC
    9. Dependencies used (dependencies) :
       1.  body-parser@^1.18.2
       2.  connect-mongo@^2.0.3
       3.  cookie-parser@^1.4.3
       4.  ejs@^2.6.1
       5.  express@^4.16.3
       6.  express-session@^1.15.6
       7.  lodash@^4.17.10
       8.  mathjs@^4.1.2
       9.  mongodb@^3.1.0-beta4
       10. mongoose@^5.1.0
       11. passport@^0.4.0
       12. passport-local@^1.0.0
       13. passport-local-mongoose@^5.0.1
       14. socket.io@^2.0.4
    10. Dependencies used for development (devDependencies) :
        1.  nodemon - for autorefresh when changing the code

package-lock.json : It consists of detail information of package.json file.

public - It is a folder consisting of all the frontend files and data's obtained from the drones.

server - It is a folder consisting of all the backend files and folders.

Readme.md - Simple way to start the program.

## More detail on ***server(backend)***
```
.
└── server
    ├── app
    │   └── app.js
    ├── auth
    │   └── authenticate.js
    ├── config
    │   └── config.js
    ├── db
    │   └── mongoose.js
    ├── email
    │   └── email.js
    ├── models
    │   ├── client.js
    │   ├── droneData.js
    │   ├── drone.js
    │   └── user.js
    ├── socketio
    │   ├── defaultSocket.js
    │   ├── JT601Socket.js
    │   ├── JT602Socket.js
    │   ├── JT603Socket.js
    │   ├── JT604Socket.js
    │   ├── socketFunctions.js
    │   └── socketInit.js
    └── server.js
```
As shown in above the server subdirectory can be viewed.

1. app - app directory consists of a file ***app.js*** which handles all the incoming get and post request from the client side.
2. auth - auth directory consists of a file ***authenticate.js*** which handles the authentication of the users while login or refresh of page.
3. conifg - conifg directory consists of a file ***config.js*** which assign the variable required in development and test environment.
4. db - db directory consists of a file ***mongoose.js*** which handles the connection between server and the mongo database.
5. models - models directory consists of different files like ***client.js,droneData.js,drone.js,user.js*** which consists of different schema required by the system to store data in database
6. socketio - socketio directory consists of different files which handles the socket request made by the client side.
7. server.js - it is a file which is executed when the server is made live. 

### More detail on ***app directory app.js file***.
    
1. requires different packages their name and package works
   1. express : It manages the request to the website.

         ```javascript
         const express = require('express');
         ```         
   2. lodash : 

         ```javascript
         const _ = require('lodash');
         ```
         
   3. cookie-parser : For parsing the cookie present in the request

         ```javascript
         const cookieParser = require('cookie-parser');
         ```
         
   4. express-session : For handling the session based requests

         ```javascript
         const session = require('express-session');
         ```
         
   5. mongoose : For handling the connection between mongodb database and nodejs server

         ```javascript
         const mongoose = require('mongoose');
         ```
         
   6. passport : For handling the authentication and hashing of password

         ```javascript
         const passport = require('passport');
         ```
         
   7. connect-mongo : For storing the session data of user in the mongodb database

         ```javascript
         const mongoStore = require('connect-mongo')(session);
         ```
         
   8.  fs : For handling the filesystem works.

         ```javascript
         const fs = require('fs');
         ```

   9.  req-flash : For transferring the message between different requests.

         ```javascript
         const flash = require('req-flash');
         ```

   10. http : For creating the http server 

         ```javascript
         const http = require('http');
         ```
         
   11. path : For creating the string for the perfect path.

         ```javascript
         const path = require('path');
         ```

   12. body-parser : For easy parsing the variables present in the body of the request

         ```javascript
         const bodyparser = require('body-parser');
         ```

2. require done from different self created javascript files.
   1. authenticate - Contains functions required for authentication validation

       ```javascript
      const authenticate = require('../auth/authenticate');
      ```

   2. email : It is imported from a file which initializes the package that send email to the user.

      ```javascript
      const email = require('../email/email');
      ```    

   3. User - required from '../models/user' - contains the model of user.

      ```javascript
      let User = require('../models/user');
      ```
      
   4. DroneName - required from '../models/drone' - contains the model of drone names.

      ```javascript
      let DroneName = require('../models/drone');
      ```

   5. Client - required from '../models/client' - contains the model of available users.

      ```javascript
      let Client = require('../models/client');
      ```
      
3. Variables 
   1. publicPath - path towards the public directory.

      ```javascript
      const publicPath = path.join(__dirname, '../..', '/public');
      ```

   2. views - path towards the views directory present in public directory

      ```javascript
      const views = path.join(__dirname, '../..', '/public/views');
      ```

4. To setup an express app

   ```javascript
   const express = require('express');
   const app = express();
   ```

- To let the server know about the static files present in public directory we do:

   ```javascript
   app.use(express.static(publicPath);
   ```

- To let the server know about the files which can be used for viewing in the frontend or webbased page we do:
  
   ```javascript
   app.set('views',views);
   ```

- To let the server know which file type is used for page to be displayed like HTML, pug, ejs etc

   ```javascript
   app.set('view engine','ejs');
   ```

- To parse the json object and urlencoded for post request send by the client we use bodyparser module json as:

   ```javascript
   app.use(bodyparser.json());
   app.use(bodyparser.urlencoded({
      extended: true
   }));
   ```

- To use session as a authentication based and specifying its details we do:

   ```javascript
   app.use(session({
      name: 'session-id',
      secret: process.env.secret,
      cookie: {
         maxAge: new Date(Date.now() + 86400000)
      },
      saveUninitialized: false,
      resave: false,
      store: new mongoStore({
        url: process.env.MONGODB_URI,
        autoRemove: 'native'
      })
   }));
   ```

- To use flash for transferring messages between requests we do:

   ```javascript
   app.use(flash());
   ```

- To use passport for user based authentication and also session we do:

   ```javascript
   app.use(passport.initialize());
   app.use(passport.session());
   ```

- To create a http server and assiged it to use express for handling the request:

   ```javascript
   const server = http.createServer(app);
   ```

- To check weather the user is actually authenticated we use function defined below and the function is used as middleware in the express:
   
   ```javascript
   function auth(req, res, next) {
      if (!req.user) {
         let err = new Error('You are not authenticated!');
         err.status = 403;
         return res.redirect('/');
      } else {
         next();
      }
   }

   app.use(auth);
   ```

- routes
  - / 
    - get - If a get request is performed by the user a login page is send by rendering the 'index' file with title and drones name got from quering in the database with model name DroneName and also with the error message transferred from different request.

      ```javascript
      app.get('/', (req, res) => {
         DroneName.find({}).select('-_id -__v').sort({drone_name:'asc'}).exec()
            .then((drones) => {
                  let allAdd = {"drone_name":"all","drone_location":"all"};
                  drones[drones.length] = allAdd;
                  res.status(200).render('index', {
                     title: 'Drone | login',
                     drones: drones,
                     error:req.flash('errorMessageIndex')
                  });
            })
            .catch((err) => {
                  console.log(err);
            });
      });
      ```
     -  post - post request is performed by the user when he/she wants to login to the page with the credentials. Authentication of the user is done in the route by using passport module. If any type of err or user not found then the page is redirected to the / page with the error message. It also checks weather the user is valid or not in which the valid user can only view the page. The validity of user is done by the admin user through cpanel and accoring to the email received in email address : nicnepal.github@gmail.com from nicnepal.udacity@gmail.com 

         ```javascript
         app.post('/', (req, res, next) => {
            let body = _.pick(req.body, ['location']);
            passport.authenticate('local', function (err, user, info) {
               console.log('Inside post request of /');
               if (err) {
                     req.flash('errorMessageIndex','Sorry, User cannot be authenticated');
                     res.statusCode = 401;
                     return res.redirect('/');
               }
               if (!user) {
                     req.flash('errorMessageIndex','Sorry, User cannot be found');
                     res.statusCode = 401;
                     return res.redirect('/');
               }
               if (!user.is_valid) {
                     req.flash('errorMessageIndex','Sorry, User is not valid please contact the administrator');
                     res.statusCode = 401;
                     return res.redirect('/');
               }
               user.location = body.location;
               user.save().catch((err) => console.log('cannot save user'));

               req.logIn(user, function (err) {
                     if (err) {
                        console.log('Inside post request of / with login error');
                        req.flash('errorMessageIndex','Sorry, User cannot be authenticated');
                        res.statusCode = 401;
                        return res.redirect('/');
                     }
                     res.statusCode = 200;
                     console.log('Inside post request of / with login succesfull');
                     // res.cookie('user-id',user.username);
                     return res.redirect('/' + body.location);
               });
            })(req, res, next);
         });
         ```
   - /create_user
     - get - renders the 'signupPage' with title and errors.

         ```javascript
         app.get('/create_user', (req, res) => {
            res.status(200).render('signupPage', {
               title: 'Signup Page',
               error: ''
            });
         });
         ```
   
   - /signup
     - post - handles the signup of the user by verifying the different datas send by the user and save it to the database. It also sends email to the admin email address who can validate the user trying to create login account.

         ```javascript
         app.post('/signup', (req, res) => {
            if (req.body.password === req.body.password1) {
               var mailOptions = {
                     from: 'nicnepal.udacity@gmail.com',
                     to: 'nicnepal.github@gmail.com',
                     subject: 'User verification',
                     text: `user with name ${req.body.fullname} and email address ${req.body.email} want to create account for drone monitoring system`
               };
               User.register(new User({ username: req.body.username ,email: req.body.email, full_name: req.body.fullname}),
                     req.body.password, (err, user) => {
                        if (err) {
                           req.flash('errorMessageSignUp','Sorry, User cannot be created');
                           res.redirect('/create_user');
                        } else {
                           if (req.body.location) {
                                 user.location = req.body.location;
                           }
                           email.sendMail(mailOptions)
                                 .then((info) => {
                                    console.log('Email sent: ' + info.response);
                                 })
                                 .catch((error) => {
                                    return console.log(error);
                                 });

                           user.save((err, user) => {
                                 if (err) {
                                    req.flash('errorMessageSignUp','Sorry, User cannot be created');
                                    res.redirect('/create_user');
                                 }
                                 passport.authenticate('local')
                                    (req, res, () => {
                                       res.statusCode = 200;
                                       req.flash('errorMessageSignUp','User was succesfully created');
                                       res.redirect('/create_user');
                                    });
                           });
                        }
                     });
            } else {
               req.flash('errorMessageSignUp','Password Doesnot match');
               res.redirect('/create_user');
            }
         });
         ```
   - /android
     - post - handles the login in from an android app

         ```javascript
         app.post('/android', passport.authenticate('local'), (req, res) => {
            let body = _.pick(req.body, ['username', 'password']);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.send('OK');
         });
         ```
   - /all
     - get - It handles the get request to view the multiple drone location and avalibility.

         ```javascript
         app.get('/all', (req, res) => {
            User.findById(req.session.passport.user, (err, user) => {
               if (err) {
                  res.statusCode = 401;
                  req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                  return res.redirect('/');
               }
               var urlString = '/' + user.location;
               if (urlString != req.url) {
                  res.statusCode = 401;
                  req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                  return res.redirect('/');
               }
               res.render('statusall');
            });
         });
         ```

   - /default
     - get - It handles the get request to view the status of default drone

         ```javascript
         app.get('/default', (req, res) => {
            User.findById(req.session.passport.user, (err, user) => {
               if (err) {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                     return res.redirect('/');
               }
               var urlString = '/' + user.location;
               if (urlString != req.url) {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                     return res.redirect('/');
               }
               res.render('status', { href: "../datadefault.txt" });
            });
         });
         ```

   - /:droneName
     - get - It handles the get request to view the status of drones. It also decides weather the user is admin user or not and helps to add the cpanel button in the requeted pages.

         ```javascript
         app.get('/:droneName', (req, res) => {
            User.findById(req.session.passport.user).exec()
               .then((user) => {
                     if (user.location === req.params.droneName) {
                        DroneName.findOne({ drone_name: req.params.droneName }).select('drone_name drone_location -_id').exec()
                           .then((drone) => {
                                 if (user.is_admin === true) {
                                    return res.render('status',{ href: "/" + drone.drone_name + "/data",add_button:true});
                                 }
                                 return res.render('status', { href: "/" + drone.drone_name + "/data" ,add_button:false});
                           })
                           .catch((err) => {
                                 res.statusCode = 401;
                                 req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                                 return res.redirect('/');
                           });
                     } else {
                        res.statusCode = 401;
                        req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                        return res.redirect('/');
                     }
               })
               .catch((err) => {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                     return res.redirect('/');
               });
         });
         ```
         

   - /:droneName/data
     - get - It hadles the get request for providing the link of data(flight log) that can be downloaded.

         ```javascript
         app.get('/:droneName/data', (req, res) => {
            User.findById(req.session.passport.user, (err, user) => {
               let href = [];
               let status = [];
               let i = 0;
               if (err) {
                     console.log('error in finding user');
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                     return res.redirect('/');
               }
               let urlString = '/' + user.location + '/data';
               if (urlString != req.url) {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                     return res.redirect('/');
               }
               let droneDataPath = path.join(__dirname, '../..', '/public/data/' + user.location + '/');
               let files = fs.readdirSync(droneDataPath);
               files = files.splice(1);
               files.forEach(file => {
                     let data = {
                        fileName: '../data/' + user.location + '/' + file,
                        fileTime: fs.statSync(path.join(droneDataPath, file)).birthtime.toUTCString()
                     };
                     href.push(data);
               });
               res.render('file', {
                     title: "data of " + user.location,
                     data: href
               });
            });
         });
         ```

   Cpanel Pages
   - /cpanel
     - get - It renders the cpanel/cpanelmain page availabe in public directory by verifying that the user is admin user or not.

         ```javascript
         app.get('/cpanel',(req,res) => {
            User.findById(req.session.passport.user).exec()
               .then((user) => {
                     if (user.is_admin === true) {
                        User.find({}).select('-_id -noOfUsers -__v').sort({_id:'desc'}).exec()
                           .then((user) => {
                                 res.render('cpanel/cpanelmain',{
                                    title:"Cpanel",
                                    users: user,
                                    companyName: "NIC"
                                 });
                           })
                           .catch((err) => {
                                 return console.log(err);
                           });
                     } else {
                        res.statusCode = 401;
                        req.flash('errorMessageIndex','Sorry, You are not authorized');
                        return res.redirect('/');
                     }
               })
               .catch((err) => {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authorized');
                     return res.redirect('/');
               });
         });
         ```

   - /cpanel/update
     - post - It helps to change the status of the user like if the user is valid user or not, also the user is admin user or not.

         ```javascript
         app.post('/cpanel/update',(req,res) => {
            User.findById(req.session.passport.user).exec()
               .then((user) => {
                     if (user.is_admin === true) {
                        User.findOne({username:req.body.username,full_name: req.body.full_name,email:req.body.email}).exec()
                           .then((user) => {
                                 user.is_valid = req.body.is_valid;
                                 user.is_admin = req.body.is_admin;
                                 user.save()
                                    .then((success) => {
                                       res.statusCode = 200;
                                       res.json("successfully update");
                                    })
                                    .catch((err) => {
                                       res.json("Cannot save user");
                                    });
                           })
                           .catch((err) => {
                                 res.json("Cannot find user");
                           });
                     } else {
                        res.statusCode = 401;
                        req.flash('errorMessageIndex','Sorry, You are not authorized');
                        return res.redirect('/');
                     }
               })
               .catch((err) => {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authorized');
                     return res.redirect('/');
               });
         });
         ```

   - /cpanel/planes
     - get - It renders the cpanel/cpanelplanes page availabe in public directory by verifying that the user is admin user or not. Which displayes the available planes and also a input area from where the new plane can be added.

         ```javascript
         app.get('/cpanel/planes',(req,res) => {
            User.findById(req.session.passport.user).exec()
               .then((user) => {
                     if (user.is_admin === true) {
                        DroneName.find({}).select('drone_name drone_location -_id').sort({drone_name:'asc'}).exec()
                           .then((drone) => {
                                 res.render('cpanel/cpanelplanes',{
                                    title:"Cpanel",
                                    planes: drone,
                                    companyName: "NIC"
                                 });
                           })
                           .catch((err) => {
                                 console.log(err);
                           });
                     } else {
                        res.statusCode = 401;
                        req.flash('errorMessageIndex','Sorry, You are not authorized');
                        return res.redirect('/');
                     }
               })
               .catch((err) => {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authorized');
                     return res.redirect('/');
               });
         });
         ```

   - /cpanel/planes/update
     - post - This request helps to add new plane by the input from the /cpanel/planes input area. It performs different tasks in a sequence.Like Read a file from a socket directory and creates a new file with the name of the plane.Then creates directory in the public folder to store the log data of the plane. Addes the different database schema in the droneData model.

         ```javascript
         app.post('/cpanel/planes/update',(req,res) => {
            User.findById(req.session.passport.user).exec()
               .then((user) => {
                     if (user.is_admin === true) {
                        let addDrone = new DroneName({drone_name: req.body.planeName,drone_location: req.body.planeLocation});
                        addDrone.save()
                           .then((success) => {
                                 res.statusCode = 200;
                                 
                                 // create socket file by reading the socket file
                                 let writeFilePath = path.join(__dirname,`../socketio/${req.body.planeName}Socket.js`);
                                 let readFilePath = path.join(__dirname,'../socketio/JT601Socket.js');
                                 fs.readFile(readFilePath, 'utf8', function (err,data) {
                                    if (err) {
                                    return console.log(err);
                                    }
                                    var result = data;
                                    for (let i= 0; i<5; i++) {
                                       result = result.replace('JT601', req.body.planeName);
                                    }
                                    fs.writeFile(writeFilePath, result, 'utf8', function (err) {
                                    if (err) return console.log(err);
                                    });
                                 });
                                 //
                                 // to make directory to store files
                                 let dataFileDirectory = path.join(__dirname,'../..',`public/data/${req.body.planeName}`);
                                 fs.mkdir(dataFileDirectory,(err) => {
                                    if (err) {
                                       return console.log(err);
                                    }
                                    fs.closeSync(fs.openSync(path.join(dataFileDirectory,'/.gitkeep'), 'w'));
                                 });
                                 //
                                 // to create a database schema
                                 let databaseFilePath = path.join(__dirname,'../models/droneData.js');
                                 fs.appendFile(databaseFilePath, `\nconst ${req.body.planeName}DroneData = mongoose.model("${req.body.planeName}DroneData",DroneSchema);\nconst ${req.body.planeName}Count = mongoose.model("${req.body.planeName}Count",DroneCountSchema);\n\nmodule.exports.${req.body.planeName}DroneData = ${req.body.planeName}DroneData;\nmodule.exports.${req.body.planeName}Count = ${req.body.planeName}Count;\n`, (err) => {  
                                    if (err) {
                                       return console.log(err);
                                    };
                                 });

                                 res.json("successfully update");
                           })
                           .catch((err) => {
                                 console.log(err)
                           });
                     } else {
                        res.statusCode = 401;
                        req.flash('errorMessageIndex','Sorry, You are not authorized');
                        return res.redirect('/');
                     }
               })
               .catch((err) => {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authorized');
                     return res.redirect('/');
               });
         });
         ```

   - /cpanel/users
     - get - It renders the cpanel/cpanelusers page availabe in public directory by verifying that the user is admin user or not. Which displayes the available users.

         ```javascript
         app.get('/cpanel/users',(req,res) => {
            User.findById(req.session.passport.user).exec()
               .then((user) => {
                     if (user.is_admin === true) {
                        Client.find({}).select('-__v -_id').sort({_id:'desc'}).exec()
                           .then((users) => {
                                 res.render('cpanel/cpanelusers',{
                                    title:"Cpanel",
                                    users: users,
                                    companyName: "NIC"
                                 });
                           })
                           .catch((err) => {
                                 console.log(err);
                           });
                     } else {
                        res.statusCode = 401;
                        req.flash('errorMessageIndex','Sorry, You are not authorized');
                        return res.redirect('/');
                     }
               })
               .catch((err) => {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authorized');
                     return res.redirect('/');
               });
         });
         ```

   - /logout
     - get - It helps to logout the user by deleting the session data from the database.

         ```javascript
         app.get('/logout', function(req, res, next) {
            User.findById(req.session.passport.user, (err, user) => {
               if (err) {
                     res.statusCode = 401;
                     req.flash('errorMessageIndex','Sorry, You are not authenitcated');
                     return res.redirect('/');
               }
               if (req.session) {
                     // delete session object
                     req.session.destroy((err)  => {
                        if(err) {
                           req.flash('errorMessageIndex','Sorry, Cannot logout');
                           return res.redirect('/');
                        }
                        return res.redirect('/');
                     });
               }
            });
         });
         ```

- export the server object so can be acquired by different files.

   ```javascript
   module.exports = server;
   ```

### More detail on ***auth directory authenticate.js file***.

It contains the file which handles the main authentication, serialization and deserialization of data in the headers.

1. It requires the passport package which handles the hashing and unhasing of password of the user and also handles the user authentication.

   ```javascript
   const passport = require('passport');
   ```

2. It requires passport-local package which handles the authentication strategy for the user authentication.

   ```javascript
   const LocalStrategy = require('passport-local').Strategy;
   ```

3. It requires the user model for storing the user data and retriving and validating of the user data.

   ```javascript
   const User = require('../models/user');
   ```

4. It exports the authentication strategy from the user model.

   ```javascript
   exports.local = passport.use(new LocalStrategy(User.authenticate()));
   ```

5. serializer for the user data.

   ```javascript
   passport.serializeUser((user,done) => {
      done(null,user.id);
   });
   ```

6. deserializer for the user data.

   ```javascript
   passport.deserializeUser((id,done)=>{
      User.findById(id, (err,user) => {
         done(err,user);
      });
   });
   ```

### More detail on ***config directory config.js file***.

This file for assigning the different environment variables for the project according the node environment.

Node environment
   1. production
   2. development
   3. test

   ```javascript
   process.env.NODE_ENV = 'production';
   ```
   
1. PORT - define the number in which the project will be live
   
   ```javascript
   process.env.PORT = 3000;
   ```

2. MONGODB_URI - define the monogodb url for the connection with the database
   
   ```javascript
   process.env.MONGODB_URI = 'mongodb://localhost:27017/databasename';
   ```

3. secret - define the secret value for hashing the password.
   
   ```javascript
   process.env.secret = '12345-67890-09876-54321';
   ```

Above four value should be added to the bash file(~/.bashrc) of linux system for the production environment so the project runs according to the system.

```bash
$ sudo nano ~/.bashrc

export NODE_ENV="production"
export PORT="3000"
export MONGODB_URI="mongodb://127.0.0.1:27017/databasename"
export secret="12345-67890-09876-54321"
```
write and save the above command in the ~/.bashrc and run the command 
```bash
$ source ~/.bashrc
```

### More detail on ***db directory mongoose.js file***.

In this file the connection between mongodb database and nodejs is done

1. We require mongoose package which make the connection work easy
   
   ```javascript
   const mongoose = require('mongoose');
   ```

2. We intend of using promise in the query of mongoose so we do:

   ```javascript
   mongoose.Promise = global.Promise;
   ```

3. We then require the environment variable required for the connection with mongodb i.e MONGODB_URI

   ```javascript
   const connectPath = process.env.MONGODB_URI;
   ```

4. If the any options is required we added to options variable which is then used for connection.

   ```javascript
   const options = {};
   ```

5. Finally we connect with the database:

   ```javascript
   mongoose.connect(connectPath, options)
      .then(() => {
         console.log('successfully connected with the database ')
      },(e) => {
         console.log('authentication error in database');
      });
   ```

6. Then we export the module of mongoose.

   ```javascript
   module.exports = mongoose;
   ```

### More detail on ***email directory email.js file***.

This file helps to send the email to the desired user through email address nicnepal.udacity@gmail.com

1. We require the mail sender package.

   ```javascript
   var nodemailer = require('nodemailer');
   ```
2. Then we acquire the email and email password from the environment variables.

   ```javascript
   var user =  process.env.EmailSender
   var userpassword = process.env.EmailSenderPassword
   ```

3. Then we define a transporter which sends the email.

   ```javascript
   var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
         user: user,
         pass: userpassword
      }
   });
   ```
4. Then finally we export the module so the another javascirpt can access the function.

   ```javascript
   module.exports = transporter;
   ```

### More detail on ***models directory***.

This directory contains the database models. We explore models in more detail in below.

#### More detail on ***client.js file***.

This model is created with the intension of storing the connected users. It also sotres some request from the user and excutes tasks according the value of the fields.

1. First of all mongoose package is acquired which helps in creating the schema of the model.
   
   ```javascript
   const mongoose = require('mongoose');
   ```

2. From mongoose package Schema is taken to create new schema as shown below:
   
   ```javascript
   const Schema = mongoose.Schema;

   let Client = new Schema({
      // stores the socket id of the users socket as a unique id to acquire data
      clientId: {
         type: String,
         required: true
      },
      // stores the name of users device of accessing data.
      deviceName: {
         type: String,
         required: true
      },
      // stores a boolean value which indicates the request of mission done by the user in which 'true' means 'a mission request is done' 
      missionRequest: {
         type: Boolean,
         default: false
      },
      // stores the namespace of the socket from which the user is connected or request the data.
      socketName:{
         type: String,
         required: true
      },
      // Defines the time to live parameter i.e the document is delete in one day after is creations.
      expireAt: {
         type: Date,
         default: Date.now,
         index: { expires: '1d' },
      },
   });
   ```

3. Finally the model of the schema is created and exported.

   ```javascript
   module.exports = mongoose.model('Client',Client);
   ```

#### More detail on ***drone.js file***.

This model is created with the intension of storing the name and location of the available drones. New drone name should be added to this document of mongodb database.

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DroneName = new Schema({
   // name of the drone which indicates the socket namespace to be created or should be avaliable to view the drone datas.
    drone_name:{
        type: String,
        required: true
    },
    // name of the place where is drone is currently in use
    drone_location: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('DroneName',DroneName
```

#### More detail on ***droneData.js file***.

This model is created with the intension of storing the data's send by the drone and store in the database and finally to a file. Every drone according to its name should have a model in this file and exported for further use. This file contains two schema  as follows:

1. One store's the all data's send by the drone to the database.

   ```javascript
   const DroneSchema = new mongoose.Schema({}, {
      strict: false
   });
   ```

2. Second store's the count of total files created which is equal to the total number of flight's performed.

   ```javascript
   const DroneCountSchema = new mongoose.Schema({
      count_value : {
      type: Number,
      required : true,
      default: 0
      }
   });
   ```

Every Drone should have the model of the above schema and should be exported. For example if the drone name is 'JT601' then its model and exports should be as below

   ```javascript
   // model of count and data
   const JT601DroneData = mongoose.model("JT601DroneData",DroneSchema);
   const JT601Count = mongoose.model("JT601Count",DroneCountSchema)
   // exports 
   module.exports.JT601DroneData = JT601DroneData;
   module.exports.JT601Count = JT601Count;
   ```

#### More detail on ***user.js file***.

This model helps to store the data of the registered user who are able to view the Remote monitoring system both android and website.It requires different packages like:

1. mongoose - which helps in creating the schema

   ```javascript
   const mongoose = require('mongoose');
   const Schema = mongoose.Schema;
   ```

2. passport-local-mongoose - which handles the hashing of password and username and stores in database.

   ```javascript
   // requiring of passport-local-mongoose
   const passportLocalMongoose = require('passport-local-mongoose');
   // handles the hashing of password and save both hashed password and user name in the document
   User.plugin(passportLocalMongoose);
   ```
It also creates the schema as below and finally export it's model.

   ```javascript
   let User = new Schema({
      // User fullname.
      full_name: {
        type: String,
        required: [true, "can't be blank"]
      },
      // User email address
      email: {
         type: String, 
         lowercase: true, 
         unique: true, 
         required: [true, "can't be blank"], 
         match: [/\S+@\S+\.\S+/, 'is invalid']
      },
      // field that defines weather the user is valid user or not.
      is_valid: {
         type: Boolean,
         default: false
      },
      // field that defines weather the user is admin user or not.
      is_admin: {
         type: Boolean,
         default: false
      },
      // field that defines which drone the user is viewing currently or at the previous day.
      location: {
         type: String,
         default: '',
      },
      noOfUsers: {
         type: Number,
         required: true,
         trim: true,
         minlength:1,
         default: 0
      }
   });

   module.exports = mongoose.model('User', User);
   ```


### More detail on ***socketio directory***.

It consists of all the socket functions related to every drone. Every drone (drone name as JT601) should have a file with its name as JT601Socket.js

#### More detail on ***socketInit.js file***.

It is the initilization of socket.io and creating a layer of socket in the server.

1. Require the socket.io package.

   ```javascript
   const socketIO = require('socket.io');
   ```

2. Require the server created at app.js file of app directory inside teh server directory.

   ```javascript
   const server = require('../app/app');
   ```

3. Create a socket with the pingInterval and pingTimeout value. Also export it.

   ```javascript
   let io = socketIO(server,{
      pingInterval: 10000,
      pingTimeout: 5000,
   });

   module.exports = io;
   ```

#### More detail on ***socketFunctions.js file***.

It contains all the socket functions which are required for all the socket device like drone, website and android device. It exports whole task as a module.

   ```javascript
   module.exports = (planeName,PlaneData,PlaneCount,DroneDatabaseName) => {
      //task
   }
   ```

It requires different packages and local module.

1. requires 'io' module from the 'socketInit.js' file.
   
   ```javascript
   const io = require('./socketInit');
   ```

2. requires mongoose module from the '../db/mongoose' 

   ```javascript
   let mongoose = require('../db/mongoose');
   ```

3. requires client module from the '../models/client' for handling online client and working as the one client datas.
   
   ```javascript
   let Client = require('../models/client');
   ```

4. requires fs package for handling filesystem.

   ```javascript
   const fs = require('fs');
   ```

5. requires path package for creating perfect path required.

   ```javascript
   const path = require('path');
   ```

6. Different local variables are created as.

   ```javascript
   let lat,
       lng,
       setTimeoutObject=[];

   // these variable are the variable which contains the path where the data of drone are stored and mission files are stored.
   const actualmissionfile = path.join(__dirname, '../..', `/public/js/files/missions/mission${planeName}.txt`),
         renamedmissionfile = path.join(__dirname, '../..', `/public/js/files/missions/oldmission${planeName}.txt`),
         datafile = path.join(__dirname, '../..', `/public/data/${planeName}/`);
   ```

7. Performs the check weather the database collections is created or not. If the collection is not created then its creates the collections

   ```javascript
   mongoose.connection.on('open',() => {
      let db_native = mongoose.connection.db;
      db_native.listCollections({name: `${planeName}Counts`.toLowerCase()}).toArray(function (err, names) {
         if (err) {
               return console.log(err);
         }
         if (names.length === 0) {
               let count = new PlaneCount({});
               count.save().catch((err) => {
                  return console.log(err);
               });
         }
      });
   });
   ```

##### More detail on socketfunction of  ***socketFunctions.js file***.

1. First of all a namespace is created with the provide planeName.

   ```javascript
   const plane = io.of(`/${planeName}`);
   ```

2. plane namespace listen for the 'connection' event if a request is made in the namespace then it is able to perform the task.
   
   ```javascript
   plane.on('connection', (socket) => {
      // tasks
   });
   ```

3. Different socket event's are created which performs different tasks.

   1. joinPi - It is only requested by drone at the first when the connection is established
      1. When a socket is created it save's the clientid, deviceName,soketName.
      2. Join's a room(pi)

      ```javascript
      socket.on('joinPi', () => {
         // clientId is socket's id
         // deviceName is pi
         // socketName is plane name
         let client = new Client({clientId: socket.id,deviceName: 'pi',socketName: planeName});
         client.save().catch((err) => console.log(`Cannot create user of pi joinPi socket ${planeName}`));
         // joins room i.e. pi
         socket.join('pi');
         console.log(`${socket.id} (Pi ${planeName}) connected`);
      });
      ```

   2. joinAndroid - It is only requested by android device at the first when the connection is established
      1. Same as joinPi only the room is 'android'

      ```javascript
      socket.on('joinAndroid', () => {
         // clientId is socket's id
         // deviceName is android
         // socketName is plane name
         let client = new Client({clientId: socket.id, deviceName: 'android',socketName: planeName});
         client.save().catch((err) => console.log(`Cannot create user of android joinAndroid socket ${planeName}`));
         // joins room i.e. android
         socket.join('android');
         console.log(`${socket.id} (Android ${planeName}) connected`);
      });
      ```

   3. joinWebsite - It is only requested by website at the first when the connection is established
      1. Same as joinPi only the room is website
      ```javascript
      socket.on('joinWebsite', () => {
         // clientId is socket's id
         // deviceName is website
         // socketName is plane name
         let client = new Client({clientId: socket.id, deviceName: 'website',socketName: planeName});
         client.save().catch((err) => console.log(`Cannot create user of website joinWebsite socket ${planeName}`));
         // joins room i.e. website
         socket.join('website');
         console.log(`${socket.id} (Website ${planeName}) connected`);
      });
      ```

   4. success - It listen to the request send by the drone and relays the message send by the drone to the android device in the event 'success'.

      ```javascript
      socket.on('success', (msg) => {
         plane.to('android').emit('success',msg);
      });
      ```

   5. data - 

      ```javascript
      socket.on('data', (data) => {
         let datas = {
               lat: data.lat || 0,
               lng: data.lng || 0,
               altr: data.altr || 0,
               alt: data.alt || 0,
               numSat: data.numSat || 0,
               hdop: data.hdop || 0,
               fix: data.fix || 0,
               head: data.head || 0,
               gs: data.gs || 0,
               as: data.as || 0,
               mode: data.mode || "UNKNOWN",
               arm: data.arm || "FALSE",
               ekf: data.ekf || "FALSE",
               status: data.status || "UNKNOWN",
               lidar: data.lidar || 0,
               volt: data.volt || 0,
               est: data.est || 0,
               conn: data.conn || "FALSE",
               roll: data.roll || 0,
               pitch: data.pitch || 0,
               yaw: data.yaw || 0
         };

         plane.to('android').to('website').emit('copter-data', datas);
         lat = data.lat;
         lng = data.lng;
         let DroneData = new PlaneData(datas);
         DroneData.save().catch((err) => console.log(`data cannot be saved to database in socket data of plane ${planeName}`));
      });
      ```

   6. homePosition - It listen to the event 'homePosition' send by the drone which contains the home location (i.e GPS location) of the drone and the server realys the location to the website on the event 'homePosition'.

      ```javascript
      socket.on('homePosition', (homeLocation) => {
         plane.to('website').emit('homePosition', homeLocation);
      });
      ```

   7. errors - It listen to the event 'errors' which is send by the drone when the error message is generated with two field 'context' and 'msg'. In which 'context' is the device name (i.e website or android) in which the message is to be send. And 'msg' the actual error message which is to be displayed. The whole error is relayed to the requierd device send by the drone in 'error.context' field. If the context field doesnot match to either android or website than the error message is send to both the device.

      ```javascript
      socket.on('errors', (error) => {
         // Checks the context field and relay's the error to required device.
         if (error.context === 'android'){
            plane.to('android').emit('error', error);
         } else if (error.context === 'website'){
            plane.to('website').emit('error', error);
         } else {
            plane.to('website').to('android').emit('error', error);
         }
      });
      ```

   8. waypoints - 

      ```javascript
      socket.on('waypoints', (waypoints) => {
         Client.find({missionRequest: true, socketName: planeName}).exec()
               .then((data) => {
                  for (let id in data) {
                     plane.to(`${data[id].clientId}`).emit('Mission',waypoints);
                     Client.update({clientId: data[id].clientId, socketName: planeName},{$set:{missionRequest: false}}).exec()
                           .catch((err) => {
                              console.log(`error while updating data in waypoints socket of plane ${planeName}`);
                           });
                  }
               })
               .catch((err) => console.log(`Cannot find user wayponints socket ${planeName}`));
         fs.writeFile(actualmissionfile, JSON.stringify(waypoints, undefined, 2), (err) => {
               if (err) {
                  return console.log(`File cannot be created in waypoints socket of plane ${planeName}`);
               }
         });
      });
      ```

   9. getMission -

      ```javascript
      socket.on('getMission', (data) => {
         //data = {mission:1,device:devicename}
         Client.updateOne({clientId: socket.id, socketName: planeName},{$set:{missionRequest: true}}).exec()
               .then((updated)=> {
                  fs.rename(actualmissionfile, renamedmissionfile, (err) => {
                     if (err) {
                           console.log(`No actual mission file present in plane ${planeName}`);
                     } else {
                           console.log(`rename of mission file done in plane ${planeName}`);
                     }
                  });
                  plane.to('pi').emit('mission_download', JSON.parse(data).mission);
               })
               .catch((err) => console.log(`Cannot update data in getMission socket of plane ${planeName}`));
      });
      ```
      
   10. RTL - It listen's to the event 'RTL' requested by the android device which is send with the intension of performing Return To Launch sequence in the drone. The sever listen to the event and relay the message to the drone in the same event 'RTL'. Due to which the drone performs the Return To Launch sequence.

         ```javascript
         socket.on('RTL', (rtl) => {
            plane.to('pi').emit('RTL', rtl);
         });
         ```

   11. LAND - It listen's to the event 'LAND' requested by the android device which is send with the intension of performing Land sequence in the drone. The sever listen to the event and relay the message to the drone in the same event 'LAND'. Due to which the drone performs the Land sequence.

         ```javascript
         socket.on('LAND', (land) => {
            plane.to('pi').emit('LAND', land);
         });
         ```

   12. fly - It listen's to the event 'fly' requested by the android device which is send with the intension of performing takeoff and execute the mission saved in the drone. The sever listen to the event and relay the message to the drone in the event 'initiate_flight'. Due to which the drone performs the takeoff and mission sequence.

         ```javascript
         socket.on('fly', (msg) => {
            plane.to('pi').emit('initiate_flight', msg);
         });
         ```
      
   13. servo - It listen's to the event 'servo' requested by the android device which is send with the intension of performing on and off of the servo present in the drone. The sever listen to the event and relay the message to the drone in the same event 'servo'. Due to which the drone performs the on and off of the servo present in the package drop system.

         ```javascript
         socket.on('servo', (data) => {
            plane.to('pi').emit('servo', data);
         });
         ```

   14. magcal - It listen's to the event 'magcal' requested by the android device which is send with the intension of performing calibration of magnetometer present in the drone. The sever listen to the event and relay the message to the drone in the same event 'magcal'. Due to which the drone performs the calibration of magnetometer.

         ```javascript
         socket.on('magcal',() => {
            plane.to('pi').emit('magcal');
         });
         ```

   15. positions - It listen's to the event 'positions' requested by the android device which is send with the intension of loading the mission present in the companion computer to the drone. The sever listen to the event and relay the message(name of mission file) to the drone in the same event 'positions'. Due to which the companion computer upload the mission to the drone.

         ```javascript
         socket.on('positions', (data) => {
            // data.file contains the file name present in the companion computer
            plane.to('pi').emit('positions', JSON.parse(data).file+'.txt');
         });
         ```

   16. simulate -

         ```javascript
         socket.on('simulate', () => {
            PlaneCount.findOne({}).exec()
               .then((data) => {
                    let fileNo = data.count_value;
                    fileNo = fileNo -1;
                    fs.readFile(path.join(datafile, fileNo+'.txt'), (err, data) => {
                        if (err) {
                           return console.log(`error in simulate readfile simulate socket ${planeName}`);
                        }
                        let datas = data.toString();
                        let splittedData = datas.split('}');
                        for (let i = 0; i < splittedData.length - 1; i++) {
                           setTimeoutObject.push(setTimeout(sendData, 300 * (i + 1), plane, splittedData[i] + '}'));
                        }
                    });
               })
               .catch((err) => console.log(`Error in simulate socket of plane ${planeName}`));
         });
         ```
      
   17. cancelSimulate - 

         ```javascript
         socket.on('cancelSimulate', () => {
            for (let i= 0; i<setTimeoutObject.length-1; i++){
                clearTimeout(setTimeoutObject[i]);
            }
         });
         ```
      
   18. error - 

         ```javascript
         socket.on('error', (error) => {
            console.log(`Socket error in ${planeName}: `+ JSON.stringify(error,undefined,2));
         });
         ```
      
   19. ping - 

         ```javascript
         socket.on('ping', () =>{
            socket.emit('pong');
         });
         ```
      
   20. disconnect - 

         ```javascript
         socket.on('disconnect', () => {
            //we can know the reason of disconnect by adding variable in above function of listener
            Client.findOne({clientId: socket.id,socketName: planeName}).exec()
                .then((data) => {
                    Client.deleteOne({clientId: socket.id, socketName: planeName}).exec()
                        .catch((err) => {
                            console.log(`Cannot Delete the user of ${planeName} in disconnect socket`);
                        });
                    if (data.deviceName === 'website') {
                        console.log(`${socket.id} (Website ${planeName}) disconnected`);
                    } else if (data.deviceName === 'android') {
                        console.log(`${socket.id} (Android device ${planeName}) disconnected`);
                    } else if (data.deviceName === 'pi') {
                        console.log(`${socket.id} (Pi ${planeName}) disconnected`);
                        PlaneCount.findOne({}).exec()
                            .then((data) => {
                                var fileNo = data.count_value;
                                plane.to('website').emit('error', {
                                    msg:`${planeName} disconnected from server`
                                });
                                plane.to('website').emit('copter-data', {
                                    /**
                                     * data format needed to send to the client when pi disconnect
                                     */
                                    conn: 'False',
                                    fix: 0,
                                    numSat: 0,
                                    hdop: 10000,
                                    arm: 'False',
                                    head: 0,
                                    ekf: 'False',
                                    mode: 'UNKNOWN',
                                    status: 'UNKNOWN',
                                    volt: 0,
                                    gs: 0,
                                    as: 0,
                                    altr: 0,
                                    alt: 0,
                                    est: 0,
                                    lidar: 0,
                                    lat: lat || 0,
                                    lng: lng || 0,
                                    roll: 0,
                                    pitch: 0,
                                    yaw: 0
                                });

                                let fileStream = fs.createWriteStream(path.join(datafile ,fileNo+'.txt'));
                                // access the mongodb native driver and its functions
                                let db_native = mongoose.connection.db;
                                fileStream.once('open', (no_need) => {
                                    PlaneData.find({}, {
                                        tokens: 0,
                                        __id: 0,
                                        _id: 0,
                                        __v: 0
                                    }).cursor().on('data', function (doc) {
                                        fileStream.write(doc.toString() + '\n');
                                    }).on('end', function () {
                                        fileStream.end();
                                        // check if collection exists and then dropped
                                        db_native.listCollections({name: `${DroneDatabaseName}`})
                                            .next(function (err, collinfo) {
                                                if (collinfo) {
                                                    // The collection exists
                                                    PlaneData.collection.drop();
                                                }
                                            });
                                        console.log(`********** ${planeName} file has been written and db is dropped.`);
                                    });
                                });

                                PlaneCount.updateOne({}, {$set:{count_value: fileNo+1}}).exec()
                                    .catch((err) => console.log(`Cannot update count value in socket disconnect of plane ${planeName}`));
                            })
                            .catch((err) => console.log(`Error in count find of ${planeName}`));
                    }
                })
                .catch((err) => console.log(`Error in find one of ${planeName}`));
         });
         ```
      
4. A simple send function is created which is executed when the 'simulate' event is requested by the android device. This function emit the data to the event 'simulateData'.
   
   ```javascript
   function sendData(socket,data) {
      socket.emit('simulateData',data);
   }
   ```

#### More detail on ***JT601Socket.js file***.

This file is the main which defines the socket for each drone. Each drone should have a file named as 'dronenameSocket.js' example for drone with name 'JT601' should have a file with name 'JT601Socket.js' and drone with name 'JT602' should have a file with name 'JT602Socket.js'. Each file requires its related databases and call the module required from the 'socketFunctions.js' file.

   ```javascript
   // required the module from the socketFunctions.js file
   let work = require('./socketFunctions');

   // name of the Drone 
   const planeName = 'JT601';
   // Databases of the related Drone
   let {JT601DroneData,JT601Count} = require('../models/droneData');

   const PlaneData = JT601DroneData;
   const PlaneCount = JT601Count;
   const DroneDatabaseName = `${planeName}dronedatas`.toLowerCase();

   // calling the function required from the file socketFunctions.js
   work(planeName,PlaneData,PlaneCount,DroneDatabaseName);
   ```

### More detail on ***server.js*** File.

These file requires every file which is to be handled while running the program. And finally creates a server to listen to a particular port and ip address.

   ```javascript
   /**
    * configuration of database is stored in config file
    */

   require('./config/config');

   /**
    * server require
    */
   const server = require('./app/app');

   const fs = require('fs');
   const path = require('path');

   /********************************************************************/

   /**
    * setting the port at which the server run
    */
   const port = process.env.PORT || 3000;

   /**
    * setting the hostname at which the server run for own server only
    */
   const hostname = 'localhost';

   /**
    * require socket files automatically
    */
   let requireDirectory = path.join(__dirname,'./socketio');

   fs.readdir(requireDirectory,(err,result) => {
      if (err) {
         return console.log(err);
      }
      result.forEach(sockets => {
         if (sockets.match(/Socket.js/)) {
               socket = sockets.replace('.js','');
               require(`./socketio/${socket}`);
         }
      });      
   });
   /********************************************************************/

   /**
    * setting up a server at port 3000 or describe by process.env.PORT and host localhost
    */
   server.listen(port,hostname, () => {
      console.log(`Server running at http://${hostname}:${port}`);
   });
   ```


## More detail on ***public(frontend)***

Full file structure of frontend is shown below.

```
.
└── public
    ├── css
    │   ├── bootstrap.min.css
    │   ├── dashboard.css
    │   ├── map.min.css
    │   └── style.min.css
    ├── data
    │   ├── default
    │   │   └── 0.txt
    │   ├── JT601
    │   │   └── 0.txt
    │   ├── JT602
    │   │   └── 0.txt
    │   ├── JT603
    │   │   └── 0.txt
    │   └── JT604
    │       └── 0.txt
    ├── favicon.ico
    ├── js
    │   ├── cpaneljs
    │   │   ├── cpanelmain.js
    │   │   ├── cpanelplanes.js
    │   │   └──cpanelusers.js
    │   ├── files
    │   │   ├── green.png
    │   │   ├── green.svg
    │   │   ├── logo.png
    │   │   ├── missions
    │   │   │   ├── missionJT601.txt
    │   │   │   └── oldmissionJT601.txt
    │   │   ├── red.png
    │   │   └── red.svg
    │   ├── function.js
    │   ├── index.js
    │   ├── libs
    │   │   ├── bootstrap.min.js
    │   │   ├── jquery-3.2.1.min.js
    │   │   ├── jquery-3.2.1.slim.min.js
    │   │   ├── math.min.js
    │   │   ├── popper.min.js
    │   │   └── socket.io.js
    │   ├── socketFunction.js
    │   ├── statusall.js
    │   └── status.js
    └── views
        ├── cpanel
        │   ├── cpanelmain.ejs
        │   ├── cpanelplanes.ejs
        │   └── cpanelusers.ejs
        ├── file.ejs
        ├── index.ejs
        ├── signupPage.ejs
        ├── statusall.ejs
        └── status.ejs
```

Top level file structure and their description.

```
.
└── public
    ├── css
    ├── data
    ├── js
    └── views
 ```

1. css - This directory contains all the css file required by the system.

2. data - All the logs of the plane is saved in this directory with plane name.

3. js - All the javascript file required by the system is present here including the socket file.

4. views - All the viewable file present in this directory which uses the css and javascript files.