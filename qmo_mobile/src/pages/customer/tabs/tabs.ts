import { Component } from '@angular/core';

import { OrdersPage } from '../orders/orders';
import { PaymentsPage } from '../payments/payments';
import { WaiterCallPage } from '../waiter-call/waiter-call';
import { OptionsPage } from '../options/options';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

    tabOrders: any = OrdersPage;
    tabPayments: any = PaymentsPage;
    tabWaiterCall: any = WaiterCallPage;
    tabOptions: any = OptionsPage;

    constructor() {

    }
}
