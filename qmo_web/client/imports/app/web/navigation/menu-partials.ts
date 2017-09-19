import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../shared/services/user-language.service';

/**
 * RoutingClass parent
 */
export class RoutingClass {

  /**
   * RoutingClass Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router) { }

  /**
   * This method allow the redictection to components
   * @param {string} _route 
   */
  goToRoute(_route: string) {
    this._router.navigate([_route]);
  }
}

/**
 * CustomerMenuComponent chield
 */
@Component({
  selector: 'c-customer-menu',
  template: `  <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.ORDERS' | translate}}" (click)="goToRoute('/app/orders','TOPNAV.ORDERS')">
                    <md-icon>restaurant_menu</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.PAYMENTS' | translate}}" (click)="goToRoute('/app/payments','TOPNAV.PAYMENTS')">
                    <md-icon>local_atm</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.WAITER' | translate}}" (click)="goToRoute('/app/waiter-call','TOPNAV.WAITER')">
                    <md-icon>record_voice_over</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.TABLES' | translate}}" (click)="goToRoute('/app/change-table','TOPNAV.TABLES')">
                    <md-icon>compare_arrows</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.RESTAURANT_EXIT' | translate}}" (click)="goToRoute('/app/exit-table')">
                    <md-icon>exit_to_app</md-icon>
                </button>`
})
export class CustomerMenuComponent {

  @Output()
  menuname: EventEmitter<string> = new EventEmitter<string>();
  /**
   * CustomerMenuComponent Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router,
    private _translate: TranslateService,
    private _userLanguageService: UserLanguageService) {
    //super(_router);
    _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
    _translate.setDefaultLang('en');
  }

  /**
   * This method allow the redictection to components
   * @param {string} _route 
   */
  goToRoute(_route: string, _menuName: string) {
    this._router.navigate([_route]);
    this.menuname.emit(_menuName);
  }
}

/**
 * WaiterMenuComponent chield
 */
@Component({
  selector: 'c-waiter-menu',
  template: `  <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.CALLS' | translate}}" (click)="goToRoute('/app/calls','TOPNAV.CALLS')">
                    <md-icon>restaurant_menu</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.MENU' | translate}}" (click)="goToRoute('/app/menu-list','TOPNAV.MENU')">
                    <md-icon>view_list</md-icon>
                </button>`
})
export class WaiterMenuComponent {

  @Output()
  menuname: EventEmitter<string> = new EventEmitter<string>();

  /**
   * WaiterMenuComponent Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router,
    private _translate: TranslateService,
    private _userLanguageService: UserLanguageService) {
    _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
    _translate.setDefaultLang('en');
  }

  /**
   * This method allow the redictection to components
   * @param {string} _route 
   */
  goToRoute(_route: string, _menuName: string) {
    this._router.navigate([_route]);
    this.menuname.emit(_menuName);
  }
}

/**
 * ChefMenuComponent chield
 */
@Component({
  selector: 'c-chef-menu',
  template: `  <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.ORDERS' | translate}}" (click)="goToRoute('/app/chef-orders','TOPNAV.ORDERS')">
                    <md-icon>restaurant_menu</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" mdTooltip="{{'TOPNAV.MENU' | translate}}" (click)="goToRoute('/app/menu-list','TOPNAV.MENU')">
                    <md-icon>view_list</md-icon>
                </button>`
})
export class ChefMenuComponent {

  @Output()
  menuname: EventEmitter<string> = new EventEmitter<string>();

  /**
   * ChefMenuComponent Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router,
    private _translate: TranslateService,
    private _userLanguageService: UserLanguageService) {

    _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
    _translate.setDefaultLang('en');
  }

  /**
   * This method allow the redictection to components
   * @param {string} _route 
   */
  goToRoute(_route: string, _menuName: string) {
    this._router.navigate([_route]);
    this.menuname.emit(_menuName);
  }
}
