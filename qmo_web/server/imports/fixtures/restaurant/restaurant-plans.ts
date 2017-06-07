import { RestaurantPlan } from '../../../../both/models/restaurant/restaurant-plan.model';
import { RestaurantPlans } from '../../../../both/collections/restaurant/restaurant-plan.collection';

export function loadRestaurantPlans() {
    if (RestaurantPlans.find().cursor.count() === 0) {
        const restaurantPlans: RestaurantPlan[] = [
            { _id: '100', 
              isActive: true, 
              planCode: 'plan_one_iur', 
              minTableNumber: 1, 
              maxTableNumber: 20,
              price: [
                  {
                      country: '1900',
                      price: 45000
                  }
              ] },
            { _id: '200', 
              isActive: true, 
              planCode: 'plan_two_iur', 
              minTableNumber: 21, 
              maxTableNumber: 50,
              price: [
                {
                    country: '1900',
                    price: 62000
                }
              ] },
            { _id: '300', 
              isActive: true, 
              planCode: 'plan_three_iur', 
              minTableNumber: 51,
              maxTableNumber: null,
              price: [
                {
                    country: '1900',
                    price: 84000
                }
              ]
            }
        ];

        restaurantPlans.forEach((restaurantPlan: RestaurantPlan) => {
            RestaurantPlans.insert(restaurantPlan);
        });
    }
}