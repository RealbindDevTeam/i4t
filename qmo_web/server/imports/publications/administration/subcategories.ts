import { Meteor } from 'meteor/meteor';
import { Subcategories } from '../../../../both/collections/administration/subcategory.collection';
import { Sections } from '../../../../both/collections/administration/section.collection';
import { Categories } from '../../../../both/collections/administration/category.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication subcategories with creation user condition
 * @param {string} _userId
 */
Meteor.publish( 'subcategories', function( _userId:string ){
    check( _userId, String );
    return Subcategories.collection.find( { creation_user: _userId } );
});

/**
 * Meteor publication return subcategories with restaurant condition
 * @param {string} _restaurantId
 */
Meteor.publish( 'subcategoriesByRestaurant', function( _restaurantId: string ){
    let _sections: string[] = [];
    let _categories: string[] = [];
    check( _restaurantId, String );
    
    Sections.collection.find( { restaurants: { $in: [ _restaurantId ] } } ).fetch().forEach( ( s ) => {
        _sections.push( s._id );
    });
    Categories.collection.find( { section: { $in: _sections } } ).fetch().forEach( ( c ) => {
        _categories.push( c._id );
    });
    return Subcategories.collection.find( { category: { $in: _categories }, is_active: true } );
});