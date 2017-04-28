import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Item, ItemImage, ItemImageThumb } from '../../models/administration/item.model';



/**
 * Function to validate if user exists
 */
function loggedIn(){
    return !!Meteor.user();
}

/**
 * Items Collection
 */
export const Items = new MongoObservable.Collection<Item>('items');

/**
 * Allow Items collection insert and update functions
 */
Items.allow({
    insert: loggedIn,
    update: loggedIn
});

/**
 * Item Image Thumbs Collection
 */
export const ItemImagesThumbs = new MongoObservable.Collection<ItemImageThumb>('itemImageThumbs');

/**
 * Allow Item Image Thumbs Collection insert, update and remove functions
 */
ItemImagesThumbs.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Create store to item image thumbs
 */
export const ItemImageThumbsStore = new UploadFS.store.GridFS({
  collection: ItemImagesThumbs.collection,
  name: 'itemImageThumbsStore',
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  }),
  transformWrite(from, to, fileId, file) {
    // Resize to 100x100
    //var require: any;
     let gm = require('gm');
 
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
 * Item Images Collection
 */
export const ItemImages = new MongoObservable.Collection<ItemImage>('itemImages');

/**
 * Allow Item Images collection insert, update and remove functions
 */
ItemImages.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Create store to Item images
 */
export const ItemImagesStore = new UploadFS.store.GridFS({
  collection: ItemImages.collection,
  name: 'itemImagesStore',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*'],
    minSize: 1,
    maxSize: 1024 * 1000,  // 1MB
    extensions: ['jpg', 'png', 'jpeg']
  }),
  copyTo: [
    ItemImageThumbsStore
  ],
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  }),
  transformWrite(from, to, fileId, file) {
    // Resize to 500x500
    //var require: any;
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