import { Meteor } from 'meteor/meteor';
import { Restaurants, RestaurantImages, RestaurantImageThumbs } from '../../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { check } from 'meteor/check';
import { Accounts } from '../../../../both/collections/restaurant/account.collection';
import { UserDetail } from '../../../../both/models/auth/user-detail.model';
import { HistoryPayments } from '../../../../both/collections/payment/history-payment.collection';

/**
 * Meteor publication restaurants with creation user condition
 * @param {string} _userId
 */
Meteor.publish('restaurants', function (_userId: string) {
    check(_userId, String);
    return Restaurants.collection.find({ creation_user: _userId });
});

/**
 * Meteor publication restaurantImages with user Id condition
 * @param {string} _userId 
 */
Meteor.publish('restaurantImages', function (_userId: string) {
    check(_userId, String);
    return RestaurantImages.collection.find({ userId: _userId });
});

/**
 * Meteor publication restaurantImages with user Id condition
 * @param {string} _userId 
 */
Meteor.publish('restaurantImagesByRestaurantWork', function (_userId: string) {
    check(_userId, String);
    var user_detail = UserDetails.collection.findOne({ user_id: _userId });
    if (user_detail) {
        return RestaurantImages.collection.find({ restaurantId: user_detail.restaurant_work });
    } else {
        return;
    }
});

/**
 * Meteor publications restaurantByCurrentUser
 * @param {string} _userId
 */

Meteor.publish('getRestaurantByCurrentUser', function (_userId: string) {
    check(_userId, String);
    var user_detail = UserDetails.collection.findOne({ user_id: _userId });
    if (user_detail) {
        return Restaurants.collection.find({ _id: user_detail.current_restaurant });
    } else {
        return;
    }
});

/**
 * Meteor publications restaurantByRestaurantWork
 * @param {string} _userId
 */

Meteor.publish('getRestaurantByRestaurantWork', function (_userId: string) {
    check(_userId, String);
    var user_detail = UserDetails.collection.findOne({ user_id: _userId });
    if (user_detail) {
        return Restaurants.collection.find({ _id: user_detail.restaurant_work });
    } else {
        return;
    }
});

/**
 * Meteor publication restaurantImageThumbs with user Id condition
 * @param {string} _userId 
 */
Meteor.publish('restaurantImageThumbs', function (_userId: string) {
    check(_userId, String);
    return RestaurantImageThumbs.collection.find({ userId: _userId });
});

/**
 * Meteor publication restaurantImageThumbs with restaurant Id condition
 * @param {string} _restaurantId 
 */
Meteor.publish('restaurantImageThumbsByRestaurantId', function (_restaurantId: string) {
    check(_restaurantId, String);
    return RestaurantImageThumbs.collection.find({ restaurantId: _restaurantId });
});

/**
 * Meteor publication restaurantImageThumbs with user Id condition
 * @param {string} _restaurantId 
 */
Meteor.publish('restaurantImageThumbsByUserId', function (_userId: string) {
    check(_userId, String);
    let _lUserDetail: UserDetail = UserDetails.findOne({ user_id: _userId });
    if (_lUserDetail) {
        if (_lUserDetail.current_restaurant) {
            return RestaurantImageThumbs.collection.find({ restaurantId: _lUserDetail.current_restaurant });
        } else {
            return;
        }
    } else {
        return;
    }
});

/**
 * Meteor publication restaurants with creation user condition
 * @param {string} _userId
 */
Meteor.publish('currentRestaurantsNoPayed', function (_userId: string) {
    check(_userId, String);

    let currentDate: Date = new Date();
    let currentMonth: string = (currentDate.getMonth() + 1).toString();
    let currentYear: string = currentDate.getFullYear().toString();

    var restaurantsInitial: string[] = Restaurants.collection.find({ creation_user: _userId, isActive: true, freeDays: false }).map(function (restaurant) {
        return restaurant._id;
    });

    var historyPayment = HistoryPayments.collection.find({ restaurantId: { $in: restaurantsInitial }, month: currentMonth, year: currentYear, status: 'APPROVED' }).map(function (historyPayment) {
        return historyPayment.restaurantId;
    });

    return Restaurants.collection.find({ _id: { $nin: historyPayment }, creation_user: _userId, isActive: true, freeDays: false});
});