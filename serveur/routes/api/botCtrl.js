// imports
var models = require('../../models');
var bcrypt = require('bcrypt');
var jwtUtils = require('../../utils/jwt.utils');

//Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,16}$/

//routes
module.exports = {
    createBot: function(req, res) {
        console.debug("/api/boot/create method: POST");
        //Params
        var username = "ChatBot";
        var password = "ChatBot";

        /*if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({'error': "password invalid (must length 4 - 16), include one upper and lower case letter and one numeric digit"});
        } */

        models.User.findOne({
            attributes: ['username'],
            where:  { username: username, id: -1}
        })
        .then(function(userFound) {
            if (!userFound) {
                var newUser = models.User.create({
                    id: -1,
                    username: username,
                    password: password,
                    online: true,
                    socketId: 0,
                })
                .then(function(newUser) {
                    return res.status(201).json({
                        'userId': newUser.id
                    })
                })
                    .catch(function (err) {
                        return res.status(500).json({ 'error': "cannot add bot"});
                });
            } else {
                return res.status(409).json({'error': "bot already exist"});
            }
        })
        .catch(function (error) {
            return res.status(500).json({'error': "unable to verify bot", 'info': error});
        });
    },
    updateUserProfile: function (req, res) {
        console.debug("/api/bot/update/:userId method: PUT");
        // Getting auth header

        //Params
        var userId = req.params.userId;
        var online = req.body.online;

        models.User.findOne({
            where: {id: userId},
            attributes: ["id", "username", "online","socketId"]
        })
        .then(function (userFound) {
            if (!userFound) {
                return res.status(404).json({'error': "user not found"});
            }

            userFound.update({
                online: online ? (online == "true" ? 1 : 0) : userFound.online,
            })
            .then(function () {
                if (userFound) {
                    res.status(201).json(userFound);
                } else {
                    res.status(204).json({'error': "cannot update user profile"})
                }
            })
            .catch(function (err) {
                res.status(204).json({'error': "cannot update user"})
            });
        })
        .catch(function(err) {
            res.status(500).json({'error': "cannot fetch user", 'info': err})
        });

        //Params
    },
    createMessage: function(req, res) {
        console.debug("/api/bot/send method: POST");
        // Getting auth header

        //Params
        var content = req.body.content;
        var channel = req.body.channel;


        if (content == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        if (channel) {
            models.Channel.findOne({
                where: {name: channel}
            })
            .then(function (channelFound) {
                if (!channelFound) {
                    return res.status(400).json({'error': "Channel not found"})
                }
                models.Message.create({
                    content: content,
                    ChannelId: channelFound.id,
                    UserId: -1
                })
                .then(function (newMessage) {
                    if (newMessage) {
                        return res.status(201).json(newMessage);
                    } else {
                        return res.status(500).json({'error': "cannot post message"})
                    }
                })
            })
        } else {
            models.Message.create({
                content: content,
                UserId: -1
            })
            .then(function (newMessage) {
                if (newMessage) {
                    return res.status(201).json(newMessage);
                } else {
                    return res.status(500).json({'error': "cannot post message"})
                }
            })
        }
    }
}