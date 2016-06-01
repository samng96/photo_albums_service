'use strict';

var albumCache = require('../../../../lib/albumCache.js');
var blobManager = require('../../../../lib/blobManager.js');
var albumCrypt = require('../../../../lib/albumCrypt.js');

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
            
            var photoName = req.params.photoName;
            var photoKey = blobManager.photoKey(photoName);
            
            if(albumInfo.password) {
                
                var expectedHash = albumCrypt.hash(albumInfo.password, [albumName, photoKey]);
                
                if(req.query.access != expectedHash) {
                    res.status(401).json({
                    error: 'Invalid access hash' 
                    });
                    return;
                }
                
            }
            
            
            blobManager.getPhotoAsync(albumName, photoName, res, function(error, photos){
               res.end();
            });
        });
    }
};