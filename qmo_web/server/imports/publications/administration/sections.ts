import { Meteor } from 'meteor/meteor';
import { Sections } from '../../../../both/collections/administration/section.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication section with creation user condition
 * @param {String} _userId
 */
Meteor.publish( 'sections', function( _userId:string ){
    check( _userId, String );
    return Sections.collection.find( { creation_user: _userId, is_active: true } );
});

/**
 * Meteor publication restaurants sections 
 * @param {string} _restaurantId
*/
Meteor.publish( 'sectionsByRestaurant', function( _restaurantId: string ){
    check( _restaurantId, String );
    return Sections.collection.find( { restaurants: { $in: [ _restaurantId ] }, is_active: true } );
});

Meteor.publish('getSections', function () {
    return Sections.find({});
});