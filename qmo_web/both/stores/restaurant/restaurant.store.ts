import { UploadFS } from 'meteor/jalik:ufs';
import { RestaurantImages, RestaurantImageThumbs } from '../../collections/restaurant/restaurant.collection';
import { Meteor } from 'meteor/meteor';

/**
 * Function to validate if user exists
 */
function loggedIn(){
    return !!Meteor.user();
}

/**
 * Create store to restaurant image thumbs
 */
export const RestaurantImageThumbsStore = new UploadFS.store.GridFS({
    collection: RestaurantImageThumbs.collection,
    name: 'restaurantImageThumbsStore',
    permissions: new UploadFS.StorePermissions({
      insert: loggedIn,
      update: loggedIn,
      remove: loggedIn
    }),
    transformWrite(from, to, fileId, file) {
      // Resize to 100x100
      const gm = require('gm');
   
      gm(from, file.name)
        .resize(100, 100, "!")
        .gravity('Center')
        .extent(100, 100)
        .quality(75)
        .stream()
        .pipe(to);
  
    }
  });

  /**
 * Create store to restaurant images
 */
export const RestaurantImagesStore = new UploadFS.store.GridFS({
    collection: RestaurantImages.collection,
    name: 'restaurantImagesStore',
    filter: new UploadFS.Filter({
      contentTypes: ['image/*'],
      minSize: 1,
      maxSize: 1024 * 1000,  // 1MB
      extensions: ['jpg', 'png', 'jpeg']
    }),
    copyTo: [
      RestaurantImageThumbsStore
    ],
    permissions: new UploadFS.StorePermissions({
      insert: loggedIn,
      update: loggedIn,
      remove: loggedIn
    }),
    transformWrite(from, to, fileId, file) {
      // Resize to 500x500
      const gm = require('gm');
   
      gm(from, file.name)
        .resize(500, 500, "!")
        .gravity('Center')
        .extent(500, 500)
        .quality(75)
        .stream()
        .pipe(to);
    }
  });