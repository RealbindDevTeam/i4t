import { Meteor } from 'meteor/meteor';
import { Categories } from '../../../../both/collections/administration/category.collection';
import { Sections } from '../../../../both/collections/administration/section.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication categories with creation user condition
 * @param {string} _userId
 */
Meteor.publish( 'categories', function( _userId:string ){
    check( _userId, String );
    return Categories.collection.find( { creation_user: _userId } );
});

/**
 * Meteor publication return categories with restaurant condition
 * @param {string} _restaurantId
 */
Meteor.publish( 'categoriesByRestaurant', function ( _restaurantId: string ) {
    let _sections: string[] = [];
    check( _restaurantId, String );
    
    Sections.collection.find( { restaurants: { $in: [ _restaurantId ] } } ).fetch().forEach( ( s ) => {
        _sections.push( s._id );
    });
    return Categories.collection.find( { section: { $in: _sections }, is_active: true } );
});