import { Component } from '@angular/core';

import { CallsPage } from '../calls/calls';
import { OrdersToDeliveryPage } from '../orders-to-delivery/orders-to-delivery';

@Component({
  templateUrl: 'waiter-tabs.html'
})
export class WaiterTabsPage {
    
    tabCalls: any = CallsPage;
    tabOrdersToDelivery : any = OrdersToDeliveryPage;

    /**
    * WaiterTabsPage Constructor
    */
    constructor() {

    }
}