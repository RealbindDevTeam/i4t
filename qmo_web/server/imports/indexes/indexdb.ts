import { Restaurants, RestaurantImages, RestaurantImageThumbs } from '../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../both/collections/auth/user-detail.collection';
import { Sections } from '../../../both/collections/administration/section.collection';
import { Categories } from '../../../both/collections/administration/category.collection';
import { Subcategories } from '../../../both/collections/administration/subcategory.collection';
import { Additions } from '../../../both/collections/administration/addition.collection';
import { Items } from '../../../both/collections/administration/item.collection';
import { GarnishFoodCol } from '../../../both/collections/administration/garnish-food.collection';

export function createdbindexes(){

    // Restaurant Collection Indexes
    Restaurants.collection._ensureIndex( { creation_user: 1 } );
    Restaurants.collection._ensureIndex( { name: 1 } );    

    // Restaurant Image Collection Indexes
    RestaurantImages.collection._ensureIndex( { userId: 1 } );
    RestaurantImages.collection._ensureIndex( { restaurantId: 1 } );

    // Restaurant Image Thumb Collection Indexes
    RestaurantImageThumbs.collection._ensureIndex( { userId: 1 } );
    RestaurantImageThumbs.collection._ensureIndex( { restaurantId: 1 } );

    // User Collections Indexes
    UserDetails.collection._ensureIndex( { user_id: 1 } );

    // Section Collection Indexes
    Sections.collection._ensureIndex( { creation_user: 1 } );
    Sections.collection._ensureIndex( { restaurants: 1 } );    

    // Category Collection Indexes
    Categories.collection._ensureIndex( { creation_user: 1 } );
    Categories.collection._ensureIndex( { section: 1 } );    

    // Subcategory Collection Indexes
    Subcategories.collection._ensureIndex( { creation_user: 1 } );
    Subcategories.collection._ensureIndex( { category: 1 } );

    // Addition Collection Indexes
    Additions.collection._ensureIndex( { creation_user: 1 } );
    Additions.collection._ensureIndex( { restaurants: 1 } );    

    // Item Collection Indexes
    Items.collection._ensureIndex( { additionsIsAccepted: 1 } );
    Items.collection._ensureIndex( { garnishFoodIsAcceped: 1 } );

    // GarnishFood Collection Indexes
    GarnishFoodCol.collection._ensureIndex( { creation_user: 1 } );
    GarnishFoodCol.collection._ensureIndex( { restaurants: 1 } );
    
}