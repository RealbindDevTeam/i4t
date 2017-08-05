import { Component, OnInit, OnDestroy, NgZone, Input } from '@angular/core';
import { MeteorObservable } from "meteor-rxjs";
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
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
     * @param {NgZone} _ngZone 
     * @param {TranslateService} _translate 
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _ngZone: NgZone,
                 public _translate: TranslateService, 
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
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


    /**
     * Generate Invoice pdf
     * @param { Invoice } _pInvoice 
     */
    invoiceGenerate( _pInvoice : Invoice ) {
        let heightPage : number = this.calculateHeight(_pInvoice);

        let widthText   : number = 180;
        let x           : number = 105;
        let y           : number = 50;
        let maxLength   : number = 48;
        let alignCenter : string = 'center';
        let alignRight  : string  = 'right';
        let pdf = new jsPDF("portrait", "pt", [209.76,  heightPage]);

        pdf.setFontSize(8);
        let splitBusinessName = pdf.splitTextToSize(_pInvoice.financial_information.business_name, widthText  );
        let splitNit          = pdf.splitTextToSize(_pInvoice.financial_information.nit, widthText);
        let splitAddress      = pdf.splitTextToSize(_pInvoice.financial_information.address, widthText);
        let splitPhone        = pdf.splitTextToSize(_pInvoice.financial_information.phone, widthText);

        let despcriptionTitle = this.itemNameTraduction('DESCRIPTION');
        let quantTitle        = this.itemNameTraduction('PAYMENTS.COLOMBIA.QUANT');
        let valueTitle        = this.itemNameTraduction('VALUE');

        pdf.text( this.itemNameTraduction('PAYMENTS_HISTORY.SOFTWARE_BY_REALBIND'), x, y, alignCenter );
        y = this.calculateY(y, 10);
        pdf.setFontType("bold");
        pdf.text( splitBusinessName, x, y, alignCenter );
        pdf.setFontType("normal");
        if(_pInvoice.financial_information.business_name.length > maxLength){
            y = this.calculateY(y, 20);
        } else {
            y = this.calculateY(y, 10);
        }
        pdf.text( this.itemNameTraduction('FINANCIAL_INFO.COLOMBIA.NIT_LABEL') + ' ' + splitNit, x, y, alignCenter );
        y = this.calculateY(y, 10);
        pdf.text( splitAddress, x, y, alignCenter );
        if(_pInvoice.financial_information.address.length > maxLength){
            y = this.calculateY(y, 20);
        } else {
            y = this.calculateY(y, 10);
        }
        pdf.text( this.itemNameTraduction('PHONE') + ' ' + splitPhone, x, y, alignCenter );
        
        
        y = this.calculateY(y, 30);
        pdf.setFontType("bold");
        pdf.text( this.itemNameTraduction('PAYMENTS_HISTORY.INVOICE_SALE'), 10, y);
        pdf.text( '9811261128', 120, y);
        
        y = this.calculateY(y, 10);
        pdf.setFontType("normal");
        pdf.text( this.itemNameTraduction('PAYMENTS_HISTORY.DATE'), 10, y);
        pdf.text( this.dateFormater(_pInvoice.creation_date), 120, y);

        pdf.setFontType("bold");
        y = this.calculateY(y, 20);
        pdf.text( despcriptionTitle, 10, y );
        pdf.text( quantTitle, 120, y );
        pdf.text( valueTitle, 200, y, alignRight );
        pdf.setFontType("normal");
        
        y = this.calculateY(y, 20);
        _pInvoice.items.forEach( (item) => {
            let splitItemName = pdf.splitTextToSize(item.item_name, 100  );
            pdf.text(  10, y, splitItemName );
            pdf.text( 140, y, item.quantity.toString(), alignRight );
            pdf.text( 200, y, (item.price * item.quantity).toString() + ' ' + _pInvoice.currency, alignRight );
            
            if(item.item_name.length <= 23){
                y = this.calculateY(y, 10);
            } else if(item.item_name.length > 23 && item.item_name.length <= 46){
                y = this.calculateY(y, 20);
            } else {
                y = this.calculateY(y, 30);
            }

            if (item.garnish_food.length > 0) {
                item.garnish_food.forEach( (garnish_food : Object) => {
                    let splitItemGarnishFood = pdf.splitTextToSize( garnish_food['garnish_food_name'], 100 );
                    pdf.text(  10, y, splitItemGarnishFood );
                    pdf.text( 140, y, item.quantity.toString(), alignRight );
                    pdf.text( 200, y, (garnish_food['price'] * item.quantity).toString() + ' ' + _pInvoice.currency, alignRight );
                    
                    if(garnish_food['garnish_food_name'].length <= 23){
                        y = this.calculateY(y, 10);
                    } else if(garnish_food['garnish_food_name'].length > 23 && garnish_food['garnish_food_name'].length <= 46){
                        y = this.calculateY(y, 20);
                    } else {
                        y = this.calculateY(y, 30);
                    }
                });
            }
            
            if (item.additions.length > 0) {
                item.additions.forEach( (addition : Object) => {
                    let splitItemAddition = pdf.splitTextToSize( addition['addition_name'], 100 );
                    pdf.text(  10, y, splitItemAddition );
                    pdf.text( 140, y, item.quantity.toString(), alignRight );
                    pdf.text( 200, y, (addition['price'] * item.quantity).toString() + ' ' + _pInvoice.currency, alignRight );
                    
                    if(addition['addition_name'].length <= 23){
                        y = this.calculateY(y, 10);
                    } else if(addition['addition_name'].length > 23 && addition['addition_name'].length <= 46){
                        y = this.calculateY(y, 20);
                    } else {
                        y = this.calculateY(y, 30);
                    }
                });
            }
        });
        
        _pInvoice.additions.forEach( (addition) => {
            let splitItemAddition = pdf.splitTextToSize( addition.addition_name, 100 );
            pdf.text( 10, y, splitItemAddition );
            pdf.text( 140, y, addition.quantity.toString(), alignRight );
            pdf.text( 200, y, (addition.price * addition.quantity).toString() + ' ' + _pInvoice.currency, alignRight );
            
            if(addition.addition_name.length <= 23){
                y = this.calculateY(y, 10);
            } else if(addition.addition_name.length > 23 && addition.addition_name.length <= 46){
                y = this.calculateY(y, 20);
            } else {
                y = this.calculateY(y, 30);
            }
        });

        y = this.calculateY(y, 30);
        pdf.setFontType("bold");
        pdf.text( 80, y, this.itemNameTraduction('PAYMENTS_HISTORY.SUB_TOTAL') );
        pdf.text( 200, y, (_pInvoice.total_order).toFixed(2) + ' ' + _pInvoice.currency, alignRight );
        pdf.setFontType("normal");

        y = this.calculateY(y, 10);
        pdf.text( 80, y, this.itemNameTraduction('PAYMENTS_HISTORY.BASE_IMPO') );
        pdf.text( 200, y, ((_pInvoice.total_order * 100) / 108).toFixed(2) + ' ' + _pInvoice.currency, alignRight );

        y = this.calculateY(y, 10);
        pdf.text( 80, y, this.itemNameTraduction('PAYMENTS_HISTORY.IMPO') );
        pdf.text( 200, y, (_pInvoice.total_order - ((_pInvoice.total_order * 100) / 108)).toFixed(2) + ' ' + _pInvoice.currency, alignRight );
        
        y = this.calculateY(y, 10);
        pdf.text( 80, y, this.itemNameTraduction('PAYMENTS_HISTORY.TIP') );
        pdf.text( 200, y, (_pInvoice.total_tip).toFixed(2) + ' ' + _pInvoice.currency, alignRight );
        
        y = this.calculateY(y, 10);
        pdf.setFontType("bold");
        pdf.text( 80, y, this.itemNameTraduction('PAYMENTS_HISTORY.TOTAL_TO_PAY') );
        
        y = this.calculateY(y, 10);
        pdf.text( 80, y, this.itemNameTraduction(_pInvoice.pay_method) );
        pdf.text( 200, y, (_pInvoice.total_pay).toFixed(2) + ' ' + _pInvoice.currency, alignRight );
        pdf.setFontType("normal");

        y = this.calculateY(y, 30);
        pdf.text( x, y, this.itemNameTraduction('PAYMENTS_HISTORY.RES_DIAN') + ' ' + '3100000000095678 2016/07/01', alignCenter );
        y = this.calculateY(y, 10);
        pdf.text( x, y, this.itemNameTraduction('PAYMENTS_HISTORY.CONS_FROM') + ' ' + _pInvoice.financial_information.dian_numeration_from, alignCenter );
        y = this.calculateY(y, 10);
        pdf.text( x, y, this.itemNameTraduction('PAYMENTS_HISTORY.CONS_TO') + ' ' + _pInvoice.financial_information.dian_numeration_to, alignCenter );
        
        pdf.setProperties({
            title: this.itemNameTraduction('PAYMENTS_HISTORY.INVOICE_SALE'),
            author: this.itemNameTraduction('PAYMENTS_HISTORY.SOFTWARE_BY_REALBIND'),
        });

        pdf.output('dataurlnewwindow');
    }

    /**
     * Allow add top to pdf page
     * @param { number } _pY 
     * @param { number } _pAdd 
     */
    calculateY( _pY : number, _pAdd : number ) : number{
        _pY = _pY + _pAdd;
        return _pY;
    }

    /**
     * Calculate Invoice pdf height
     * @param { Invoice } _pInvoice 
     */
    calculateHeight( _pInvoice : Invoice ) : number {
        let quantRows  : number = 0;
        let heightPage : number = 340;
        
        quantRows = quantRows + _pInvoice.items.length;
        quantRows = quantRows + _pInvoice.additions.length;
        _pInvoice.items.forEach( (item) => {
            quantRows = quantRows + item.garnish_food.length;
            quantRows = quantRows + item.additions.length;
        });

        heightPage = heightPage + ( quantRows * 10 );

        return heightPage;
    }

    /**
     * Allow return date format
     * @param _pDate 
     */
    dateFormater( _pDate : Date ) : string {
        let dateFormat = (_pDate.getFullYear()) + '/' + 
                         (_pDate.getMonth() + 1 <= 9 ? '0' + (_pDate.getMonth() + 1) : (_pDate.getMonth() + 1))  + '/' + 
                         (_pDate.getDate() <= 9 ? '0' + _pDate.getDate() : _pDate.getDate()) + ' ' +
                         (_pDate.getHours() <= 9 ? '0' + _pDate.getHours() : _pDate.getHours()) + ':' + 
                         (_pDate.getMinutes() <= 9 ? '0' + _pDate.getMinutes() : _pDate.getMinutes());
        return dateFormat;
    }

    /**
     * This function validates if string crop
     * @param { string } _pItemName 
     */
    itemNameCrop( _pItemName : string ) : string{
        if( _pItemName.length > 20 && _pItemName.indexOf(' ') <= 0 ) {
            return _pItemName.substring(1, 20) + '...';
        } else {
            return _pItemName;
        }
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