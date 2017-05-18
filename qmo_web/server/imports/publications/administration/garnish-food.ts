import { Meteor } from 'meteor/meteor';
import { GarnishFoodCol } from '../../../../both/collections/administration/garnish-food.collection';
import { Items } from '../../../../both/collections/administration/item.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication garnishFood with creation user condition
 * @param {String} _userId
 */
Meteor.publish('garnishFood', function (_userId: string) {
    check(_userId, String);
    return GarnishFoodCol.collection.find({ creation_user: _userId });
});

/**
 * Meteor publication return garnish food with restaurant condition
 * @param {string} _restaurantId
 */
Meteor.publish('garnishFoodByRestaurant', function (_restaurantId: string) {
    check(_restaurantId, String);
    return GarnishFoodCol.collection.find({ 'restaurants.restaurantId': { $in: [_restaurantId] }, is_active: true });
});

/**
 * Meteor publication return garnish food by itemId  condition
 * @param {string}
 */
Meteor.publish('garnishesByItem', function (_itemId: string) {
    check(_itemId, String);
    var item = Items.collection.findOne({ _id: _itemId, garnishFoodIsAcceped: true });
    return GarnishFoodCol.collection.find({ _id: { $in: item.garnishFood } });
});