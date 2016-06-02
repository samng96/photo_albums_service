'use strict';

var albumCache = require('../../lib/albumCache.js');
var albumCrypt = require('../../lib/albumCrypt.js');



module.exports = {
    get: function album_get(req, res) {
        
        var albumName = req.params.albumName;
        
        albumCache.getAlbumInfoAsync(albumName, function(error, albumInfo) {
            
            if(error) {
                res.status(400).json({
                    albumName: albumName,
                    error: error
                });
                
                return;
            }
            
            if(!!albumInfo.password) {
                
                var password = req.query.password;
                
                var expectedHash = albumCrypt.hash(albumInfo.password, [albumName]);
                
                function hasExpectedPassword() {
                    return albumInfo.password == password;
                }
                
                var cookieName = 'album-' + albumName;
                
                function hasExpectedCookie() {
                    console.log('Cookies', req.cookies);
                    
                    return !!req.cookies && req.cookies[cookieName] == expectedHash;
                }
            
                if(!hasExpectedPassword() && !hasExpectedCookie()) {
                    res.status(401).json({
                        albumName: albumName,
                        error: 'Invalid password'
                    });
                    return;
                }
                
                res.cookie(cookieName, expectedHash, {
                    expires: 0,
                    httpOnly: true,
                    secure: true
                });
                
                res.json({
                    type: 'password',
                    access: expectedHash
                });
                
                return;
            }
            
            res.json({
               type: 'open' 
            });
        });
    }
};