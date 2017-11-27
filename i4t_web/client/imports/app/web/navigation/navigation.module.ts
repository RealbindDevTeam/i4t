import {NgModule, ModuleWithProviders} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import { MatSidenavModule, MatListModule, MatMenuModule, MatToolbarModule, MatProgressBarModule, MatIconModule, MatTooltipModule, MatButtonModule } from '@angular/material';
import {SidenavComponent} from './sidenav/sidenav.component';
import {TopnavComponent} from './topnav/topnav.component';
import {NavigationService} from './navigation.service';
import {SidenavItemComponent} from './sidenav/sidenav-item/sidenav-item.component';
import {FooterComponent} from './footer/footer.component';
import {LayoutComponent} from './layout/layout.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CustomLoader } from '../../shared/utils/custom-loader';
import { HttpClientModule } from '@angular/common/http';
import { ChefMenuComponent} from './menu-partials/chef/chef-menu.component';
import { CustomerMenuComponent } from './menu-partials/customer/customer-menu.component';
import { WaiterMenuComponent } from './menu-partials/waiter/waiter-menu.component';
import { UserLanguageService } from '../../shared/services/user-language.service';

@NgModule({
  imports : [
    CommonModule,
    RouterModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useClass: CustomLoader
      }
    }),
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule
    ],
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

