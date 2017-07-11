import { AppComponent } from './app.web.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SectionComponent } from './administration/sections/section.component';
import { SignupWebComponent } from './auth/signup.web.component';
import { SigninWebComponent } from './auth/signin.web.component';
import { CategoryComponent } from './administration/categories/categories.component';
import { SubcategoryComponent } from './administration/subcategories/subcategories.component';
import { AdditionComponent } from './administration/additions/addition.component';
import { PromotionComponent } from './administration/promotions/promotion.component';
import { GarnishFoodComponent } from './administration/garnish-food/garnish-food.component';
import { OrdersComponent } from './customer/orders/order.component';
import { TableComponent } from './restaurant/tables/table.component';
import { RestaurantRegisterComponent } from './restaurant/restaurant/restaurant-register/restaurant-register.component';
import { SettingsWebComponent } from './customer/settings/settings.web.component';
import { ModalDialogComponent } from './custom/modal-dialog/modal-dialog.component';
import { ChangeEmailWebComponent } from './customer/settings/modal-dialog/change-email.web.component';
import { ChangePasswordWebComponent } from './customer/settings/modal-dialog/change-password.web.component';
import { RestaurantComponent } from './restaurant/restaurant/restaurant.component';
import { GarnishFoodEditComponent } from './administration/garnish-food/garnish-food-edit/garnish-food-edit.component';
import { AdditionEditComponent } from './administration/additions/additions-edit/addition-edit.component';
import { CategoriesEditComponent } from './administration/categories/categories-edit/categories-edit.component';
import { SubcategoryEditComponent } from './administration/subcategories/subcategories-edit/subcategories-edit.component';
import { SectionEditComponent } from './administration/sections/sections-edit/section-edit.component';
import { PromotionEditComponent } from './administration/promotions/promotions-edit/promotion-edit.component';
import { ItemCreationComponent } from './administration/items/items-creation/item-creation.component';
import { RecoverWebComponent } from './auth/recover-password/recover.web.component';
import { ResetPasswordWebComponent } from './auth/reset-password.web.component';
import { GoToStoreComponent } from './auth/go-to-store/go-to-store.component';
import { CollaboratorsComponent } from './restaurant/collaborators/collaborators.component';
import { CollaboratorsRegisterComponent } from './restaurant/collaborators/collaborators-register/collaborators-register.component';
import { ItemComponent } from './administration/items/item.component';
import { ItemEditionComponent } from './administration/items/items-edition/item-edition.component';
import { RestaurantScheduleComponent } from './restaurant/restaurant/restaurant-schedule/restaurant-schedule.component';
import { RestaurantEditionComponent } from './restaurant/restaurant/restaurant-edition/restaurant-edition.component';
import { RestaurantLocationComponent } from './restaurant/restaurant/restaurant-location/restaurant-location.component';
import { IurestScheduleComponent } from './custom/schedule/schedule.component';
import { CollaboratorsEditionComponent } from './restaurant/collaborators/collaborators-edition/collaborators-edition.component';
import { RestaurantInfoMasterComponent } from './restaurant/restaurant/restaurant-info-master/restaurant-info-master.componet';
import { RestaurantLocationInfoComponent } from './restaurant/restaurant/restaurant-location-info/restaurant-location-info.component';
import { RestaurantInfoDetailComponent } from './restaurant/restaurant/restaurant-info-detail/restaurant-info-detail.component';
import { OrderNavigationService } from './customer/orders/order-navigation/order-navigation.service';
import { OrderMenuOptionComponent } from './customer/orders/order-navigation/order-menu-option.component';
import { OrderCreateComponent } from './customer/orders/order-create/order-create.component';
import { OrdersListComponent } from './customer/orders/order-list/order-list.component';
import { ItemEnableComponent } from './administration/items/items-enable/items-enable.component';
import { WaiterCallComponent } from './customer/waiter-call/waiter-call.component';
import { OrderAttentionComponent } from './chef/order-attention/order-attention.component';
import { CallsComponent } from './waiter/calls/calls.component';
import { CallCloseConfirmComponent } from './waiter/calls/call-close-confirm/call-close-confirm.component';
import { NotFoundWebComponent } from './auth/notfound.web.component';
import { FinancialControlService } from './custom/financial-info/financial-control.service';
import { IurestFinancialFormComponent } from './custom/financial-info/financial-form/financial-form.component';
import { IurestFinancialElementComponent } from './custom/financial-info/financial-element/financial-element.component';
import { IurestSliderComponent } from './custom/slider/slider.component';
import { PaymentsComponent } from './customer/payments/payments.component';
import { ColombiaPaymentComponent } from './customer/payments/country-payment/colombia-payment/colombia-payment.component';
import { OrderPaymentTranslateComponent } from './customer/payments/order-payment-translate/order-payment-translate.component';
import { OrderToTranslateComponent } from './customer/payments/order-payment-translate/order-to-translate/order-to-translate.component';
import { CreateConfirmComponent } from './restaurant/restaurant/restaurant-register/create-confirm/create-confirm.component';
import { MonthlyPaymentComponent } from './payment/monthly-payment/monthly-payment.component';
import { PaymentConfirmComponent } from './waiter/calls/payment-confirm/payment-confirm.component';
import { SupervisorDashboardComponent } from './supervisor-dashboard/supervisor-dashboard.component';
import { MonthlyConfigComponent } from './restaurant/monthly-config/monthly-config.component';
import { RestaurantListComponent } from './restaurant/monthly-config/restaurant-list.component';
import { EnableDisableComponent } from './restaurant/monthly-config/enable-disable.component'; 
import { DisableConfirmComponent } from './restaurant/monthly-config/disable-confirm/disable-confirm.component';
import { SendOrderConfirmComponent } from './waiter/calls/send-order-confirm/send-order-confirm.component';
import { ColombiaOrderInfoComponent } from './customer/payments/country-payment/colombia-payment/colombia-order-info/colombia-order-info.component';
import { ColombiaPayInfoComponent } from './customer/payments/country-payment/colombia-payment/colombia-pay-info/colombia-pay-info.component';

export const WEB_DECLARATIONS = [
    AppComponent,
    DashboardComponent,
    LandingPageComponent,
    SigninWebComponent,
    SignupWebComponent,
    ResetPasswordWebComponent,
    SectionComponent,
    CategoryComponent,
    SubcategoryComponent,
    AdditionComponent,
    PromotionComponent,
    GarnishFoodComponent,
    ItemComponent,
    ItemCreationComponent,
    RestaurantComponent,
    RestaurantRegisterComponent,
    RestaurantEditionComponent,
    RestaurantInfoMasterComponent,
    IurestScheduleComponent,
    TableComponent,
    OrdersComponent,
    SettingsWebComponent,
    CollaboratorsComponent,
    CollaboratorsRegisterComponent,
    GoToStoreComponent,
    OrderMenuOptionComponent,
    OrderCreateComponent,
    OrdersListComponent,
    ItemEnableComponent,
    WaiterCallComponent,
    OrderAttentionComponent,
    CallsComponent,
    NotFoundWebComponent,
    IurestFinancialFormComponent,
    IurestFinancialElementComponent,
    IurestSliderComponent,
    PaymentsComponent,
    ColombiaPaymentComponent,
    OrderPaymentTranslateComponent,
    MonthlyPaymentComponent,
    SupervisorDashboardComponent,
    MonthlyConfigComponent,
    RestaurantListComponent,
    EnableDisableComponent,
    ColombiaOrderInfoComponent,
    ColombiaPayInfoComponent
];

export const MODAL_DIALOG_DECLARATIONS = [
    ModalDialogComponent,
    SectionEditComponent,
    ChangeEmailWebComponent,
    ChangePasswordWebComponent,
    GarnishFoodEditComponent,
    AdditionEditComponent,
    CategoriesEditComponent,
    SubcategoryEditComponent,
    PromotionEditComponent,
    RecoverWebComponent,
    ItemEditionComponent,
    RestaurantLocationComponent,
    RestaurantLocationInfoComponent,
    RestaurantInfoDetailComponent,
    RestaurantScheduleComponent,
    CallCloseConfirmComponent,
    OrderToTranslateComponent,
    CreateConfirmComponent,
    PaymentConfirmComponent,
    CollaboratorsEditionComponent,
    DisableConfirmComponent,
    SendOrderConfirmComponent
];

export const SERVICES_DECLARATIONS = [
    OrderNavigationService,
    FinancialControlService
]; 