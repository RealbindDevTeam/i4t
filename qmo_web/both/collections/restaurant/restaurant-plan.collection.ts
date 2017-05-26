import { MongoObservable } from 'meteor-rxjs';
import { RestaurantPlan } from '../../models/restaurant/restaurant-plan.model';
import { Meteor } from 'meteor/meteor';

export const RestaurantPlans = new MongoObservable.Collection<RestaurantPlan>('restaurant_plans');