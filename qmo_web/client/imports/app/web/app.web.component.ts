import {Component, ElementRef, OnInit, HostListener} from '@angular/core';
import {NavigationService} from './navigation/navigation.service';
import {Router, Event, NavigationStart, NavigationEnd} from '@angular/router';
import 'hammerjs';
import { OrderNavigationService } from './customer/orders/order-navigation/order-navigation.service';
import { FinancialControlService } from './custom/financial-info/financial-control.service';
import { UserLanguageService } from '../shared/services/user-language.service';

import template from './app.web.component.html';
import style from './app.web.component.scss';
 
@Component({
  selector: 'app',
  providers: [ OrderNavigationService, FinancialControlService, UserLanguageService ],
  template,
  styles: [ style ]
})
export class AppComponent implements OnInit{
  private pageTitle: string;

  constructor( private _navigation: NavigationService, 
               private _router: Router, 
               private _elementRef: ElementRef, 
               private _orderNavigationService: OrderNavigationService, 
               private _financialControlService: FinancialControlService,
               private _userLanguageService: UserLanguageService ) {}
  
  ngOnInit(){
    this._router.events.subscribe((event: Event) => {
      if(event instanceof NavigationStart) {
        this._navigation.setIsRouteLoading(true);
        this._navigation.setBreadcrumbs(null); // Reset breadcrumbs before route change
        this._navigation.setPageTitle(null); // Reset page title before route change
      } else if(event instanceof NavigationEnd) {
        this._navigation.setCurrentRoute((<NavigationEnd>event).urlAfterRedirects);
        this._navigation.setIsRouteLoading(false);
        let routerOutletComponent: HTMLElement = this._elementRef.nativeElement.getElementsByTagName('app-topnav')[0];
        if(routerOutletComponent) {
          routerOutletComponent.scrollIntoView(); // Scroll back to top after route change
        }
      }
    });
    this._navigation.pageTitle.subscribe(pageTitle => {
      this.pageTitle = pageTitle;
    });
  }

  @HostListener('window:resize', ['$event'])
  private resize($event) {
    // Need this to trigger change detection for screen size changes!
    this._navigation.updateViewport();
  }
}