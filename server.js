const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Twitter = require('twitter');
const CONFIG = require('./src/fbConfig');
const firebase = require('firebase');

const config = {
    apiKey: "AIzaSyAM5--2ZDdVMAyIAGiJgLQOsdRlEpNewe0",
    authDomain: "richpanel-92326.firebaseapp.com",
    databaseURL: "https://richpanel-92326.firebaseio.com",
    projectId: "richpanel-92326",
    storageBucket: "",
    messagingSenderId: "677614933086",
    appId: "1:677614933086:web:32b7af57a907d31ae290cf",
    measurementId: "G-95XWCEQQ5Y"
};
firebase.initializeApp(config);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static(__dirname + '/build'));

app.post('/apis/:uid/dm', function (req, res) {
    console.log(req.params.uid)
    console.log(req.body);
    const secret = req.body.secret ? req.body.secret : CONFIG.TWITTER_ACCESS_TOKEN_KEY;
    const token = req.body.token ? req.body.token : CONFIG.TWITTER_ACCESS_TOKEN_SECRET;
    var client = new Twitter({
        consumer_key: CONFIG.TWITTER_CONSUMER_KEY,
        consumer_secret: CONFIG.TWITTER_CONSUMER_SECRET,
        access_token_key: secret,
        access_token_secret: token
    });
    client.get('direct_messages/events/list', function (error, tweets, response) {
        res.send({ message: 'Np apis', error: error, data: tweets });
        // console.log(tweets);  // The favorites.
        // console.log(response);  // Raw response object.
    });
});

app.post('/apis/:uid/status', function (req, res) {
    const secret = req.body.secret ? req.body.secret : CONFIG.TWITTER_ACCESS_TOKEN_KEY;
    const token = req.body.token ? req.body.token : CONFIG.TWITTER_ACCESS_TOKEN_SECRET;
    var client = new Twitter({
        consumer_key: CONFIG.TWITTER_CONSUMER_KEY,
        consumer_secret: CONFIG.TWITTER_CONSUMER_SECRET,
        access_token_key: token,
        access_token_secret: secret
    });
    client.get('statuses/home_timeline', function (error, tweets, response) {
        res.send({ message: '', error: error, data: tweets });
        // console.log(tweets);  // The favorites.
        // console.log(response);  // Raw response object.
    });
});

app.use('/apis/:uid/update', function (req, res) {

    res.send({ message: 'User updated sucessfully', error: false, data: null });
});

app.use('/apis', function (req, res) {
    res.send({ message: 'Np apis', error: true, data: null });
});
const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port);
console.debug('Server listening on port ' + port);