import { Injectable } from '@angular/core';
import { UploadFS } from 'meteor/jalik:ufs';
import { RestaurantProfileImagesStore } from '../../../../../both/stores/restaurant/restaurant.store';

import { PickOptions } from '../../../../../both/models/general/pick-options.model';
import * as filestack from 'filestack-js';

@Injectable()
export class ImageService {

    private _apikey = "Ap3hOg05TtWuYxXU4E2gJz";
    //private _security = { policy: 'eyJtaW5TaXplIjoiMSIsIm1heFNpemUiOiIxMDQ4NTc2IiwiY2FsbCI6WyJwaWNrIl19',signature: '2a1fa9ed15d987fd62f2134b481b0307120664e8f2534967e585892858fce95b' };
    //private _client: any = filestack.init(this._apikey, this._security);
    private _client: any = filestack.init(this._apikey);
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

    get pickOptions(): Object {
        return this._pickOptions;
    }

    setPickOptionsLang(_pLanguage: string): void {
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
}