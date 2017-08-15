import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { HttpModule, Http } from '@angular/http';
import { MdSnackBar } from '@angular/material';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { routes, ROUTES_PROVIDERS } from './app.routes';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
//import { AgmCoreModule } from '@agm/core';
import { ChartModule } from 'angular2-highcharts';

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
import { SuperChefGuard } from './web/auth/navigation/super-chef-guard.service';

import { PayuPaymenteService } from './web/payment/payu-payment-service/payu-payment.service';

const defaultOptions: AppConfigOptions = {
  appTitle: 'QMO',
  openSidenavStyle: 'side',
  closedSidenavStyle: 'icon overlay'
};

let moduleDefinition;

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '/i18n/', '.json');
}

moduleDefinition = {
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MaterialModule,
    FlexLayoutModule,
    NavigationModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    }),
    SharedModule.forRoot(),
    Ng2PageScrollModule.forRoot(),
    NgxPaginationModule,
    ChartModule,
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
    MdSnackBar,
    { provide: 'AppConfigOptions', useValue: defaultOptions },
    ...ROUTES_PROVIDERS,
    CustomerGuard,
    AdminGuard,
    WaiterGuard,
    SupervisorGuard,
    ChefGuard,
    CashierGuard,
    PayuPaymenteService,
    SuperChefGuard
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    AppComponent,
    ...MODAL_DIALOG_DECLARATIONS
  ]
}

@NgModule(moduleDefinition)
export class AppModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AppModule,
      providers: [SERVICES_DECLARATIONS]
    };
  }
}