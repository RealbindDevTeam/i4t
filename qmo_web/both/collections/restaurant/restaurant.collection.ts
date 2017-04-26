import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Restaurant, RestaurantImage, RestaurantTurn } from '../../models/restaurant/restaurant.model';
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
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })
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