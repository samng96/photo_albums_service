
'use strict';

var crypto = require('crypto');

module.exports = {
    hash: function (password, params) {
        
        var hmac = crypto.createHmac('sha256', password);
        hmac.update(params.join('.'));
        return hmac.digest('hex');
    }
};
