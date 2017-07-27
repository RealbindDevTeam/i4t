import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Invoice } from 'qmo_web/both/models/restaurant/invoice.model';

@Component({
    selector: 'payments-history-detail-page',
    templateUrl: 'payments-history-detail.html'
})
export class PaymentsHistoryDetailPage implements OnInit, OnDestroy {
    
    private _invoice : Invoice;
    /**
     * PaymentsHistoryDetailPage constrcutor
     */    
    constructor( public _navParams : NavParams,
                 public _navCtrl   : NavController ){
        this._invoice = this._navParams.get("invoice");
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {

    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy() {

    }
}