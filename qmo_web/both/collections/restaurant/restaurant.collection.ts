import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Restaurant, RestaurantImage, RestaurantImageThumb, RestaurantTurn } from '../../models/restaurant/restaurant.model';
import { Meteor } from 'meteor/meteor';

/**
 * Function to validate if user exists
 */
function loggedIn(){
    return !!Meteor.user();
}

/**
 * Restaurants Collection
 */
export const Restaurants =  new MongoObservable.Collection<Restaurant>('restaurants');

/**
 * Allow Restaurant collecion insert and update functions
 */
Restaurants.allow({
    insert: loggedIn,
    update: loggedIn
});

/**
 * Restaurant Image Thumbs Collection
 */
export const RestaurantImageThumbs = new MongoObservable.Collection<RestaurantImageThumb>('restaurantImageThumbs');

/**
 * Allow Restaurant Image Thumbs Collection insert, update and remove functions
 */
RestaurantImageThumbs.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

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
 * Restaurant Images Collection
 */
export const RestaurantImages = new MongoObservable.Collection<RestaurantImage>('restaurantImages');

/**
 * Allow Restaurant Images collection insert, update and remove functions
 */
RestaurantImages.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
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

/**
 * Restaurants Collection
 */

export const RestaurantTurns =  new MongoObservable.Collection<RestaurantTurn>('restaurant_turns');

/**
 * Allow Restaurant Turns collection insert and update functions
 */
RestaurantTurns.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});