import { Meteor } from 'meteor/meteor';
import { PaymentMethods } from '../../../../both/collections/general/paymentMethod.collection';
import { Restaurant } from '../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';

/**
 * Meteor publication paymentMethods
 */
Meteor.publish( 'paymentMethods', () => PaymentMethods.find( { isActive: true } ) );

/**
 * Meteor publication return payment methods by current restaurant of the user
 */
Meteor.publish('getPaymentMethodsByUserCurrentRestaurant', function ( _pUserId : string ) {
    let _lUserDetail = UserDetails.findOne({ user_id: _pUserId });
    if(_lUserDetail.current_restaurant){
        let _lRestaurant : Restaurant = Restaurants.findOne({ _id: _lUserDetail.current_restaurant });
        return PaymentMethods.collection.find({_id : {$in : _lRestaurant.paymentMethods }});
    } else {
        return PaymentMethods.collection.find({_id : '0'});
    }
});