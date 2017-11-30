import { MongoObservable } from 'meteor-rxjs';
import { Item, ItemImage, ItemImageThumb } from '../../models/administration/item.model';

/**
 * Function to validate if user exists
 */
function loggedIn() {
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
 * Item Image Thumbs Interface
 */
export interface ItemImageThumbsCollection<T> extends MongoObservable.Collection<T> {
    getItemImageThumbUrl(selector?: Object | string): string;
}

/**
 * Item Image Thumbs Collection
 */
export const ItemImagesThumbs = new MongoObservable.Collection<ItemImageThumb>('itemImageThumbs') as ItemImageThumbsCollection<ItemImageThumb>;

/**
 * Allow Item Image Thumbs Collection insert, update and remove functions
 */
ItemImagesThumbs.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Function to return item image thumb
 */
ItemImagesThumbs.getItemImageThumbUrl = function (_id: string) {
    const image = this.findOne({ itemId: _id }) || {};
    return image.url || '/images/default-plate.png';
}

/**
 * Item Images Interface
 */
export interface ItemImagesCollection<T> extends MongoObservable.Collection<T> {
    getItemImageUrl(selector?: Object | string): string;
}

/**
 * Item Images Collection
 */
export const ItemImages = new MongoObservable.Collection<ItemImage>('itemImages') as ItemImagesCollection<ItemImage>;

/**
 * Allow Item Images collection insert, update and remove functions
 */
ItemImages.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
});

/**
 * Function to return item image thumb
 */
ItemImages.getItemImageUrl = function (_id: string) {
    const image = this.findOne({ itemId: _id }) || {};
    return image.url || '/images/default-plate.png';
}