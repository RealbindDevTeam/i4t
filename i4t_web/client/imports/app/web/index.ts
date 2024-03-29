import { AppComponent } from './app.component';
import { DashboardComponent } from './administrator/dashboard/dashboard.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SectionComponent } from './administrator/menu/sections/section/section.component';
import { SignupWebComponent } from './auth/signup/signup.web.component';
import { SigninWebComponent } from './auth/signin/signin.web.component';
import { CategoryComponent } from './administrator/menu/categories/categories/categories.component';
import { SubcategoryComponent } from './administrator/menu/subcategories/subcategories/subcategories.component';
import { AdditionComponent } from './administrator/menu/additions/addition/addition.component';
import { GarnishFoodComponent } from './administrator/menu/garnish-food/garnish-food/garnish-food.component';
import { OrdersComponent } from './customer/orders/order/order.component';
import { TableComponent } from './administrator/administration/tables/table/table.component';
import { RestaurantRegisterComponent } from './administrator/administration/restaurant/register/restaurant-register.component';
import { SettingsWebComponent } from './settings/settings/settings.web.component';
import { ChangeEmailWebComponent } from './settings/modal-dialog/change-email/change-email.web.component';
import { ChangePasswordWebComponent } from './settings/modal-dialog/change-password/change-password.web.component';
import { RestaurantComponent } from './administrator/administration/restaurant/restaurant/restaurant.component';
import { GarnishFoodEditComponent } from './administrator/menu/garnish-food/garnish-food-edit/garnish-food-edit.component';
import { AdditionEditComponent } from './administrator/menu/additions/addition-edit/addition-edit.component';
import { CategoriesEditComponent } from './administrator/menu/categories/categories-edit/categories-edit.component';
import { SubcategoryEditComponent } from './administrator/menu/subcategories/subcategories-edit/subcategories-edit.component';
import { SectionEditComponent } from './administrator/menu/sections/section-edit/section-edit.component';
import { ItemCreationComponent } from './administrator/menu/items/creation/item-creation.component';
import { RecoverWebComponent } from './auth/recover-password/recover/recover.web.component';
import { ResetPasswordWebComponent } from './auth/reset-password/reset-password.web.component';
import { GoToStoreComponent } from './auth/go-to-store/go-to-store.component';
import { CollaboratorsComponent } from './administrator/administration/collaborators/collaborators/collaborators.component';
import { CollaboratorsRegisterComponent } from './administrator/administration/collaborators/register/collaborators-register.component';
import { ItemComponent } from './administrator/menu/items/item/item.component';
import { ItemEditionComponent } from './administrator/menu/items/edition/item-edition.component';
import { RestaurantEditionComponent } from './administrator/administration/restaurant/edition/restaurant-edition.component';
import { IurestScheduleComponent } from './general/schedule/schedule.component';
import { CollaboratorsEditionComponent } from './administrator/administration/collaborators/edition/collaborators-edition.component';
import { RestaurantInfoComponent } from './administrator/administration/restaurant/info/restaurant-info.component';
import { OrderNavigationService } from './services/navigation/order-navigation.service';
import { OrderMenuOptionComponent } from './customer/orders/order-navigation/order-menu-option.component';
import { OrderCreateComponent } from './customer/orders/order-create/order-create.component';
import { OrdersListComponent } from './customer/orders/order-list/order-list.component';
import { ItemEnableComponent } from './administrator/menu/items/enable/items-enable.component';
import { WaiterCallComponent } from './customer/waiter-call/waiter-call.component';
import { OrderAttentionComponent } from './chef/order-attention/order-attention.component';
import { CallsComponent } from './waiter/calls/calls/calls.component';
import { CallCloseConfirmComponent } from './waiter/calls/call-close-confirm/call-close-confirm.component';
import { NotFoundWebComponent } from './auth/notfound/notfound.web.component';
import { IurestSliderComponent } from './general/slider/slider.component';
import { PaymentsComponent } from './customer/payments/payments/payments.component';
import { ColombiaPaymentComponent } from './customer/payments/country-payment/colombia-payment/colombia-payment.component';
import { OrderPaymentTranslateComponent } from './customer/payments/order-payment-translate/order-payment-translate.component';
import { OrderToTranslateComponent } from './customer/payments/order-payment-translate/order-to-translate/order-to-translate.component';
import { CreateConfirmComponent } from './administrator/administration/restaurant/register/create-confirm/create-confirm.component';
import { MonthlyPaymentComponent } from './administrator/payment/monthly-payment/monthly-payment.component';
import { PaymentConfirmComponent } from './waiter/calls/payment-confirm/payment-confirm.component';
import { SupervisorDashboardComponent } from './supervisor/dashboard/supervisor-dashboard.component';
import { MonthlyConfigComponent } from './administrator/administration/restaurant/monthly-config/monthly-config/monthly-config.component';
import { RestaurantListComponent } from './administrator/administration/restaurant/monthly-config/restaurant-list/restaurant-list.component';
import { EnableDisableComponent } from './administrator/administration/restaurant/monthly-config/enable-disable/enable-disable.component';
import { DisableConfirmComponent } from './administrator/administration/restaurant//monthly-config/disable-confirm/disable-confirm.component';
import { SendOrderConfirmComponent } from './waiter/calls/send-order-confirm/send-order-confirm.component';
import { ColombiaOrderInfoComponent } from './customer/payments/country-payment/colombia-payment/colombia-order-info/colombia-order-info.component';
import { PayuPaymentFormComponent } from './administrator/payment/payu-payment-form/payu-payment-form.component';
import { PaymentHistoryComponent } from './administrator/payment/payment-history/payment-history.component';
import { ReactivateRestaurantComponent } from './administrator/payment/reactivate-restaurant/reactivate-restaurant.component';
import { ColombiaPayInfoComponent } from './customer/payments/country-payment/colombia-payment/colombia-pay-info/colombia-pay-info.component';
import { CcPaymentConfirmComponent } from './administrator/payment/payu-payment-form/cc-payment-confirm/cc-payment-confirm.component';
import { TrnResponseConfirmComponent } from './administrator/payment/payu-payment-form/transaction-response-confirm/trn-response-confirm.component';
import { VerifyResultComponent } from './administrator/payment/payment-history/verify-result/verify-result.component';
import { CustomerPaymentsHistoryComponent } from './customer/payments-history/customer-payments-history.component';
import { AdminSignupComponent } from './auth/admin-signup/admin-signup.component';
import { AlertConfirmComponent } from './general/alert-confirm/alert-confirm.component';
import { UserLanguageService } from './services/general/user-language.service';
import { ItemEnableSupComponent } from './supervisor/items-enable/items-enable-sup.component';
import { EnableConfirmComponent } from './administrator/menu/items/enable/enable-confirm/enable-confirm.component';
import { MenuListComponent } from './chef/menu-list/menu-list.component';
import { SupervisorCollaboratorsComponent } from './supervisor/collaborators/collaborators/supervisor-collaborators.component';
import { SupervisorCollaboratorsEditionComponent } from './supervisor/collaborators/edition/supervisor-collaborators-edition.component';
import { SupervisorCollaboratorsRegisterComponent } from './supervisor/collaborators/register/supervisor-collaborators-register.component';
import { SupervisorTableComponent } from './supervisor/tables/supervisor-tables.component';
import { RecoverConfirmComponent } from './auth/recover-password/recover-confirm/recover-confirm.component';
import { TableChangeComponent } from './customer/table-change/table-change.component';
import { RestaurantExitComponent } from './customer/restaurant-exit/restaurant-exit.component';
import { RestaurantExitConfirmComponent } from './waiter/calls/restaurant-exit-confirm/restaurant-exit-confirm.component';
import { RestaurantTableControlComponent } from './administrator/administration/tables/table-control/restaurant-table-control.component';
import { TableDetailComponent } from './administrator/administration/tables/table-control/table-detail/table-detail.component';
import { PenalizeCustomerComponent } from './administrator/administration/tables/table-control/table-detail/penalize-customer/penalize-customer.component';
import { SupervisorRestaurantTableControlComponent } from './supervisor/restaurant-table-control/supervisor-restaurant-table-control.component';
import { InvoicesDownloadPage } from './administrator/administration/invoices-download/invoices-download.component';
import { RestaurantLegalityComponent } from './administrator/administration/restaurant/legality/restaurant-legality.component';
import { ColombiaLegalityComponent } from './administrator/administration/restaurant/legality/country-legality/colombia-legality/colombia-legality.component';
import { RestaurantProfileComponent } from './administrator/administration/restaurant/profile/restaurant-profile.component';
import { RestaurantProFileDetailComponent } from './customer/restaurant-profile-detail/restaurant-profile-detail/restaurant-profile-detail.component';
import { ScheduleDetailComponent } from './customer/restaurant-profile-detail/schedule-detail/schedule-detail.component';
import { PaymentPlanInfo } from './auth/payment-plan-info/payment-plan-info.component';
import { ImageService } from './services/general/image.service';
import { PayuPaymentService } from './services/payment/payu-payment.service';

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
    GarnishFoodComponent,
    ItemComponent,
    ItemCreationComponent,
    RestaurantComponent,
    RestaurantRegisterComponent,
    RestaurantEditionComponent,
    RestaurantInfoComponent,
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
    PayuPaymentFormComponent,
    PaymentHistoryComponent,
    ReactivateRestaurantComponent,
    CustomerPaymentsHistoryComponent,
    ColombiaPayInfoComponent,
    AdminSignupComponent,
    ItemEnableSupComponent,
    MenuListComponent,
    SupervisorCollaboratorsComponent,
    SupervisorCollaboratorsRegisterComponent,
    SupervisorTableComponent,
    TableChangeComponent,
    RestaurantExitComponent,
    RestaurantTableControlComponent,
    TableDetailComponent,
    SupervisorRestaurantTableControlComponent,
    InvoicesDownloadPage,
    RestaurantLegalityComponent,
    ColombiaLegalityComponent,
    RestaurantProfileComponent,
    RestaurantProFileDetailComponent
];

export const MODAL_DIALOG_DECLARATIONS = [
    SectionEditComponent,
    ChangeEmailWebComponent,
    ChangePasswordWebComponent,
    GarnishFoodEditComponent,
    AdditionEditComponent,
    CategoriesEditComponent,
    SubcategoryEditComponent,
    RecoverWebComponent,
    ItemEditionComponent,
    CallCloseConfirmComponent,
    OrderToTranslateComponent,
    CreateConfirmComponent,
    PaymentConfirmComponent,
    CollaboratorsEditionComponent,
    DisableConfirmComponent,
    SendOrderConfirmComponent,
    CcPaymentConfirmComponent,
    TrnResponseConfirmComponent,
    VerifyResultComponent,
    AlertConfirmComponent,
    EnableConfirmComponent,
    SupervisorCollaboratorsEditionComponent,
    RecoverConfirmComponent,
    RestaurantExitConfirmComponent,
    PenalizeCustomerComponent,
    ScheduleDetailComponent,
    PaymentPlanInfo
];

export const SERVICES_DECLARATIONS = [
    OrderNavigationService,
    UserLanguageService,
    ImageService,
    PayuPaymentService
]; 