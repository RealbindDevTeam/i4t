import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { PromotionImagesStore } from '../../collections/administration/promotion.collection';

/**
 * Function allow upload promotion images
 * @param {File} data
 * @param {String} user
 * @return {Promise<any>} uploadGarnishFoodImage
 */
export function uploadPromotionImage(data:File, user:string): Promise<any> {
  return new Promise((resolve, reject) => {
    const file = {
      name: data.name,
      type: data.type,
      size: data.size,
      userId: user
    };

    const upload = new UploadFS.Uploader({
      data,
      file,
      store: PromotionImagesStore,
      onError: reject,
      onComplete: resolve
    });
    upload.start();
  });
}