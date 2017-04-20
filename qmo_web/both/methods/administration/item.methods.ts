import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { ItemImageThumb } from '../../models/administration/item.model';
import { Items, ItemImages, ItemImagesThumbs, ItemImagesStore } from '../../collections/administration/item.collection';

/**
 * Function allow upload item images
 * @param {File} data
 * @param {String} user
 * @return {Promise<any>} uploadItemImage
 */
export function uploadItemImage( data: File, 
                                 user: string,
                                 itemId: string ): Promise<any> {
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