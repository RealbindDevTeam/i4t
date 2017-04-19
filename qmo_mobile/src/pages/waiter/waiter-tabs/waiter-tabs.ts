import { Component, OnInit } from '@angular/core';

import { CallsPage } from '../calls/calls';

@Component({
  templateUrl: 'waiter-tabs.html'
})
export class WaiterTabsPage {
    
    tabCalls: any = CallsPage;

    constructor() {

    }
}