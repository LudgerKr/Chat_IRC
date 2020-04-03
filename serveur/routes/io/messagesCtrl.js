//Imports
const fetch = require('node-fetch')
//Routes

module.exports = {
    getMessages: function(req, res) {
        console.debug('/io/get_messages');
        var fields = req.query.fields;
        var limit = req.query.limit;
        var offset = req.query.offset;

        const params = new URLSearchParams({ 
            fields: fields || "",
            limit: limit || "",
            offset: offset || "",
        });

        fetch('http://localhost:3000/api/messages?' + params)
            .then(function (response) {
                response.text()
                    .then(function(messagesJson) {
                        return res.status(200).end(messagesJson);
                    });
            });
    }
}