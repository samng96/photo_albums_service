'use strict';

var azure = require('azure-storage');

var blobSvc = azure.createBlobService();

var jp = require('jsonpath')

var cache = Object.create(null);

module.exports = {
    getAlbumInfoAsync: function(albumName, callback) {
        var albumInfo = cache[albumName];
        if(albumInfo) {
            console.log('returning cached album info', albumInfo);
            callback(null, albumInfo);
            return;
        }
        
        blobSvc.getBlobToText(albumName, 'info.json', function(error, infoJson) {
            if(error) {
                callback(error, {});
                return;
            }
            
            console.log('Album json for:', albumName, infoJson);
            
            function parseJson(text) {
                try {
                    return JSON.parse(infoJson);
                }
                catch(e) {
                    console.log(e);
                    return null;
                }
            }
            
            var info = cache[albumName] = parseJson(infoJson);
            
            if(info === null) {
                callback({ error: 'invalid json' });
                return;
            }
            
            callback(null, info);
        });
    }
};
