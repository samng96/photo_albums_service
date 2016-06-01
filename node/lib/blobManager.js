
'use strict';

var azure = require('azure-storage');

var blobSvc = azure.createBlobService();

var trailerRegex = /(?:\.(?:thumb|med))?\.(?:png|jpg)$/;

var thumbRegex = /\.thumb\.(?:png|jpg)$/,
    boxImageRegex = /\.med\.(?:png|jpg)$/;

function gatherPhotos(albumName, photos, continuation, callback) {

    blobSvc.listBlobsSegmented(albumName, continuation, function (error, result, response) {
        if (!error) {
            // result.entries contains the entries
            // If not all blobs were returned, result.continuationToken has the continuation token.

            result.entries.forEach(function(blob) {
                
                var imageUrl = blob.name;
                
                var imageKey = imageUrl.replace(trailerRegex, '');
                
                var image = photos[imageKey] || (photos[imageKey] = {});
                
                if(thumbRegex.test(imageUrl)) {
                    image.thumb = imageUrl;
                }
                else if(boxImageRegex.test(imageUrl)) {
                    image.box = imageUrl;
                }
                else {
                    image.url = imageUrl;
                }
            });

            if (result.continuationToken) {
                gatherPhotos(albumName, photos, result.continuationToken, callback);
            }
            else {
                var keys = Object.keys(photos);
            
                keys.sort();
                
                var photosList = [];
                
                keys.forEach(function(photoKey) {
                    photosList.push(photos[photoKey]);
                });
                
                callback(null, photosList);
            }
        }
        else {
            callback(error, []);
        }
    });
}

module.exports = {
    albumPhotosAsync: function (albumName, callback) {
        
        var photos = Object.create(null);
        
        gatherPhotos(albumName, photos, null, callback);
    },
    getPhotoAsync: function(albumName, photoName, outputStream, callback) {
        blobSvc.getBlobToStream(albumName, photoName, outputStream, null, callback);
    },
    photoKey: function(photoName) {
        return (photoName||'').replace(trailerRegex, '');
    }
};