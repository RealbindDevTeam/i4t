import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatSidenavModule, MatListModule, MatCardModule, MatButtonModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatTabsModule, MatCheckboxModule, MatSliderModule, MatProgressSpinnerModule, MatTooltipModule, MatIconModule, MatToolbarModule, MatMenuModule, MatButtonToggleModule, MatRadioModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';
import { NgxPageScrollModule } from 'ngx-page-scroll';

import { routes } from './app.routes';
import { AppComponent } from './web/app.component';
import { CustomLoader } from './shared/utils/custom-loader';
import { WEB_DECLARATIONS, MODAL_DIALOG_DECLARATIONS, SERVICES_DECLARATIONS } from './web/index';

import { NavigationModule } from './web/navigation/navigation.module';
import { PayuPaymenteService } from './web/payment/payu-payment-service/payu-payment.service';

import { RouteGuard } from './web/auth/navigation/route-guard.service';
import { CustomerGuard } from './web/auth/navigation/customer-guard.service';
import { AdminGuard } from './web/auth/navigation/admin-guard.service';
import { WaiterGuard } from './web/auth/navigation/waiter-guard.service';
import { SupervisorGuard } from './web/auth/navigation/supervisor-guard.service';
import { ChefGuard } from './web/auth/navigation/chef-guard.service';
import { CashierGuard } from './web/auth/navigation/cashier-guard.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    FlexLayoutModule,
    NavigationModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomLoader
      }
    }),
    NgxPageScrollModule,
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
    MatRadioModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCFXGTI9kCa4U7YyMd2USL9LCV_JlQinyw'
    })
  ],
  declarations: [
    ...WEB_DECLARATIONS,
    ...MODAL_DIALOG_DECLARATIONS
  ],
  providers: [
    RouteGuard,
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