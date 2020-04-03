//Imports
var models = require('../../models');
var jwtUtils = require('../../utils/jwt.utils');


//Routes
module.exports = {
    listChanels: function (req, res) {
        console.debug("/api/channels method: GET");

        //Params
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;

        models.Channel.findAll({
            order: [(order != null) ? order.split(':') : ['id', "ASC"]],
            limit: (!isNaN(limit)) ? limit : null,
            attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
            offset: (!isNaN(offset)) ? offset : null,
            include: [{
                model: models.User,
                attributes: ['username']
            }]
        })
        .then(function (channels) {
            if (channels) {
                res.status(200).json(channels);
            } else {
                res.status(404).json({'error': "No channels Found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({'error': "Invalid fields", 'info': err})
        });
    },
    listUserChannel: function (req, res) {
        console.debug("/api/channels/:channelId method: GET");

        //Params
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;

        var channelId = req.params.channelId

        if (channelId == null) {
            return res.status(400).json({'error': "No channel id"})
        }

        models.Channel.findOne({
            where: {id: channelId}
        })
        .then(function (channelFound) {
            if (channelFound) {
                models.ListUserChannel.findAll({
                    order: [(order != null) ? order.split(':') : ['id', "ASC"]],
                    limit: (!isNaN(limit)) ? limit : null,
                    attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
                    offset: (!isNaN(offset)) ? offset : null,
                    where: {ChannelId: channelFound.id},
                    include: [{
                        model: models.User,
                        attributes: ['username']
                    }]
                })
                .then(function(listUserChannelFound) {
                    if (!listUserChannelFound) {
                        return res.status(400).json({'error': "No user in channel"})
                    }
                    return res.status(200).json(listUserChannelFound);
                })
                .catch(function (err) {
                    return res.status(500).json({'error': "Invalid fields", 'info': err})
                });
            } else {
                res.status(404).json({'error': "No channels Found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({'error': "Invalid fields", 'info': err})
        });
    },
    createChannel: function(req, res) {
        console.debug("/api/channels/new method: POST");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        //Params
        var name = req.body.name;

        if (name == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        models.User.findOne({
            where: {id: userId}
        })
        .then(function (userFound) {
            if (userFound) {
                models.Channel.findOne({
                    where: {name: name}
                })
                .then(function (channelFound) {
                    if (!channelFound) {
                        models.Channel.create({
                            name: name,
                            UserId: userFound.id
                        })
                        .then(function (newChannel) {
                            if (newChannel) {
                                return res.status(201).json(newChannel);
                            } else {
                                return res.status(500).json({'error': "cannot create channel"})
                            }
                        });
                    } else {
                        return res.status(400).json({'error': "Channel already exists"})
                    }
                });
            } else {
                return res.status(404).json({'error': "User not found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user"})
        })
    },
    renameChannel: function(req, res) {
        console.debug("/api/channels/ method: PUT");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        //Params
        var channelId = req.params.channelId

        var name = req.body.name;


        if (channelId == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        if (name == null) {
            return res.status(400).json({'error': "Wesh tu veut modifier quoi gros !"});
        }

        models.User.findOne({
            where: {id: userId}
        })
        .then(function (userFound) {
            if (userFound) {
                models.Channel.findOne({
                    where: {id: channelId, UserId: userFound.id}
                })
                .then(function (channelFound) {
                    if (channelFound) {
                        channelFound.update({
                            name: name
                        })
                        .then(function (newChannelFound) {
                            return res.status(200).json(newChannelFound);
                        })
                        .catch(function (err) {
                            return res.status(500).json({'error': "Cannot update channel"});
                        })
                    } else {
                        return res.status(400).json({'error': "Channel not found"});
                    }
                });
            } else {
                return res.status(404).json({'error': "User not found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user"})
        })
    },
    deleteChannel: function(req, res) {
        console.debug("/api/channels/{id} method: DELETE");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        //Params
        var channelId = req.params.channelId

        if (channelId <= 0) {
            return res.status(400).json({'error': "invalid parameters"})
        }

        models.User.findOne({
            where: {id: userId}
        })
        .then(function (userFound) {
            if (userFound) {
                models.Channel.findOne({
                    where: {
                        id: channelId,
                        UserId: userFound.id
                    } 
                })
                .then(function (findChannel) {
                    if (findChannel) {
                        findChannel.destroy();
                        return res.status(200).json({'info': "channel deleted"});
                    } else {
                        return res.status(500).json({'error': "cannot find channel"})
                    }
                })
            } else {
                return res.status(404).json({'error': "User not found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user"})
        });
    },
    joinChannel: function(req, res) {
        console.debug("/api/channels/join method: POST");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        //Params
        var channelId = req.params.channelId


        if (channelId == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        models.User.findOne({
            where: {id: userId}
        })
        .then(function (userFound) {
            if (userFound) {
                models.Channel.findOne({
                    where: {id: channelId}
                })
                .then(function (channelFound) {
                    if (channelFound) {
                        models.ListUserChannel.findOne({
                            where: {
                                UserId: userFound.id,
                                ChannelId: channelFound.id
                            }
                        })
                        .then(function (listUserChannelFound) {
                            if (!listUserChannelFound) {
                                models.ListUserChannel.create({
                                    UserId: userFound.id,
                                    ChannelId: channelFound.id
                                })
                                .then(function () {
                                    return res.status(201).json({'status': "success", 'info': "User join channel " + channelFound.name})
                                })
                                .catch(function (err) {
                                    return res.status(500).json({'error': "cannot create ListUserChannel"})
                                })
                            } else {
                                res.status(400).json({'error': "User already in channel"});
                            }
                        });
                    } else {
                        return res.status(400).json({'error': "Channel not found"});
                    }
                });
            } else {
                return res.status(404).json({'error': "User not found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user"})
        })
    },
    leaveChannel: function(req, res) {
        console.debug("/api/channels/leave method: POST");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        //Params
        var channelId = req.params.channelId


        if (channelId == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        models.User.findOne({
            where: {id: userId}
        })
        .then(function (userFound) {
            if (userFound) {
                models.Channel.findOne({
                    where: {id: channelId}
                })
                .then(function (channelFound) {
                    if (channelFound) {
                        models.ListUserChannel.findOne({
                            where: {
                                UserId: userFound.id,
                                ChannelId: channelFound.id
                            }
                        })
                        .then(function (listUserChannelFound) {
                            if (listUserChannelFound) {
                                listUserChannelFound.destroy()
                                .then(function () {
                                    return res.status(201).json({'status': "success", 'info': "User leave channel " + channelFound.name})
                                })
                                .catch(function (err) {
                                    return res.status(500).json({'error': "cannot delete ListUserChannel"})
                                })
                            } else {
                                res.status(400).json({'error': "User not in channel"});
                            }
                        });
                    } else {
                        return res.status(400).json({'error': "Channel not found"});
                    }
                });
            } else {
                return res.status(404).json({'error': "User not found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user"})
        })
    }
}