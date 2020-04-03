//Imports
var models = require('../../models');
var jwtUtils = require('../../utils/jwt.utils');

//Constants

//Routes
module.exports = {
    createMessage: function(req, res) {
        console.debug("/api/messages/new method: POST");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        //Params
        var content = req.body.content;
        var channel = req.body.channel;


        if (content == null) {
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
                            UserId: userFound.id
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
                        UserId: userFound.id
                    })
                    .then(function (newMessage) {
                        if (newMessage) {
                            return res.status(201).json(newMessage);
                        } else {
                            return res.status(500).json({'error': "cannot post message"})
                        }
                    })
                }
            } else {
                return res.status(404).json({'error': "User not found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user"})
        })

    },
    listMessage: function (req, res) {
        console.debug("/api/messages method: GET");

        //Params
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;
        var channel = req.query.channel;

        if (channel) {
            models.Channel.findOne({where: {name: channel}})
            .then(function (channelFound) {
                if (!channelFound) {
                    return res.status(400).json({'error': "Channel not found"})
                }
                models.Message.findAll({
                    order: [(order != null) ? order.split(':') : ['id', "ASC"]],
                    attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
                    limit: (!isNaN(limit)) ? limit : null,
                    offset: (!isNaN(offset)) ? offset : null,
                    where: {ChannelId: channelFound.id},
                    include: [{
                        model: models.User,
                        attributes: ['username']
                    }]
                })
                .then(function (messages) {
                    if (messages) {
                        return res.status(200).json(messages);
                    } else {
                        return res.status(404).json({'error': "No message Found"});
                    }
                })
                .catch(function (err) {
                    return res.status(500).json({'error': "Invalid fields", 'info': err})
                });

            });
        } else {
            models.Message.findAll({
                order: [(order != null) ? order.split(':') : ['id', "ASC"]],
                attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
                limit: (!isNaN(limit)) ? limit : null,
                offset: (!isNaN(offset)) ? offset : null,
                where: {ChannelId: null},
                include: [{
                    model: models.User,
                    attributes: ['username']
                }]
            })
            .then(function (messages) {
                if (messages) {
                    res.status(200).json(messages);
                } else {
                    res.status(404).json({'error': "No message Found"});
                }
            })
            .catch(function (err) {
                return res.status(500).json({'error': "Invalid fields", 'info': err})
            });
        }
    },
    deleteMessage: function (req, res) {
        console.debug("/api/messages/{id} method: DELETE");
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0) {
            return res.status(400).json({'error': "wrong token"});
        }

        //Params
        var messageId = req.params.messageId

        if (messageId <= 0) {
            return res.status(400).json({'error': "invalid parameters"})
        }

        models.User.findOne({
            where: {id: userId}
        })
        .then(function (userFound) {
            if (userFound) {
                models.Message.findOne({
                    where: {
                        id: messageId,
                        userId: userId,
                    } 
                })
                .then(function (findMessage) {
                    if (findMessage) {
                        findMessage.destroy();
                        return res.status(200).json({'info': "message deleted"});
                    } else {
                        return res.status(500).json({'error': "cannot find message"})
                    }
                })
            } else {
                return res.status(404).json({'error': "User not found"});
            }
        })
        .catch(function (err) {
            return res.status(500).json({ 'error': "unable to verify user"})
        });
    }
}