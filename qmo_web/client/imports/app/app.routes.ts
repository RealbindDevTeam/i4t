import { Route } from '@angular/router';
import { LayoutComponent } from './web/navigation/layout/layout.component';
import { DashboardComponent } from './web/dashboard/dashboard.component';
import { SectionComponent } from './web/administration/sections/section.component';
import { LandingPageComponent } from './web/landing-page/landing-page.component';
import { SignupWebComponent } from './web/auth/signup.web.component';
import { SigninWebComponent } from './web/auth/signin.web.component';
import { CategoryComponent } from './web/administration/categories/categories.component';
import { SubcategoryComponent } from './web/administration/subcategories/subcategories.component';
import { AdditionComponent } from './web/administration/additions/addition.component';
import { PromotionComponent } from './web/administration/promotions/promotion.component';
import { GarnishFoodComponent } from './web/administration/garnish-food/garnish-food.component';
import { OrdersComponent } from './web/customer/orders/order.component';
import { SettingsWebComponent } from './web/customer/settings/settings.web.component';
import { TableComponent } from './web/restaurant/tables/table.component';
import { RestaurantComponent } from './web/restaurant/restaurant/restaurant.component';
import { RestaurantRegisterComponent } from './web/restaurant/restaurant/restaurant-register/restaurant-register.component';
import { ItemCreationComponent } from './web/administration/items/items-creation/item-creation.component';
import { ResetPasswordWebComponent } from './web/auth/reset-password.web.component';
import { GoToStoreComponent } from './web/auth/go-to-store/go-to-store.component';
import { CollaboratorsComponent } from './web/restaurant/collaborators/collaborators.component';
import { CollaboratorsRegisterComponent } from './web/restaurant/collaborators/collaborators-register/collaborators-register.component';
import { ItemComponent } from './web/administration/items/item.component';
import { RestaurantEditionComponent } from './web/restaurant/restaurant/restaurant-edition/restaurant-edition.component';
import { ItemEnableComponent } from './web/administration/items/items-enable/items-enable.component';
import { WaiterCallComponent } from './web/customer/waiter-call/waiter-call.component';
import { OrderAttentionComponent } from './web/chef/order-attention/order-attention.component';

export const routes: Route[] = [
    { path: 'app', component: LayoutComponent, children: [
        { path : '', redirectTo : 'dashboard', pathMatch: 'full' },
        { path : 'dashboard', component : DashboardComponent },
        { path : 'settings', component: SettingsWebComponent },
        { path : 'collaborators', component: CollaboratorsComponent },
        { path : 'collaborators-register', component: CollaboratorsRegisterComponent },
        { path : 'sections', component : SectionComponent },
        { path : 'categories', component : CategoryComponent },
        { path : 'subcategories', component: SubcategoryComponent },
        { path : 'additions', component: AdditionComponent },
        { path : 'promotions', component: PromotionComponent },
        { path : 'garnishFood', component: GarnishFoodComponent },
        { path : 'items', component: ItemComponent },
        { path : 'itemsCreation', component: ItemCreationComponent },
        { path : 'restaurant', component: RestaurantComponent },
        { path : 'restaurantRegister', component: RestaurantRegisterComponent },
        { path : 'restaurantEdition', component: RestaurantEditionComponent },
        { path : 'tables', component: TableComponent },
        { path : 'orders', component: OrdersComponent },
        { path : 'itemsEnable', component: ItemEnableComponent },
        { path : 'waiter-call', component: WaiterCallComponent },
        { path : 'chefOrders', component: OrderAttentionComponent }
        ]
    },
    { path: '', component: LandingPageComponent },
    { path: 'signin', component: SigninWebComponent },
    { path: 'signup', component: SignupWebComponent },
    { path: 'reset-password/:tk', component: ResetPasswordWebComponent },
    { path: 'go-to-store', component: GoToStoreComponent }
];
