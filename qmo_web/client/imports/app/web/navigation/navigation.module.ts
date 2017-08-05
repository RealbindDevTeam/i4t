import {NgModule, ModuleWithProviders} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from '@angular/material';
import { HttpModule, Http } from '@angular/http';
import {SidenavComponent} from './sidenav/sidenav.component';
import {TopnavComponent} from './topnav/topnav.component';
import {NavigationService} from './navigation.service';
import {SidenavItemComponent} from './sidenav/sidenav-item/sidenav-item.component';
import {FooterComponent} from './footer/footer.component';
import {LayoutComponent} from './layout/layout.component';
import { TranslateModule, TranslateStaticLoader, TranslateLoader } from 'ng2-translate';
import {CustomerMenuComponent, WaiterMenuComponent, ChefMenuComponent} from './menu-partials';
import { UserLanguageService } from '../../shared/services/user-language.service';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, '/i18n', '.json');
}

@NgModule({
  imports : [
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      })],
  declarations : [SidenavComponent, 
                  TopnavComponent, 
                  SidenavItemComponent, 
                  FooterComponent, 
                  LayoutComponent,
                  CustomerMenuComponent,
                  WaiterMenuComponent,
                  ChefMenuComponent],
  exports : [SidenavComponent, 
             TopnavComponent, 
             FooterComponent, 
             LayoutComponent,
             CustomerMenuComponent,
             WaiterMenuComponent,
             ChefMenuComponent]
})
export class NavigationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule : NavigationModule,
      providers : [NavigationService,UserLanguageService]
    };
  }
}

