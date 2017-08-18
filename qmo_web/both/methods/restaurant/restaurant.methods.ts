import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { RestaurantImagesStore } from '../../stores/restaurant/restaurant.store';
import { CodeGenerator } from './QR/codeGenerator';
import { Table } from '../../models/restaurant/table.model';
import { Tables } from '../../collections/restaurant/table.collection';
import { UserDetails } from '../../collections/auth/user-detail.collection';
import { Accounts } from '../../collections/restaurant/account.collection';
import { Restaurant } from '../../models/restaurant/restaurant.model';
import { Restaurants } from '../../collections/restaurant/restaurant.collection';

import * as QRious from 'qrious';

/**
 * Function allow upload restaurant images
 * @param {File} data
 * @param {string} user
 * @return {Promise<any>} uploadRestaurantImage
 */
export function uploadRestaurantImage( data: File, 
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
 * This function create random code with 9 length to restaurants
 */
export function createRestaurantCode(): string {
    let _lText = '';
    let _lPossible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let _i = 0; _i < 9; _i++) {
        _lText += _lPossible.charAt(Math.floor(Math.random() * _lPossible.length));
    }
    return _lText;
}

/**
 * This function create random code with 5 length to restaurants
 */
export function createTableCode(): string {
    let _lText = '';
    let _lPossible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let _i = 0; _i < 5; _i++) {
        _lText += _lPossible.charAt(Math.floor(Math.random() * _lPossible.length));
    }
    return _lText;
}

/**
 * This function create QR Codes to restaurants
 * @param {string} _pRestaurantId
 * @param {string} _pTableCode
 * @param {string} _pStringToCode
 * @return {Table} generateQRCode
 */
export function generateQRCode(_pStringToCode: string): any {
    let _lCodeGenerator = new CodeGenerator(_pStringToCode);
    _lCodeGenerator.generateCode();
    return _lCodeGenerator;
}

Meteor.methods({
    /**
     * This Meteor Method return restaurant object with QR Code condition
     * @param {string} _qrcode
     * @param {string} _userId
     */
    getRestaurantByQRCode: function (_qrcode: string, _userId: string) {
        let _table: Table = Tables.collection.findOne({ QR_code: _qrcode });
        let _restaurant: Restaurant;

        if (_table) {
            if (_table.status === 'BUSY') {
                UserDetails.collection.update({ user_id: _userId },
                    {
                        $set: {
                            current_table: _table._id,
                            current_restaurant: _table.restaurantId
                        }
                    });
                Tables.collection.update({ QR_code: _qrcode }, { $set: { amount_people: (_table.amount_people + 1) } });
                _restaurant = Restaurants.collection.findOne({ _id: _table.restaurantId });
            } else if( _table.status === 'FREE' ) {
                Tables.collection.update({ QR_code: _qrcode }, { $set: { status: 'BUSY', amount_people: 1 } });
                Accounts.collection.insert({
                    creation_date: new Date(),
                    creation_user: _userId,
                    restaurantId: _table.restaurantId,
                    tableId: _table._id,
                    status: 'OPEN',
                    total_payment: 0
                });
                UserDetails.collection.update({ user_id: _userId },
                    {
                        $set: {
                            current_table: _table._id,
                            current_restaurant: _table.restaurantId
                        }
                    });
                _restaurant = Restaurants.collection.findOne({ _id: _table.restaurantId });
            }
            return _restaurant;
        } else {
            throw new Meteor.Error('400', 'La mesa solicitada no existe');
        }
    },

    /**
     * This method return restaurant if exist o null if not
     */

    getCurrentRestaurantByUser: function (_restaurantId: string) {
        let restaurant = Restaurants.collection.findOne({ _id: _restaurantId });

        if (typeof restaurant != "undefined" || restaurant != null) {
            return restaurant;
        } else {
            return null;
        }
    }
});