import { Meteor } from 'meteor/meteor';
import { Additions } from '../../../../both/collections/administration/addition.collection';
import { Items } from '../../../../both/collections/administration/item.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication additions with creation user condition
 * @param {string} _userId
 */
Meteor.publish('additions', function (_userId: string) {
    check(_userId, String);
    return Additions.collection.find({ creation_user: _userId });
});

/**
 * Meteor publication return additions with restaurant condition
 * @param {string} _restaurantId
 */
Meteor.publish('additionsByRestaurant', function (_restaurantId: string) {
    check(_restaurantId, String);
    return Additions.collection.find({ 'restaurants.restaurantId': { $in: [_restaurantId] }, is_active: true });
});

/**
 * Meteor publication return addtions by itemId  condition
 * @param {string} _itemId
*/
Meteor.publish('additionsByItem', function (_itemId: string) {
    check(_itemId, String); 
    var item = Items.collection.findOne({ _id: _itemId, additionsIsAccepted: true });

    if(typeof item !== 'undefined') {
        var aux = Additions.collection.find({ _id: { $in: item.additions } }).fetch();
        return Additions.collection.find({ _id: { $in: item.additions } });
    }else{
        return Additions.collection.find({ _id: { $in: [] } });
    }
});
