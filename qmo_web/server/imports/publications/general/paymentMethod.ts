import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { PaymentMethods } from '../../../../both/collections/general/paymentMethod.collection';
import { Restaurant } from '../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../both/collections/restaurant/restaurant.collection';
/**
 * Meteor publication paymentMethods
 */
Meteor.publish( 'paymentMethods', () => PaymentMethods.find( { isActive: true } ) );

/**
 * Meteor publication return restaurant payment methods
 */
Meteor.publish( 'getPaymentMethodsByrestaurantId', function( _pRestaurantId:string ){
    check( _pRestaurantId, String );
    let _lRestaurant: Restaurant = Restaurants.findOne( { _id: _pRestaurantId } );
    if( _lRestaurant ){
        return PaymentMethods.find( { _id: { $in: _lRestaurant.paymentMethods } , isActive: true } );        
    } else{
        return PaymentMethods.find( { isActive: true } );
    }
});