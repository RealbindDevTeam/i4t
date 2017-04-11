import { Meteor } from 'meteor/meteor';
import { Items, ItemImages } from '../../../../both/collections/administration/item.collection';
import { Sections } from '../../../../both/collections/administration/section.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication items with creation user condition
 * @param {string} _userId
 */
Meteor.publish('items', function (_userId: string) {
    check(_userId, String);
    return Items.collection.find({ creation_user: _userId });
});

/**
 * Meteor publication itemImages with user Id condition
 * @param {string} _userId
 */
Meteor.publish('itemImages', function (_userId: string) {
    check(_userId, String);
    return ItemImages.collection.find({ user_id: _userId });
});

/**
 * Meteor publication return items with restaurant condition
 */
Meteor.publish('itemsByRestaurant', function (_restaurantId: string) {
    let _sections: string[] = [];
    check(_restaurantId, String);

    Sections.collection.find({ restaurants: { $in: [_restaurantId] } }).fetch().forEach((s) => {
        _sections.push(s._id);
    });
    return Items.collection.find({ sectionId: { $in: _sections }, is_active: true });
});

/**
 * Meteor publication return item by id
 */
Meteor.publish('itemById', function( _itemId: string) {
    check(_itemId, String);
    return Items.collection.find({_id : _itemId});
});