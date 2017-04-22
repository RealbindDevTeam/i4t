import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Promotion, PromotionImage, PromotionImageThumb } from '../../models/administration/promotion.model';

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
 * Promotion Image Thumbs Collection
 */
export const PromotionImagesThumbs = new MongoObservable.Collection<PromotionImageThumb>('promotionImageThumbs');

/**
 * Allow Promotion Image Thumbs Collection insert, update and remove functions
 */
PromotionImagesThumbs.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Create store to promotion image thumbs
 */
export const PromotionImageThumbsStore = new UploadFS.store.GridFS({
  collection: PromotionImagesThumbs.collection,
  name: 'promotionImageThumbsStore',
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
  copyTo: [
    PromotionImageThumbsStore
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
