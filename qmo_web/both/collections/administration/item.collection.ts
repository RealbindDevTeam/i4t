import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Item, ItemImage } from '../../models/administration/item.model';

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
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })
});