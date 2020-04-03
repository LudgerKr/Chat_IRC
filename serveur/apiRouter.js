//Imports
var express = require('express');
var usersCtrl = require('./routes/api/usersCtrl');
var messageCtrl = require('./routes/api/messagesCtrl');
var channelCtrl = require('./routes/api/channelCtrl');
var botCtrl = require('./routes/api/botCtrl');

//Router
exports.router = (function () {
    var apiRouter = express.Router();

    //Users routes
    apiRouter.route('/users/').get(usersCtrl.getUsers);
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/me/').put(usersCtrl.updateUserProfile);
    apiRouter.route('/users/me/').delete(usersCtrl.deleteUserProfile);


    //Message routes
    apiRouter.route('/messages/new/').post(messageCtrl.createMessage);
    apiRouter.route('/messages/').get(messageCtrl.listMessage);
    apiRouter.route('/messages/:messageId').delete(messageCtrl.deleteMessage)

    //Channels routes
    apiRouter.route('/channels/').get(channelCtrl.listChanels);
    apiRouter.route('/channels/:channelId').get(channelCtrl.listUserChannel);
    apiRouter.route('/channels/:channelId').put(channelCtrl.renameChannel);
    apiRouter.route('/channels/new').post(channelCtrl.createChannel);
    apiRouter.route('/channels/delete/:channelId').delete(channelCtrl.deleteChannel);
    apiRouter.route('/channels/join/:channelId').post(channelCtrl.joinChannel);
    apiRouter.route('/channels/leave/:channelId').delete(channelCtrl.leaveChannel);


    //Bot routes
    apiRouter.route('/bot/create').post(botCtrl.createBot);
    apiRouter.route('/bot/updateUser/:userId').put(botCtrl.updateUserProfile);
    apiRouter.route('/bot/send').post(botCtrl.createMessage);


    return apiRouter;

})();