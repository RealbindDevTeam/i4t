import { Route } from '@angular/router';
import { NgZone } from '@angular/core';
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
import { OrdersToDeliveryComponent } from "./web/waiter/orders-to-delivery/orders-to-delivery.component";
import { CallsComponent } from "./web/waiter/calls/calls.component";
import { NotFoundWebComponent } from './web/auth/notfound.web.component';
import { MeteorObservable } from 'meteor-rxjs';
import { CustomerGuard } from './web/auth/navigation/customer-guard.service';
import { AdminGuard } from './web/auth/navigation/admin-guard.service';
import { WaiterGuard } from './web/auth/navigation/waiter-guard.service';
import { SupervisorGuard } from './web/auth/navigation/supervisor-guard.service';
import { ChefGuard } from './web/auth/navigation/chef-guard.service';
import { CashierGuard } from './web/auth/navigation/cashier-guard.service';

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
        { path : 'chefOrders', component: OrderAttentionComponent },
        { path : 'orders-to-delivery', component: OrdersToDeliveryComponent },
        { path : 'calls', component: CallsComponent }
        ]
    },
    { path: '', component: LandingPageComponent },
    { path: 'signin', component: SigninWebComponent },
    { path: 'signup', component: SignupWebComponent },
    { path: 'reset-password/:tk', component: ResetPasswordWebComponent },
    { path: 'go-to-store', component: GoToStoreComponent },
    { path: '404', component: NotFoundWebComponent },
    { path: '**', redirectTo: '/404' }
];

export const ROUTES_PROVIDERS = [{
    provide: 'canActivateForLoggedIn',
    useValue: () => !!Meteor.userId()
}
];
