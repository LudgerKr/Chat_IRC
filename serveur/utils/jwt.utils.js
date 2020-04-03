require('dotenv').config();
//Imports
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = process.env.JWT_SIGN_SECRET;

// Exported functions
module.exports = {
    generateTokenForUser: function (userData) {
        return jwt.sign({
            userId: userData.id,
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        });
    },
    // get token from authorization and remove 'Bearer '
    parseAuthorization: function (authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUserId: function (authorization) {
        var userId = -1;
        var token = this.parseAuthorization(authorization);

        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);

                if (jwtToken != null) {
                    userId = jwtToken.userId;
                }
                
            } catch (err) {
                
            }
        }
        return userId;
    }
}