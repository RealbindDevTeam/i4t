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
import { NotFoundWebComponent } from './web/auth/notfound.web.component';
import { MeteorObservable } from 'meteor-rxjs';
import { CustomerGuard } from './web/auth/navigation/customer-guard.service';

export const routes: Route[] = [
    {
        path: 'app', component: LayoutComponent, children: [
            //{ path : '', redirectTo : 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent},
            { path: 'settings', component: SettingsWebComponent },
            { path: 'collaborators', component: CollaboratorsComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'collaborators-register', component: CollaboratorsRegisterComponent, canActivate: ['validAdminOrSupervisor'] },  //sup-adm
            { path: 'sections', component: SectionComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'categories', component: CategoryComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'subcategories', component: SubcategoryComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'additions', component: AdditionComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'promotions', component: PromotionComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'garnishFood', component: GarnishFoodComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'items', component: ItemComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'itemsCreation', component: ItemCreationComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'restaurant', component: RestaurantComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'restaurantRegister', component: RestaurantRegisterComponent, canActivate: ['validAdmin'] }, //adm
            { path: 'restaurantEdition', component: RestaurantEditionComponent, canActivate: ['validAdmin'] }, //adm
            { path: 'tables', component: TableComponent, canActivate: ['validAdminOrSupervisor'] }, //sup-adm
            { path: 'orders', component: OrdersComponent, canActivate: [CustomerGuard] },
            { path: 'itemsEnable', component: ItemEnableComponent, canActivate: ['validChef'] },
            { path: 'waiter-call', component: WaiterCallComponent, canActivate: [CustomerGuard] },
            { path: 'chefOrders', component: OrderAttentionComponent, canActivate: ['validChef'] }
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
},
{
    provide: 'validAdmin',
    useValue: () => {
        return MeteorObservable.call('validateAdmin');
    }
},
{
    provide: 'validWaiter',
    useValue: () => {
        return MeteorObservable.call('validateWaiter');
    }
},
{
    provide: 'validCashier',
    useValue: () => {
        return MeteorObservable.call('validateCashier');
    }
},
{
    provide: 'validCustomer',
    useValue: () => {
        return MeteorObservable.call('validateCustomer');
    }
},
{
    provide: 'validChef',
    useValue: () => {
        return MeteorObservable.call('validateChef');
    }
},
{
    provide: 'validAdminOrSupervisor',
    useValue: () => {
        return MeteorObservable.call('validateAdminOrSupervisor');
    }
}
];
