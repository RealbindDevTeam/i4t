import { Meteor } from 'meteor/meteor';
import { Tables } from '../../../../both/collections/restaurant/table.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication tables with user creation condition
 * @param {string} _userId
 */
Meteor.publish('tables', function (_userId: string) {
    check(_userId, String);
    return Tables.collection.find({ creation_user: _userId });
});

/**
 * Meteor publication tables
 * @param {string} _tableId
 */
Meteor.publish('getTableById', function (_tableId: string) {
    check(_tableId, String);
    return Tables.collection.find({ _id: _tableId });
});

/**
 * Meteor publication table by current_table
 */
Meteor.publish('getTableByCurrentTable', function (_userId: string) {
    check(_userId, String);

    var user_detail = UserDetails.collection.findOne({ user_id: _userId });

    return Tables.collection.find({ _id: user_detail.current_table });
});

/**
 * Meteor publication return all tables
 */
Meteor.publish( 'getAllTables', function( ){
    return Tables.collection.find( { } );
});

/**
 * Meteor publication return tables with restaurant condition
 * @param {string} _restaurantId
 */
Meteor.publish( 'getTablesByRestaurant', function( _restaurantId:string ) {
    check( _restaurantId, String );
    return Tables.collection.find( { restaurantId: _restaurantId } );
});