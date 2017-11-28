import { Injectable } from '@angular/core';
import { UploadFS } from 'meteor/jalik:ufs';
import { RestaurantImagesStore, RestaurantProfileImagesStore } from '../../../../../both/stores/restaurant/restaurant.store';

@Injectable()
export class ImageService {

    /**
     * Function allow upload restaurant images
     * @param {File} data
     * @param {string} user
     * @return {Promise<any>} uploadRestaurantImage
     */
    uploadRestaurantImage(data: File,
        user: string,
        restaurantId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const file = {
                name: data.name,
                type: data.type,
                size: data.size,
                userId: user,
                restaurantId: restaurantId
            };

            const upload = new UploadFS.Uploader({
                data,
                file,
                store: RestaurantImagesStore,
                onError: reject,
                onComplete: resolve
            });
            upload.start();
        });
    }

    /**
     * Function allow upload restaurant profile images
     * @param {Array<File>} data
     * @param {string} user
     * @return {Promise<any>} uploadRestaurantImage
     */
    uploadRestaurantProfileImages(dataImages: Array<File>,
        user: string,
        restaurantId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            for (let data of dataImages) {
                const file = {
                    name: data.name,
                    type: data.type,
                    size: data.size,
                    userId: user,
                    restaurantId: restaurantId
                };

                const upload = new UploadFS.Uploader({
                    data,
                    file,
                    store: RestaurantProfileImagesStore,
                    onError: reject,
                    onComplete: resolve
                });
                upload.start();
            }
        });
    }
}