import { RestaurantPlan } from '../../../../both/models/restaurant/restaurant-plan.model';
import { RestaurantPlans } from '../../../../both/collections/restaurant/restaurant-plan.collection';

export function loadRestaurantPlans() {
    if (RestaurantPlans.find().cursor.count() === 0) {
        const restaurantPlans: RestaurantPlan[] = [
            { _id: '1', isActive: true, planCode: 'plan_one_iur', minTableNumber: 0, maxTableNumber: 20 },
            { _id: '2', isActive: true, planCode: 'plan_two_iur', minTableNumber: 21, maxTableNumber: 50 },
            { _id: '3', isActive: true, planCode: 'plan_three_iur', minTableNumber: 51}
        ];

        restaurantPlans.forEach((restaurantPlan: RestaurantPlan) => {
            RestaurantPlans.insert(restaurantPlan);
        });
    }
}