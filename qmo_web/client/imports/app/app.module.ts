import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { HttpModule, Http } from '@angular/http';
import { MdSnackBar } from '@angular/material';
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate';
import { Ng2PaginationModule } from 'ng2-pagination';
import { routes } from './app.routes';
import { Ng2PageScrollModule } from 'ng2-page-scroll';
import { AgmCoreModule } from 'angular2-google-maps/core';

import { AppComponent } from './web/app.web.component';
import { SHARED_DECLARATIONS } from './shared';
import { WEB_DECLARATIONS, MODAL_DIALOG_DECLARATIONS, SERVICES_DECLARATIONS } from './web/index';

import { SharedModule } from './shared/shared.module';
import { NavigationModule } from './web/navigation/navigation.module';
import { ColorService } from './shared/services/color.service';
import { AppConfigOptions } from './app.config.options';

const defaultOptions: AppConfigOptions = {
  appTitle : 'QMO',
  openSidenavStyle : 'side',
  closedSidenavStyle : 'icon overlay'
};

let moduleDefinition;

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, '/i18n', '.json');
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
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }),
      SharedModule.forRoot(),
      Ng2PageScrollModule.forRoot(),
      Ng2PaginationModule,
      AgmCoreModule.forRoot({
        apiKey: 'AIzaSyBXJSlwWRSHoRiZdqlOfHPqxxDRdqm8_Jk'
      })
    ],
    declarations: [
      ...WEB_DECLARATIONS,
      ...MODAL_DIALOG_DECLARATIONS,
      ...SHARED_DECLARATIONS,
    ],
    providers: [
      ColorService,
      MdSnackBar,
      {provide : 'AppConfigOptions', useValue : defaultOptions}
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
      ngModule : AppModule,
      providers : [ SERVICES_DECLARATIONS ]
    };
  }
}