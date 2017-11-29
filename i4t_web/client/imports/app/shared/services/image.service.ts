import { Injectable } from '@angular/core';
import { UploadFS } from 'meteor/jalik:ufs';
import { RestaurantProfileImagesStore } from '../../../../../both/stores/restaurant/restaurant.store';
import { ItemImagesStore } from '../../../../../both/stores/administration/item.store';
import { UserImagesStore } from '../../../../../both/stores/auth/user.store';

import { PickOptions } from '../../../../../both/models/general/pick-options.model';
import * as filestack from 'filestack-js';

@Injectable()
export class ImageService {

    private _client: any = filestack.init('AxKKZ4GYkRXC2tSdhZSf8z');
    private _pickOptions: PickOptions = {
        fromSources: ["local_file_system", "imagesearch", "facebook", "instagram"],
        lang: "en",
        maxSize: 1048576,
        maxFiles: 1,
        minFiles: 1
    }

    get client(): any {
        return this._client;
    }

    get pickOptions():Object{
        return this._pickOptions;
    }

    setPickOptionsLang( _pLanguage:string ):void{
        this._pickOptions.lang = _pLanguage;
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