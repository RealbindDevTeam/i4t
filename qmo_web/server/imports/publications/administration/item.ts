import { Meteor } from 'meteor/meteor';
import { Items, ItemImages, ItemImagesThumbs } from '../../../../both/collections/administration/item.collection';
import { Sections } from '../../../../both/collections/administration/section.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../both/models/auth/user-detail.model';
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
    return ItemImages.collection.find({ userId: _userId });
});

/**
 * Meteor publication itemImageThumbs with user Id condition
 * @param {string} _userId
 */
Meteor.publish('itemImageThumbs', function (_userId: string) {
    check(_userId, String);
    return ItemImagesThumbs.collection.find({ userId: _userId });
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
 * Meteor publication return items with user condition
 */
Meteor.publish('itemsByUser', function (_userId: string) {
    let _sections: string[] = [];
    check(_userId, String);
    let _lUserDetail: UserDetail = UserDetails.findOne({ user_id: _userId });
    
    if(_lUserDetail.current_restaurant){
        Sections.collection.find({ restaurants: { $in: [_lUserDetail.current_restaurant] } }).fetch().forEach((s) => {
            _sections.push(s._id);
        });
        return Items.collection.find({ sectionId: { $in: _sections }, is_active: true });
    }
    return;
});

/**
 * Meteor publication return item images with restaurant condition
 */
Meteor.publish('itemImagesByRestaurant', function (_restaurantId: string) {
    let _sections: string[] = [];
    let _items: string [] = [];
    check(_restaurantId, String);

    Sections.collection.find( { restaurants: { $in: [_restaurantId] } } ).fetch().forEach((s) => {
        _sections.push( s._id );
    });
    Items.collection.find( { sectionId: { $in: _sections }, is_active: true } ).fetch().forEach((i) => {
        _items.push( i._id );
    });
    return ItemImages.collection.find( { itemId: { $in: _items } } );
});

/**
 * Meteor publication return item thumbs images with restaurant condition
 */
Meteor.publish('itemImageThumbsByRestaurant', function (_restaurantId: string) {
    let _sections: string[] = [];
    let _items: string [] = [];
    check(_restaurantId, String);

    Sections.collection.find( { restaurants: { $in: [_restaurantId] } } ).fetch().forEach((s) => {
        _sections.push( s._id );
    });
    Items.collection.find( { sectionId: { $in: _sections }, is_active: true } ).fetch().forEach((i) => {
        _items.push( i._id );
    });
    return ItemImagesThumbs.collection.find( { itemId: { $in: _items } } );
});

/**
 * Meteor publication return item thumbs images with user id condition
 */
Meteor.publish('itemImageThumbsByUserId', function (_userId: string) {
    let _sections: string[] = [];
    let _items: string [] = [];
    check(_userId, String);

    let _lUserDetail: UserDetail = UserDetails.findOne({ user_id: _userId });
    if(_lUserDetail.current_restaurant){
        Sections.collection.find( { restaurants: { $in: [_lUserDetail.current_restaurant] } } ).fetch().forEach((s) => {
            _sections.push( s._id );
        });
        Items.collection.find( { sectionId: { $in: _sections }, is_active: true } ).fetch().forEach((i) => {
            _items.push( i._id );
        });
        return ItemImagesThumbs.collection.find( { itemId: { $in: _items } } );
    }
    return;
});

/**
 * Meteor publication return item by id
 */
Meteor.publish('itemById', function( _itemId: string) {
    check(_itemId, String);
    return Items.collection.find({_id : _itemId});
});

/**
 * Meteor publication return items by restaurant work
 * @param {string} _userId
 */
Meteor.publish('getItemsByRestaurantWork', function( _userId: string ){
    check( _userId, String );
    let _lUserDetail: UserDetail = UserDetails.findOne( { user_id: _userId } );
    let _sections: string[] = [];
    
    Sections.collection.find( { restaurants: { $in: [ _lUserDetail.restaurant_work ] } } ).fetch().forEach( ( s ) => {
        _sections.push( s._id );
    });
    return Items.collection.find( { sectionId: { $in: _sections }, is_active: true } );
});

/**
 * Meteor publication return items thumbs by restaurant work
 * @param {string} _userId
 */
Meteor.publish('getItemImageThumbsByRestaurantWork', function( _userId: string ){
    check( _userId, String );
    let _lUserDetail: UserDetail = UserDetails.findOne( { user_id: _userId } );
    let _sections: string[] = [];
    let _items: string[] = [];
    
    Sections.collection.find( { restaurants: { $in: [ _lUserDetail.restaurant_work ] } } ).fetch().forEach( ( s ) => {
        _sections.push( s._id );
    });
    Items.collection.find( { sectionId: { $in: _sections }, is_active: true } ).fetch().forEach( (it) => {
        _items.push( it._id );
    });
    return ItemImagesThumbs.collection.find( { itemId: { $in: _items } } );
});