import { Component, OnInit, OnDestroy } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';

import { InitialComponent } from '../../auth/initial/initial';
import { Invoice } from 'qmo_web/both/models/restaurant/invoice.model';
import { Invoices } from 'qmo_web/both/collections/restaurant/invoice.collection';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { User } from 'qmo_web/both/models/auth/user.model';

@Component({
    selector: 'payments-history-detail-page',
    templateUrl: 'payments-history-detail.html'
})
export class PaymentsHistoryDetailPage implements OnInit, OnDestroy {
    
    private _invoice : Invoice;
    
    constructor( public _navParams : NavParams,
                 public _navCtrl   : NavController ){
        this._invoice = this._navParams.get("invoice");
        console.log(this._invoice);
    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }
}