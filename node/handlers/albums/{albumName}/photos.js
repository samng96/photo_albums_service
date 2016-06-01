'use strict';

var albumCache = require('../../../lib/albumCache.js');
var blobManager = require('../../../lib/blobManager.js');
var albumCrypt = require('../../../lib/albumCrypt.js');



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
                var expectedHash = albumCrypt.hash(albumInfo.password, [albumName]);
            
                if(expectedHash != req.query.access) {
                    res.status(401).json({
                        error: 'Invalid access hash'
                    });
                    return;
                }
            }
                    
            blobManager.albumPhotosAsync(albumName, function(error, photos){
               
               if(albumInfo.password) {
                   console.log(photos);
                   photos.forEach(function(photo) {
                       console.log(photo);
                      photo.hash = albumCrypt.hash(albumInfo.password, [albumName, blobManager.photoKey(photo.url)]); 
                   });
               }
               
                res.json(photos); 
            });
        });
    }
};