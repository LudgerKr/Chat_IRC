// Imports
const fetch = require('node-fetch');


//Routes

module.exports = {
    getUsers: function (req, res) {
        console.debug("/io/get_users method: GET");
        var online = req.query.online;
        var limit = req.query.limit;
        var offset = req.query.offset;

        const params = new URLSearchParams({
            online: online || "",
            limit: limit || "",
            offset: offset || "",
        });
        fetch('http://localhost:3000/api/users?' + params)
        .then(function (response) {
            response.text()
            .then(function(usersJson) {
                return res.status(200).end(usersJson)
            }) 
        });
    },
    getUser: function (req, res) {

    }
}