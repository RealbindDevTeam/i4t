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
import { CallsComponent } from "./web/waiter/calls/calls.component";
import { NotFoundWebComponent } from './web/auth/notfound.web.component';
import { MeteorObservable } from 'meteor-rxjs';
import { CustomerGuard } from './web/auth/navigation/customer-guard.service';
import { AdminGuard } from './web/auth/navigation/admin-guard.service';
import { WaiterGuard } from './web/auth/navigation/waiter-guard.service';
import { SupervisorGuard } from './web/auth/navigation/supervisor-guard.service';
import { ChefGuard } from './web/auth/navigation/chef-guard.service';
import { CashierGuard } from './web/auth/navigation/cashier-guard.service';
import { SuperChefGuard } from './web/auth/navigation/super-chef-guard.service';
import { PaymentsComponent } from './web/customer/payments/payments.component';
import { MonthlyPaymentComponent } from './web/payment/monthly-payment/monthly-payment.component';
import { SupervisorDashboardComponent } from './web/supervisor-dashboard/supervisor-dashboard.component';
import { MonthlyConfigComponent } from './web/restaurant/monthly-config/monthly-config.component';
import { ColombiaOrderInfoComponent } from './web/customer/payments/country-payment/colombia-payment/colombia-order-info/colombia-order-info.component';
import { OrderPaymentTranslateComponent } from './web/customer/payments/order-payment-translate/order-payment-translate.component';
import { ColombiaPayInfoComponent } from './web/customer/payments/country-payment/colombia-payment/colombia-pay-info/colombia-pay-info.component';
import { CustomerPaymentsHistoryComponent } from './web/customer/settings/customer-payments-history/customer-payments-history.component';

export const routes: Route[] = [
    {
        path: 'app', component: LayoutComponent, canActivateChild: ['canActivateForLoggedIn'], children: [
            //{ path : '', redirectTo : 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent, canActivate: [SuperChefGuard] },
            { path: 'settings', component: SettingsWebComponent },
            { path: 'collaborators', component: CollaboratorsComponent, canActivate: [SupervisorGuard] },
            { path: 'collaborators-register', component: CollaboratorsRegisterComponent, canActivate: [SupervisorGuard] },
            { path: 'sections', component: SectionComponent, canActivate: [SupervisorGuard] },
            { path: 'categories', component: CategoryComponent, canActivate: [SupervisorGuard] },
            { path: 'subcategories', component: SubcategoryComponent, canActivate: [SupervisorGuard] },
            { path: 'additions', component: AdditionComponent, canActivate: [SupervisorGuard] },
            { path: 'promotions', component: PromotionComponent, canActivate: [SupervisorGuard] },
            { path: 'garnishFood', component: GarnishFoodComponent, canActivate: [SupervisorGuard] },
            { path: 'items', component: ItemComponent, canActivate: [SupervisorGuard] },
            { path: 'itemsCreation', component: ItemCreationComponent, canActivate: [SupervisorGuard] },
            { path: 'restaurant', component: RestaurantComponent, canActivate: [SupervisorGuard] },
            { path: 'restaurantRegister', component: RestaurantRegisterComponent, canActivate: [AdminGuard] },
            { path: 'restaurantEdition', component: RestaurantEditionComponent, canActivate: [AdminGuard] },
            { path: 'tables', component: TableComponent, canActivate: [SupervisorGuard] },
            { path: 'orders', component: OrdersComponent, canActivate: [CustomerGuard] },
            { path: 'itemsEnable', component: ItemEnableComponent, canActivate: [SuperChefGuard] },
            { path: 'waiter-call', component: WaiterCallComponent, canActivate: [CustomerGuard] },
            { path: 'chefOrders', component: OrderAttentionComponent, canActivate: [ChefGuard] },
            { path: 'calls', component: CallsComponent, canActivate: [WaiterGuard] },
            { path: 'payments', component: PaymentsComponent, canActivate: [CustomerGuard] },
            { path: 'monthly_invoice', component: MonthlyPaymentComponent, canActivate: [AdminGuard]},
            { path: 'dashboards', component: SupervisorDashboardComponent, canActivate: [SupervisorGuard]},
            { path: 'monthly-config', component: MonthlyConfigComponent, canActivate: [AdminGuard]},
            { path: 'colOrdersInfo', component: ColombiaOrderInfoComponent, canActivate: [CustomerGuard] },
            { path: 'OrdersTranslate', component: OrderPaymentTranslateComponent, canActivate: [CustomerGuard] },
            { path: 'colPayInfo', component: ColombiaPayInfoComponent, canActivate: [CustomerGuard] },          
            { path: 'customer-payments-history', component: CustomerPaymentsHistoryComponent, canActivate: [CustomerGuard] }            
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
