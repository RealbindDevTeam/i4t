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
import { ItemDetailPage } from '../pages/customer/item-detail/item-detail';
import { ModalObservations } from '../pages/customer/item-detail/modal-observations';
import { ItemEditPage } from '../pages/customer/item-edit/item-edit';
import { ModalObservationsEdit } from '../pages/customer/item-edit/modal-observations-edit';
import { WaiterTabsPage } from '../pages/waiter/waiter-tabs/waiter-tabs';
import { CallsPage } from '../pages/waiter/calls/calls';
import { OrdersToDeliveryPage } from '../pages/waiter/orders-to-delivery/orders-to-delivery';
import { IonicStorageModule } from '@ionic/storage';
import { ItemCardComponent } from '../pages/customer/sections/item-card';
import { OrderDetailComponent } from '../pages/customer/orders/order-detail';
import { OrderItemDetailComponent } from '../pages/customer/orders/order-item-detail';

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
    ItemDetailPage,
    ModalObservations,
    ItemEditPage,
    ModalObservationsEdit,
    WaiterTabsPage,
    CallsPage,
    OrdersToDeliveryPage,
    ItemCardComponent,
    OrderDetailComponent,
    OrderItemDetailComponent
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
    ItemDetailPage,
    ModalObservations,
    ItemEditPage,
    ModalObservationsEdit,
    WaiterTabsPage,
    CallsPage,
    OrdersToDeliveryPage,
    ItemCardComponent,
    OrderDetailComponent,
    OrderItemDetailComponent
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    }
  ]
})
export class AppModule { }
