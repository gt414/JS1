var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var dbConnector = require("./dbConnector");

function setup() {
    app.use(session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.set('view engine', 'ejs');
    app.get('/', (request, response) => {
        dbConnector.getAllBooks(function (result) {
            response.render('index.ejs', {
                books: result,
                loggedin: request.session.loggedin,
                username: request.session.username,
                userID: request.session.userID
            });
        });
    })
    app.use(express.static('public'));

    app.get('/borrowList', (request, response) => {
        dbConnector.getBorrowList(request.session.userID, function (result) {
            response.render('borrowList.ejs', {
                list: result,
                userID: request.session.userID
            });
        });
    })

    app.get('/logout', function (request, response) {
        request.session.loggedin = false;
        request.session.username = "";
        request.session.userID = 0;
        response.redirect('/');
        response.end();
    });

    app.post('/api/borrowBooks', function (request, response) {
        var userID = request.body.userID;
        var bookIDs = request.body.bookIDs;
        if (userID && bookIDs) {
            dbConnector.insertBorrowStauts(userID, bookIDs, function (isSuccess) {
                if (isSuccess) {
                    response.send('借書成功');
                }else{
                    response.send('借書失敗');
                }
                response.end();
            });
        } else {
            response.send('Parameter is empty');
            response.end();
        }
    });

    app.post('/api/returnBook', function (request, response) {
        var id = request.body.id;
        if (id) {
            dbConnector.returnBook(id, function (isSuccess) {
                if (isSuccess) {
                    response.send('還書成功');
                }else{
                    response.send('還書失敗');
                }
                response.end();
            });
        } else {
            response.send('Parameter is empty');
            response.end();
        }
    });

    app.post('/auth', function (request, response) {
        var username = request.body.username;
        var password = request.body.password;
        if (username && password) {
            dbConnector.login(username, password, function (result, id) {
                if (result) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    request.session.userID = id;
                    response.redirect('/');
                } else {
                    response.send('Incorrect Username and/or Password!');
                }
                response.end();
            });
        } else {
            response.send('Please enter Username and Password!');
            response.end();
        }
    });
}

function run() {
    const port = 8080;
    app.listen(port, function () {
        console.log('Example app listening on port ' + port + '!');
    });
}

exports.setup = setup;
exports.run = run;