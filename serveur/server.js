console.log("server.js");

var express = require("express");
var server = express();
var apiRouter = require('./apiRouter').router;
var ioRouter = require('./ioRouter').router;
var bodyParser = require("body-parser");
const fetch = require('node-fetch');

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

var http = require("http").createServer(server);
var io = require("socket.io")(http);

var currentConnections = {};

    server.get("/", function (request, result) {
        result.end("Hello world !");
    });

    server.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    fetch('http://localhost:3000/api/bot/create', {
            method: 'POST',
    });

    function BotSay(message= null, channelName = null) {
        const params = new URLSearchParams();

        if (message) {
            params.append('content', message);
        }

        if (channelName)
            params.append('channel', channelName);
    
        fetch('http://localhost:3000/api/bot/send', {
            method: 'POST',
            headers: {
            },
            body: params
        })
    }

    io.on("connection", function (socket) {
        currentConnections[socket.id] = {};
        console.log("socket connected = " + socket.id);

        /* -------------------------------------------------------------
                                USER
        ----------------------------------------------------------------*/

        socket.on("new_user", function (data) {
            console.debug("New user method : POST");

            const params = new URLSearchParams({
                'username': data.username,
                'password': data.password,
            });

            fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                body: params
            })
            .then((response) => {
                response.json()
                .then(function (data) {
                    socket.emit("new_user", data);
                })
            })
        });

        socket.on("user_connect", function (data) {
            console.debug("User connect method : POST");

            const params = new URLSearchParams({
                'username': data.username,
                'password': data.password,
            });

            fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                body: params
            })
            .then((response) => {
                response.json()
                .then(function (data) {
                    if (!data.error) {
                        currentConnections[socket.id].data = data;
                        BotSay("[" + currentConnections[socket.id].data.username + "] join the chat !");
                    }
                    socket.emit("user_connect", data);
                })
            })
        });

        socket.on('get_user', function (data) {
            console.debug("get_user");
    
            fetch('http://localhost:3000/api/users/me', {
                headers: {
                    'Authorization': 'Bearer ' + data.token
                }
            })
            .then(response => response.json())
            .then(function (json) {
                socket.emit("get_user", json);
            })
        });

        socket.on('get_users', function () {
            console.debug("get_users");
    
            fetch('http://localhost:3000/api/users?online=', {
            })
            .then(response => response.json())
            .then(function (json) {
                socket.emit("get_users", json);
            })
        });

        socket.on('get_users_online', function () {
            console.debug("get_users_online");
    
            fetch('http://localhost:3000/api/users?online=true', {
            })
            .then(response => response.json())
            .then(function (json) {
                socket.emit("get_users_online", json);
            })
        });

        socket.on('get_users_offline', function () {
            console.debug("get_users_offline");
    
            fetch('http://localhost:3000/api/users?online=false', {
            })
            .then(response => response.json())
            .then(function (json) {
                socket.emit("get_users_offline", json);
            })
        });

        socket.on("update_user", function (data) {
            console.debug("update_user method : PUT");
            const params = new URLSearchParams();

            if (data.username)
                params.append("username", data.username);
            if (data.password)
                params.append("password", data.password);
            if (data.online)
                params.append("online", data.online);
                BotSay("[" + currentConnections[socket.id].data.username + "] left the chat !");
                delete currentConnections[socket.id].data;


            fetch('http://localhost:3000/api/users/me', {
                method: 'PUT',
                body: params,
                headers: {
                    'Authorization': 'Bearer ' + data.token
                }
            })
            .then((response) => {
                response.json()
                .then(function (data) {
                    socket.emit("update_user", data);
                })
            })
        });

        /* -------------------------------------------------------------
                                MESSAGE
        ----------------------------------------------------------------*/

        socket.on("get_messages", function (data) {
            console.debug("get_messages : GET");
            data = JSON.stringify(data);
            var fields = data.fields;
            var limit = data.limit;
            var offset = data.offset;
    
            const params = { 
                fields: fields || "",
                limit: limit || "",
                offset: offset || "",
            };
            
            fetch('http://localhost:3000/api/messages?' + params.fields + "&" + params.limit + "&" + params.offset)
                .then(function (response) {
                    response.json()
                        .then(function(messagesJson) {
                            socket.emit("get_messages", messagesJson);
                        });
                });
            
        });

        socket.on("new_message", function (data) {
            console.debug("new_message : POST");

            const params = new URLSearchParams({
                'content': data.content,
            });

            if (data.channel)
                params.append("channel", data.channel);

            fetch('http://localhost:3000/api/messages/new', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + data.token
                },
                body: params
            })
            .then((response) => {
                response.json().then(function (json) {
                    io.emit("new_message", json);
                })
            });
        });

        socket.on("delete_message", function (id) {
            console.debug("delete_message : DELETE");

            var headerAuth = req.headers['authorization']

            fetch('http://localhost:3000/api/messages/' . id, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + headerAuth
                }
            })
            .then((result) => {
                socket.emit("delete_message", id);
            }).catch((err) => {
                socket.emit("error", err)
            });
        });

        /* -------------------------------------------------------------
                                CHANNEL
        ----------------------------------------------------------------*/

        socket.on('join_channel', function (data) {
            var channelName = data.channelName;

            fetch('http://localhost:3000/api/channels')
            .then((response) => {
                response.json().then(function (channels) {
                    var findChannel = channels.find(x => x.name == channelName);
                    if (!findChannel) {
                        const params = new URLSearchParams({name: channelName});

                        fetch('http://localhost:3000/api/channels/new', {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + data.token
                            },
                            body: params
                        })
                        .then((response) => {
                            response.json().then(function (findChannel) {
                                BotSay("[" + currentConnections[socket.id].data.username + "] join the channel " + findChannel.name, findChannel.name);
                                fetch('http://localhost:3000/api/channels/join/' + findChannel.id, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': 'Bearer ' + data.token
                                    },
                                });
                            });
                        });
                    } else {
                        BotSay("[" + currentConnections[socket.id].data.username + "] join the channel " + findChannel.name, findChannel.name);
                        fetch('http://localhost:3000/api/channels/join/' + findChannel.id, {
                            method: 'POST',
                            headers: {
                                'Authorization': 'Bearer ' + data.token
                            },
                        });
                    }
                });
            });
        });

        socket.on('leave_channel', function (data) {
            var channelName = data.channelName;

            fetch('http://localhost:3000/api/channels')
            .then((response) => {
                response.json().then(function (channels) {
                    var findChannel = channels.find(x => x.name == channelName);
                    if (findChannel) {
                        BotSay("[" + currentConnections[socket.id].data.username + "] leave the channel " + findChannel.name, findChannel.name);
                        fetch('http://localhost:3000/api/channels/leave/' + findChannel.id, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': 'Bearer ' + data.token
                            },
                        });
                    }
                });
            });
        });

        socket.on('bot_send', function (data) {

            BotSay(data.message, data.channel);

        });

        socket.on('disconnect', function () {
            var currentUser = currentConnections[socket.id];
            if (currentUser.data) {
                const params = new URLSearchParams({online: false});

                fetch('http://localhost:3000/api/bot/updateUser/' + currentUser.data.id, {
                    method: 'PUT',
                    body: params
                });
                BotSay("[" + currentUser.data.username + "] left the chat !");
            }
            delete currentConnections[socket.id];
        });
    });

    server.use('/api/', apiRouter);
    server.use('/io', ioRouter);

http.listen(3000, function () {
    console.log("Listening :3000");
});