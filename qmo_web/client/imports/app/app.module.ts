import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { HttpModule, Http } from '@angular/http';
import { MatSnackBarModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatSidenavModule, MatListModule, MatCardModule, MatButtonModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatTabsModule, MatCheckboxModule, MatSliderModule, MatProgressSpinnerModule, MatTooltipModule, MatIconModule, MatToolbarModule, MatMenuModule, MatButtonToggleModule, MatRadioModule } from '@angular/material';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
//import { AgmCoreModule } from '@agm/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './web/app.web.component';
import { SHARED_DECLARATIONS } from './shared';
import { WEB_DECLARATIONS, MODAL_DIALOG_DECLARATIONS, SERVICES_DECLARATIONS } from './web/index';

import { SharedModule } from './shared/shared.module';
import { NavigationModule } from './web/navigation/navigation.module';
import { ColorService } from './shared/services/color.service';
import { AppConfigOptions } from './app.config.options';

import { CustomerGuard } from './web/auth/navigation/customer-guard.service';
import { AdminGuard } from './web/auth/navigation/admin-guard.service';
import { WaiterGuard } from './web/auth/navigation/waiter-guard.service';
import { SupervisorGuard } from './web/auth/navigation/supervisor-guard.service';
import { ChefGuard } from './web/auth/navigation/chef-guard.service';
import { CashierGuard } from './web/auth/navigation/cashier-guard.service';

import { PayuPaymenteService } from './web/payment/payu-payment-service/payu-payment.service';

const defaultOptions: AppConfigOptions = {
  appTitle: 'iurest',
  openSidenavStyle: 'side',
  closedSidenavStyle: 'icon overlay'
};

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '/i18n/', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    FlexLayoutModule,
    NavigationModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    }),
    SharedModule.forRoot(),
    Ng2PageScrollModule.forRoot(),
    BrowserAnimationsModule,
    MatSnackBarModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatRadioModule
    /*AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBXJSlwWRSHoRiZdqlOfHPqxxDRdqm8_Jk'
    })*/
  ],
  declarations: [
    ...WEB_DECLARATIONS,
    ...MODAL_DIALOG_DECLARATIONS,
    ...SHARED_DECLARATIONS,
  ],
  providers: [
    ColorService,
    { provide: 'AppConfigOptions', useValue: defaultOptions },
    { provide: 'canActivateForLoggedIn', useValue: () => !!Meteor.userId() },
    CustomerGuard,
    AdminGuard,
    WaiterGuard,
    SupervisorGuard,
    ChefGuard,
    CashierGuard,
    PayuPaymenteService,
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    AppComponent,
    ...MODAL_DIALOG_DECLARATIONS
  ]
})
export class AppModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: [SERVICES_DECLARATIONS]
    };
  }
}