import { NgModule, ErrorHandler } from '@angular/core';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { Http } from '@angular/http';
import { MyApp } from './app.component';
import { InitialComponent } from '../pages/auth/initial/initial';
import { SignupComponent } from '../pages/auth/signup/signup';
import { TstPage } from '../pages/tst/tst';
import { SigninComponent } from '../pages/auth/signin/signin';
import { TabsPage } from '../pages/customer/tabs/tabs';
import { OrdersPage } from '../pages/customer/orders/orders';
import { PaymentsPage } from '../pages/customer/payments/payments';
import { WaiterCallPage } from '../pages/customer/waiter-call/waiter-call';
import { OptionsPage } from '../pages/customer/options/options';
import { SettingsPage } from '../pages/customer/options/settings/settings';
import { ChangeEmailPage } from '../pages/customer/options/settings/change-email/change-email';
import { ChangePasswordPage } from '../pages/customer/options/settings/change-password/change-password';
import { CodeTypeSelectPage } from '../pages/customer/code-type-select/code-type-select';
import { AlphanumericCodePage } from '../pages/customer/alphanumeric-code/alphanumeric-code';
import { SectionsPage } from '../pages/customer/sections/sections';
import { AdditionsPage } from '../pages/customer/sections/additions/additions';
import { ItemDetailPage } from '../pages/customer/item-detail/item-detail';
import { ModalObservations } from '../pages/customer/item-detail/modal-observations';
import { ItemEditPage } from '../pages/customer/item-edit/item-edit';
import { ModalObservationsEdit } from '../pages/customer/item-edit/modal-observations-edit';
import { CallsPage } from '../pages/waiter/calls/calls';
import { IonicStorageModule } from '@ionic/storage';
import { ItemCardComponent } from '../pages/customer/sections/item-card';
import { OrderDetailComponent } from '../pages/customer/orders/order-detail';
import { OrderItemDetailComponent } from '../pages/customer/orders/order-item-detail';
import { ColombiaPaymentsPage } from '../pages/customer/payments/country-payment/colombia-payment/colombia-payment';
import { ModalColombiaPayment } from '../pages/customer/payments/country-payment/colombia-payment/modal-colombia-payment';
import { ColombiaPaymentDetailsPage } from '../pages/customer/payments/country-payment/colombia-payment/colombia-payment-details/colombia-payment-details';
import { ColombiaPaymentItemDetailComponent } from '../pages/customer/payments/country-payment/colombia-payment/colombia-payment-details/colombia-payment-item-detail';
import { OrderPaymentTranslatePage } from '../pages/customer/payments/country-payment/order-payment-translate/order-payment-translate';
import { AddOrderPaymentPage } from '../pages/customer/payments/country-payment/order-payment-translate/add-order-payment/add-order-payment';
import { OrderPaymentDetailComponent } from '../pages/customer/payments/country-payment/order-payment-translate/order-payment-detail';
import { PaymentConfirmPage } from "../pages/waiter/calls/payment-confirm/payment-confirm";
import { PaymentDetailConfirmComponent } from "../pages/waiter/calls/payment-confirm/payment-detail-confirm";
import { ItemDetailPaymentConfirmComponent } from "../pages/waiter/calls/payment-confirm/item-detail-payment-confirm";
import { AdditionEditPage } from "../pages/customer/addition-edit/addition-edit";

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    InitialComponent,
    SignupComponent,
    TstPage,
    TabsPage,
    OrdersPage,
    PaymentsPage,
    WaiterCallPage,
    OptionsPage,
    SettingsPage,
    ChangeEmailPage,
    ChangePasswordPage,
    CodeTypeSelectPage,
    AlphanumericCodePage,
    SigninComponent,
    SectionsPage,
    AdditionsPage,
    ItemDetailPage,
    ModalObservations,
    ItemEditPage,
    ModalObservationsEdit,
    CallsPage,
    ItemCardComponent,
    OrderDetailComponent,
    OrderItemDetailComponent,
    ColombiaPaymentsPage,
    ModalColombiaPayment,
    ColombiaPaymentDetailsPage,
    ColombiaPaymentItemDetailComponent,
    OrderPaymentTranslatePage,
    AddOrderPaymentPage,
    OrderPaymentDetailComponent,
    PaymentConfirmPage,
    PaymentDetailConfirmComponent,
    ItemDetailPaymentConfirmComponent,
    AdditionEditPage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      platforms: {
        android: {
          tabsPlacement: 'top',
          tabsHideOnSubPages: true
        },
        ios: {
          tabsPlacement: 'buttom',
          tabsHideOnSubPages: true
        }
      }
    }),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    IonicStorageModule.forRoot(),
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InitialComponent,
    SignupComponent,
    TstPage,
    TabsPage,
    OrdersPage,
    PaymentsPage,
    WaiterCallPage,
    OptionsPage,
    SettingsPage,
    ChangeEmailPage,
    ChangePasswordPage,
    CodeTypeSelectPage,
    AlphanumericCodePage,
    SigninComponent,
    SectionsPage,
    AdditionsPage,
    ItemDetailPage,
    ModalObservations,
    ItemEditPage,
    ModalObservationsEdit,
    CallsPage,
    ItemCardComponent,
    OrderDetailComponent,
    OrderItemDetailComponent,
    ColombiaPaymentsPage,
    ModalColombiaPayment,
    ColombiaPaymentDetailsPage,
    ColombiaPaymentItemDetailComponent,
    OrderPaymentTranslatePage,
    AddOrderPaymentPage,
    OrderPaymentDetailComponent,
    PaymentConfirmPage,
    PaymentDetailConfirmComponent,
    ItemDetailPaymentConfirmComponent,
    AdditionEditPage
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    }
  ]
})
export class AppModule { }
