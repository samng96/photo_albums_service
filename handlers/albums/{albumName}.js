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
            
            if(albumInfo.password) {
                
                var password = req.query.password;
            
                if(albumInfo.password != password) {
                    res.status(401).json({
                        error: 'Invalid password'
                    });
                    return;
                }
                
                var expectedHash = albumCrypt.hash(albumInfo.password, [albumName]);
                
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