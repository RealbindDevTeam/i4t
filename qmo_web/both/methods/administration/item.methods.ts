import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { ItemImageThumb } from '../../models/administration/item.model';
import { Items, ItemImages, ItemImagesThumbs, ItemImagesStore } from '../../collections/administration/item.collection';
import { Item } from '../../models/administration/item.model';
import { UserDetail } from '../../models/auth/user-detail.model';

/**
 * Function allow upload item images
 * @param {File} data
 * @param {String} user
 * @return {Promise<any>} uploadItemImage
 */
export function uploadItemImage(data: File,
  user: string,
  itemId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const file = {
      name: data.name,
      type: data.type,
      size: data.size,
      userId: user,
      itemId: itemId
    };

    const upload = new UploadFS.Uploader({
      data,
      file,
      store: ItemImagesStore,
      onError: reject,
      onComplete: resolve
    });
    upload.start();
  });
}

/**
 * Function to update item available
 * @param {UserDetail} _userDetail
 * @param {Item} _item
 */
if (Meteor.isServer) {
  Meteor.methods({
    updateItemAvailable: function (_userDetail: UserDetail, _item: Item) {
      let _itemRestaurant
      _itemRestaurant = Items.collection.findOne({ _id: _item._id }, { fields: { _id: 0, restaurants: 1 } });
      let aux = _itemRestaurant.restaurants.find(element => element.restaurantId === _userDetail.restaurant_work);
      Items.update({ _id: _item._id, "restaurants.restaurantId": _userDetail.restaurant_work }, { $set: { 'restaurants.$.isAvailable': !aux.isAvailable, modification_date: new Date(), modification_user: Meteor.userId() } });
    }
  })
}