import { Meteor } from 'meteor/meteor';
import { RestaurantPlan } from '../../../../both/models/restaurant/restaurant-plan.model';
import { RestaurantPlans } from '../../../../both/collections/restaurant/restaurant-plan.collection';

/**
 * Meteor publications for get all restaurant plans
*/
Meteor.publish('getPlans', function () {
    return RestaurantPlans.collection.find({ isActive: true });
});