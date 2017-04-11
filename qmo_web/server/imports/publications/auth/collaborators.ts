import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Users } from '../../../../both/collections/auth/user.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { User } from '../../../../both/models/auth/user.model';
import { UserDetail } from '../../../../both/models/auth/user-detail.model';


Meteor.publish('getUsersDetailsForRestaurant', function (_restaurant_work : string) {
    if(_restaurant_work){
        return UserDetails.find({restaurant_work: _restaurant_work});
    }
});

Meteor.publish( 'getUsersByRestaurant', function( _restaurant_work:string ){
    if(_restaurant_work){
        let _lUserDetails: string[] = [];
        check( _restaurant_work,String );
        
        UserDetails.collection.find( { restaurant_work: _restaurant_work } ).fetch().forEach( ( usdet ) => {
            _lUserDetails.push( usdet.user_id );
        });
        return Users.find( { _id: { $in: _lUserDetails }} );
    }
});