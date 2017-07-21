import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
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
    constructor(private _ngZone: NgZone,
                public _translate: TranslateService){
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
        let pdf = new jsPDF("portrait", "pt", "a7");
        pdf.setFontSize(8);
        let widthText   : number = 180;
        let x           : number = 105;
        let y           : number = 50;
        let alignCenter : string = 'center';
        let alignRight : string  = 'right';

        let splitBusinessName = pdf.splitTextToSize(_pInvoice.financial_information.business_name, widthText  );
        let splitNit          = pdf.splitTextToSize(_pInvoice.financial_information.nit, widthText);
        let splitAddress      = pdf.splitTextToSize(_pInvoice.financial_information.address, widthText);

        let despcriptionTitle = this.itemNameTraduction('DESCRIPTION');
        let quantTitle        = this.itemNameTraduction('PAYMENTS.COLOMBIA.QUANT');
        let valueTitle        = this.itemNameTraduction('VALUE');

        pdf.text( splitBusinessName, x, y, alignCenter );
        y = this.calculateY(y, 20);
        pdf.text( this.itemNameTraduction('FINANCIAL_INFO.COLOMBIA.NIT_LABEL') + ' ' + splitNit, x, y, alignCenter );
        y = this.calculateY(y, 10);
        pdf.text( splitAddress, x, y, alignCenter );
        
        y = this.calculateY(y, 30);
        pdf.text( despcriptionTitle, 10, y );
        pdf.text( quantTitle, 140, y );
        pdf.text( valueTitle, 200, y, 'right' );
        
        y = this.calculateY(y, 10);
        _pInvoice.items.forEach( (item) => {
            y = this.calculateY(y, 10);
            pdf.text( item.item_name, 10, y.toString() );
            pdf.text( item.quantity, 140, y.toString() );
            //pdf.text( item.price, 200, y.toString(), 'right' );
        });

        
        

        pdf.output('dataurlnewwindow');
    }

    calculateY( _pY : number, _pAdd : number) : number{
        _pY = _pY + _pAdd;
        return _pY;
    }

    /**
   * This function allow translate strings
   * @param {string} _itemName 
   */
    itemNameTraduction(_itemName: string): string {
        var wordTraduced: string;
        this._translate.get(_itemName).subscribe((res: string) => {
        wordTraduced = res;
        });
        return wordTraduced;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this._invoicesHistorySubscription.unsubscribe();
    }
}