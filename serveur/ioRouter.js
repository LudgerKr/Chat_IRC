//Imports
var express = require('express');
var messageCtrl = require('./routes/io/messagesCtrl');
var userCtrl = require('./routes/io/userCtrl');
const fetch = require('node-fetch');

//Routers

exports.router = (function () {
    ioRouter = express();

    ioRouter.route('/get_messages').get(messageCtrl.getMessages);
    ioRouter.route('/get_users').get(userCtrl.getUsers);
    ioRouter.route('/get_user').get(userCtrl.getUser);

    ioRouter.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        );
        next();
    });

    return ioRouter;
})();