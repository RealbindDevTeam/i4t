import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { Promotions, PromotionImages, PromotionImagesStore, PromotionImagesThumbs } from '../../collections/administration/promotion.collection';

/**
 * Function allow upload promotion images
 * @param {File} data
 * @param {String} user
 * @return {Promise<any>} uploadGarnishFoodImage
 */
export function uploadPromotionImage( data:File, 
                                      user:string, 
                                      promotionName:string, 
                                      promotionDescription:string, 
                                      promotionRestaurants:string[] ): Promise<any> {
  return new Promise( ( resolve, reject ) => {
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
      onComplete( file ) {
          Promotions.insert({
              creation_user: user,
              creation_date: new Date(),
              modification_user: '-',
              modification_date: new Date(),
              is_active: true,
              name: promotionName,
              description: promotionDescription,
              promotionImageId: file._id,
              urlImage: file.url,
              promotionImageThumbId: '-',
              urlImageThumb: '',
              restaurants: promotionRestaurants
          });
      }
    });
    upload.start();
  });
}

/**
 * Function allow update promotion images
 * @param {File} data
 * @param {String} user
 * @return {Promise<any>} uploadGarnishFoodImage
 */
export function updatePromotionImage( data:File, 
                                      user:string, 
                                      promotionId:string, 
                                      promotionName:string, 
                                      promotionDescription:string, 
                                      promotionIsActive:boolean, 
                                      promotionImageToRemove: string,
                                      promotionImageThumbToRemove: string,
                                      promotionRestaurants:string[] ): Promise<any> {
  return new Promise( ( resolve, reject ) => {
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
      onComplete( file ) {
          Promotions.update( promotionId,{
              $set:{
                  modification_user: user,
                  modification_date: new Date(),
                  name: promotionName,
                  description: promotionDescription,
                  is_active: promotionIsActive,
                  promotionImageId: file._id,
                  urlImage: file.url,
                  restaurants: promotionRestaurants
              }
          });
          PromotionImages.remove( { _id: promotionImageToRemove } );
          PromotionImagesThumbs.remove( { _id: promotionImageThumbToRemove } );
      }
    });
    upload.start();
  });
}