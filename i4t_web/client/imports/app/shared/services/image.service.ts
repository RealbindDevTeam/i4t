import { Injectable } from '@angular/core';
import { UploadFS } from 'meteor/jalik:ufs';
import { RestaurantImagesStore, RestaurantProfileImagesStore } from '../../../../../both/stores/restaurant/restaurant.store';
import { ItemImagesStore } from '../../../../../both/stores/administration/item.store';
import { UserImagesStore } from '../../../../../both/stores/auth/user.store';

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

    /**
     * Function allow upload item images
     * @param {File} data
     * @param {String} user
     * @return {Promise<any>} uploadItemImage
     */
    uploadItemImage(data: File,
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
     * Function allow upload user images
     * @param {File} data
     * @param {String} user
     * @return {Promise<any>} uploadUserImage
     */
    uploadUserImage(data: File,
        user: string): Promise<any> {
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
                store: UserImagesStore,
                onError: reject,
                onComplete: resolve
            });
            upload.start();
        });
    }
}