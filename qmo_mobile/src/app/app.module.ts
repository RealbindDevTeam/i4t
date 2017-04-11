import { NgModule, ErrorHandler } from '@angular/core';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate/ng2-translate';
import { HttpModule, Http } from '@angular/http';
import { MyApp } from './app.component';
import { InitialComponent } from '../pages/auth/initial/initial';
import { SignupComponent } from '../pages/auth/signup/signup';
import { TstPage } from '../pages/tst/tst';
import { SigninComponent } from '../pages/auth/signin/signin';
import { TabsPage } from '../pages/customer/tabs/tabs';
import { OrdersPage } from '../pages/customer/orders/orders';
import { PaymentsPage } from '../pages/customer/payments/payments';
import { CallWaiterPage } from '../pages/customer/call-waiter/call-waiter';
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
import { IonicStorageModule } from '@ionic/storage';

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
    CallWaiterPage,
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
    ItemEditPage
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
    CallWaiterPage,
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
    ItemEditPage
  ],
  providers: [
    { provide: ErrorHandler, 
      useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
