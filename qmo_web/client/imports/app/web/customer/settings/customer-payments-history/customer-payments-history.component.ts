import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from 'rxjs';
import { Invoice } from '../../../../../../../both/models/restaurant/invoice.model';
import { Invoices } from '../../../../../../../both/collections/restaurant/invoice.collection';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';

import template from './customer-payments-history.component.html';
import style from './customer-payments-history.component.scss';

let jsPDF = require('jspdf');

@Component({
    selector: 'iu-customer-payments-history',
    template,
    styles: [ style ]
})
export class CustomerPaymentsHistoryComponent implements OnInit, OnDestroy {

    private _invoicesHistorySubscription : Subscription;
    private _userDetailsSubscription     : Subscription;
    private _restaurantSubscription      : Subscription;

    private _invoices               : any;
    private _showPayments           : boolean = false;

    /**
     * PaymentsHistoryComponent component
     * @param _ngZone 
     */ 
    constructor(private _ngZone: NgZone){
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._invoicesHistorySubscription = MeteorObservable.subscribe('getInvoicesByUserId', Meteor.userId()).subscribe(()=> {
            this._ngZone.run( () => {
                this._invoices = Invoices.find({});
                this._invoices.subscribe(()=> {
                    let _invoicesCount = Invoices.collection.find({}).count();
                    if(_invoicesCount > 0){
                        this._showPayments = true;
                    } else {
                        this._showPayments = false;
                    }
                });
            });
        });
    }

    invoiceGenerate( _pInvoice : Invoice){
        let qr_pdf = new jsPDF("portrait", "mm", "a7");
        qr_pdf.setFontSize(8);
        qr_pdf.text(_pInvoice.financial_information.business_name, 10, 40)
        qr_pdf.output('dataurlnewwindow');

    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._invoicesHistorySubscription.unsubscribe();
    }
}