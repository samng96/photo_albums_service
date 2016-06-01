
'use strict';

var crypto = require('crypto');

module.exports = {
    hash: function (password, params) {
        
        var hmac = crypto.createHmac('sha256', 'a secret');
        hmac.update(params.join('.'));
        return hmac.digest('hex');
    }
};