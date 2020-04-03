// imports
var models = require('../../models');
var bcrypt = require('bcrypt');
var jwtUtils = require('../../utils/jwt.utils');

//Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,16}$/

//routes
module.exports = {
    getUsers: function(req, res) {
        console.debug("/api/users method: GET")
        var online = req.query.online;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = parseInt(req.query.order);
        var channelName = req.query.channelName;

        if (channelName) {
            models.Channel.findOne({
                where: {name: channelName},
            })
            .then(function (findChannel) {
                if (findChannel) {
                    models.ListUserChannel.findAll({
                        attributes: ["User.online", "User.username"],
                        where: {ChannelId: findChannel.id},
                        limit: (!isNaN(limit)) ? limit : null,
                        offset: (!isNaN(offset)) ? offset : null,
                        include: [{
                            model: models.User,
                            attributes: ['username', 'online'],
                            where: online ? {online: online == "true" ? 1 : 0} : null,
                        }]
                    })
                    .then(function (findListUserChannel) {
                        if (findListUserChannel) {
                            var newArray = [];
                            findListUserChannel.map(user => newArray.push(user.User));
                            res.status(200).json(newArray);
                        }
                    })
                } else {
                    res.status(400).json({'error': "channel not found"});
                }
            });
        } else {
            models.User.findAll({
                attributes: ["username", "online"],
                limit: (!isNaN(limit)) ? limit : null,
                offset: (!isNaN(offset)) ? offset : null,
                where: online ? {online: online == "true" ? 1 : 0} : null
            })
            .then(function (users) {
                if (users) {
                    res.status(200).json(users);
                } else {
                    res.status(404).json({'error': "No user found"});
                }
            })
            .catch(function (err) {
                res.status(500).json({'error': "Invalid fields", 'info': err});
            });
        }

    },
    register: function(req, res) {
        console.debug("/api/users/register method: POST");
        //Params
        var username = req.body.username;
        var password = req.body.password;

        if (username == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters'});
        }

        if (username.length <= 3 || username.length >= 14) {
            return res.status(400).json({'error': "wrong ursername (must be length 4 - 15)"});
        }

        /*if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({'error': "password invalid (must length 4 - 16), include one upper and lower case letter and one numeric digit"});
        } */


        models.User.findOne({
            attributes: ['username'],
            where:  { username: username}
        })
        .then(function(userFound) {
            if (!userFound) {
                bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                    var newUser = models.User.create({
                        username: username,
                        password: bcryptedPassword,
                        online: false,
                        socketId: 0,
                    })
                    .then(function(newUser) {
                        return res.status(201).json({
                            'userId': newUser.id
                        })
                    })
                    .catch(function (err) {
                        return res.status(500).json({ 'error': "cannot add user"});
                    });
                });
            } else {
                return res.status(409).json({'error': "user already exist"});
            }
        })
        .catch(function (error) {
            return res.status(500).json({'error': "unable to verify user", 'info': error});
        });
    },
    login: function(req, res) {
        console.debug("/api/users/login method: POST");
        //Param
        var username = req.body.username;
        var password = req.body.password;

        if (username == null || password == null) {
            return res.status(400).json({'error': "missing parameters"});
        }

        models.User.findOne({
            where: { username: username }
        })
        .then(function (userFound) {
            if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                    if (resBycrypt) {
                        userFound.update({'online': true});
                        return res.status(200).json({
                            'id': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound),
                            'username': userFound.username
                        });
                    } else {
                        return res.status(403).json({'error': "invalid username or password"});
                    }
                });
            } else {
                return res.status(404).json({'error': 'user not exist'})
            }
            
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user", 'info': err})
        })
    },
    getUserProfile: function(req, res) {
        console.debug("/api/users/me method: get");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        models.User.findOne({
            where: {id: userId}
        })
        .then(function (user) {
            if (user) {
                res.status(201).json(user);
            } else {
                res.status(404).json({'error': "user not found"});
            }
        })
        .catch(function (err) {
            res.status(500).json({'error': "cannot fetch user", 'info': err});
        });
    },
    updateUserProfile: function (req, res) {
        console.debug("/api/users/me/ method: PUT");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        //Params
        var username = req.body.username;
        var password = req.body.password;
        var socketId = parseInt(req.body.socketId);
        var online = req.body.online;

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        models.User.findOne({
            where: {id: userId},
            attributes: ["id", "username", "online","socketId"]
        })
        .then(function (userFound) {
            if (!userFound) {
                return res.status(404).json({'error': "user not found"});
            }

            bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                userFound.update({
                    username: username || userFound.username,
                    password: password ? bcryptedPassword : userFound.password,
                    socketId: socketId || userFound.socketId,
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
            });
        })
        .catch(function(err) {
            res.status(500).json({'error': "cannot fetch user", 'info': err})
        });

        //Params
    },
    deleteUserProfile: function(req, res) {
        console.debug("/api/users/me/ method: DELETE");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        models.User.findOne({
            where: {id: userId},
            attributes: ["id", "username"]
        })
        .then(function(user) {
            if (!user) {
                return res.status(404).json({'error': "user not found"});
            }

            user.destroy()
            .then(function () {
                res.status(200).json({'status': "User delete id : " + userId});
            })
        })
        .catch(function(err) {
            res.status(500).json({'error': "cannot fetch user", 'info': err})
        });
    }
}