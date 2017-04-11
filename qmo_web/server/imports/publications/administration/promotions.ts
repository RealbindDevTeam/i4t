import { Meteor } from 'meteor/meteor';
import { Promotions, PromotionImages } from '../../../../both/collections/administration/promotion.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication promotions with creation user condition
 * @param {string} _userId
 */
Meteor.publish( 'promotions', function( _userId:string ){
    check( _userId, String );
    return Promotions.collection.find( { creation_user: _userId } );
});

/**
 * Meteor publication promotionImages with user Id condition
 * @param {string} _userId
 */
Meteor.publish('promotionImages', function(_userId:string){
    check(_userId,String);
    return PromotionImages.collection.find({user_id:_userId});
});