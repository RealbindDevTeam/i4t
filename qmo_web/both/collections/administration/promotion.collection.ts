import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Promotion, PromotionImage } from '../../models/administration/promotion.model';

/**
 * Function to validate if user exists
 */
function loggedIn(){
    return !!Meteor.user();
}

/**
 * Promotion Collection
 */
export const Promotions = new MongoObservable.Collection<Promotion>('promotions');

/**
 * Allow Promotion collection insert and update functions
 */
Promotions.allow({
    insert: loggedIn,
    update: loggedIn
});

/**
 * Promotion Images Collection
 */
export const PromotionImages = new MongoObservable.Collection<PromotionImage>('promotionImages');

/**
 * Allow Promotion Images Collection insert, update and remove functions
 */
PromotionImages.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Create store to promotion images
 */
export const PromotionImagesStore = new UploadFS.store.GridFS({
  collection: PromotionImages.collection,
  name: 'promotionImagesStore',
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