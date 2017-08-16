import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersPage } from '../orders/orders';
import { PaymentsPage } from '../payments/payments';
import { WaiterCallPage } from '../waiter-call/waiter-call';
import { OptionsPage } from '../options/options';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit, OnDestroy {

  tabOrders: any = OrdersPage;
  tabPayments: any = PaymentsPage;
  tabWaiterCall: any = WaiterCallPage;
  tabOptions: any = OptionsPage;

  /**
   * TabsPage constructor
   */
  constructor() {
  }

  /**
   * ngOnInit implementation
   */
  ngOnInit() {
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
  }
}
