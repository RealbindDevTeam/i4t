import { Meteor } from 'meteor/meteor';
import { Restaurants, RestaurantsLegality, RestaurantsProfile, RestaurantProfileImages, RestaurantProfileImageThumbs } from '../../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { check } from 'meteor/check';
import { Accounts } from '../../../../both/collections/restaurant/account.collection';
import { UserDetail } from '../../../../both/models/auth/user-detail.model';
import { PaymentsHistory } from '../../../../both/collections/payment/payment-history.collection';

/**
 * Meteor publication restaurants with creation user condition
 * @param {string} _userId
 */
Meteor.publish('restaurants', function (_userId: string) {
    check(_userId, String);
    return Restaurants.collection.find({ creation_user: _userId });
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
 * Meteor publication to find current restaurants with no pay
 * @param {string} _userId
 */
Meteor.publish('currentRestaurantsNoPayed', function (_userId: string) {
    check(_userId, String);

    let currentDate: Date = new Date();
    let currentMonth: string = (currentDate.getMonth() + 1).toString();
    let currentYear: string = currentDate.getFullYear().toString();
    let historyPaymentRes: string[] = [];
    let restaurantsInitial: string[] = [];

    Restaurants.collection.find({ creation_user: _userId, isActive: true, freeDays: false }).fetch().forEach((restaurant) => {
        restaurantsInitial.push(restaurant._id);
    });

    PaymentsHistory.collection.find({
        restaurantIds: {
            $in: restaurantsInitial
        }, month: currentMonth, year: currentYear, $or: [{ status: 'TRANSACTION_STATUS.APPROVED' }, { status: 'TRANSACTION_STATUS.PENDING' }]
    }).fetch().forEach((historyPayment) => {
        historyPayment.restaurantIds.forEach((restaurantId) => {
            historyPaymentRes.push(restaurantId);
        });
    });

    return Restaurants.collection.find({ _id: { $nin: historyPaymentRes }, creation_user: _userId, isActive: true, freeDays: false });
});

/**
 * Meteor publication to find inactive restaurants by user
 */
Meteor.publish('getInactiveRestaurants', function (_userId: string) {
    check(_userId, String);
    return Restaurants.collection.find({ creation_user: _userId, isActive: false });
});

/**
 * Meteor publication return active restaurants by user
 * @param {string} _userId
 */
Meteor.publish('getActiveRestaurants', function (_userId: string) {
    check(_userId, String);
    return Restaurants.collection.find({ creation_user: _userId, isActive: true });
});

/**
 * Meteor publication return restaurants by id
 * @param {string} _pId
 */
Meteor.publish('getRestaurantById', function (_pId: string) {
    check(_pId, String);
    return Restaurants.collection.find({ _id: _pId });
});

/**
 * Meteor publication return restaurant legality by restaurant id
 * @param {string} _restaurantId
 */
Meteor.publish('getRestaurantLegality', function (_restaurantId: string) {
    check(_restaurantId, String);
    return RestaurantsLegality.find({ restaurant_id: _restaurantId });
});

/**
 * Meteor publication return restaurant profile by restaurant id
 */
Meteor.publish('getRestaurantProfile', function (_restaurantId: string){
    check(_restaurantId, String);
    return RestaurantsProfile.find({restaurant_id: _restaurantId});
});

/**
 * Meteor publication return restaurant profile images with user Id condition
 * @param {string} _userId 
 */
Meteor.publish('getRestaurantProfileImages', function (_userId: string) {
    check(_userId, String);
    return RestaurantProfileImages.find( { userId: _userId } );
});

/**
 * Meteor publication return restaurant profile image thumbs with user Id condition
 * @param {string} _userId 
 */
Meteor.publish('getRestaurantProfileImageThumbs', function (_userId: string) {
    check(_userId, String);
    return RestaurantProfileImageThumbs.find( { userId: _userId } );
});

/**
 * Meteor publication return restaurant profile images with user restaurant id condition
 * @param {string} _restaurantId 
 */
Meteor.publish('getRestaurantProfileImagesByRestaurantId', function (_restaurantId: string) {
    check(_restaurantId, String);
    return RestaurantProfileImages.find( { restaurantId: _restaurantId } );
});

/**
 * Meteor publication return restaurant profile image thumbs with restaurant Id condition
 * @param {string} _restaurantId 
 */
Meteor.publish('getRestaurantProfileImageThumbsByRestaurantId', function (_restaurantId: string) {
    check(_restaurantId, String);
    return RestaurantProfileImageThumbs.find( { restaurantId: _restaurantId } );
});