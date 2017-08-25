import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
  goToRoute( _route : string){
    this._router.navigate([_route]);
  }
}

/**
 * CustomerMenuComponent chield
 */
@Component({
  selector: 'c-customer-menu',
  template : `  <button md-icon-button id="menu-toggler" (click)="goToRoute('/app/orders')">
                    <md-icon>restaurant_menu</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" (click)="goToRoute('/app/payments')">
                    <md-icon>local_atm</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" (click)="goToRoute('/app/waiter-call')">
                    <md-icon>record_voice_over</md-icon>
                </button>`
})
export class CustomerMenuComponent extends RoutingClass {
  /**
   * CustomerMenuComponent Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router){
    super(_router);
  }
}

/**
 * WaiterMenuComponent chield
 */
@Component({
  selector: 'c-waiter-menu',
  template : `  <button md-icon-button id="menu-toggler" (click)="goToRoute('/app/calls')">
                    <md-icon>restaurant_menu</md-icon>
                </button>`
})
export class WaiterMenuComponent extends RoutingClass {
  /**
   * WaiterMenuComponent Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router){
    super(_router);
  }
}

/**
 * ChefMenuComponent chield
 */
@Component({
  selector: 'c-chef-menu',
  template : `  <button md-icon-button id="menu-toggler" (click)="goToRoute('/app/chefOrders')">
                    <md-icon>restaurant_menu</md-icon>
                </button>
                <button md-icon-button id="menu-toggler" (click)="goToRoute('/app/itemsEnable')">
                    <md-icon>view_list</md-icon>
                </button>`
})
export class ChefMenuComponent extends RoutingClass {
  /**
   * ChefMenuComponent Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router){
    super(_router);
  }
}
