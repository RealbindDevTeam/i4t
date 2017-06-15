import { Meteor } from 'meteor/meteor';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../both/models/auth/user-detail.model';

Meteor.publish('getUsersDetails', function () {
    return UserDetails.find({});
});


Meteor.publish('getUserDetailsByUser', function (_userId: string) {
    check(_userId, String);
    return UserDetails.find({ user_id: _userId });
});

Meteor.publish('getUserDetailsByCurrentTable', function(_restaurantId : string, _tableId : string) {
    return UserDetails.find({ current_restaurant : _restaurantId, current_table : _tableId });
});