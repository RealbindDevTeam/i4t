import { Component, NgZone,OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MdDialog } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AlertConfirmComponent } from '../../../web/general/alert-confirm/alert-confirm.component';
import { Invoice } from '../../../../../../both/models/restaurant/invoice.model';
import { Invoices } from '../../../../../../both/collections/restaurant/invoice.collection';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { UserLanguageService } from '../../../shared/services/user-language.service';

import template from './invoices-download.component.html';
import style from './invoices-download.component.scss';

let jsPDF = require('jspdf');

@Component({
  selector: 'invoices-download-page',
  template,
  styles: [ style ]
})
export class InvoicesDownloadPage implements OnInit, OnDestroy {
  
  private _user = Meteor.userId();
  
  private _restaurantsSubscription : Subscription;
  private _invoicesSubscription    : Subscription;
  public _dialogRef                : MdDialogRef<any>;

  private _restaurantsFilter      : Observable<Restaurant[]>;
  private _invoices               : Observable<Invoice[]>;
  
  private titleMsg                : string;
  private btnAcceptLbl            : string;
  private _thereAreRestaurants    : boolean = true;
  private _initDate               : any;
  private _endDate                : any;

  constructor(public _dialog: MdDialog,
              private _translate: TranslateService,
              private _ngZone: NgZone,
              private _userLanguageService: UserLanguageService){
    _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
    _translate.setDefaultLang( 'en' );
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this.removeSubscriptions();
    this._restaurantsSubscription = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
      this._ngZone.run( () => {
          this._restaurantsFilter = Restaurants.find({}).zone();
          let idsRestaurants : string[] = [];
          let restaurants = Restaurants.collection.find({});
          if(restaurants){
            restaurants.fetch().forEach( ( restaurant ) => {
              idsRestaurants.push(restaurant._id);
            });
            if (idsRestaurants) {
              this._invoicesSubscription = MeteorObservable.subscribe('getInvoicesByRestaurantIds', idsRestaurants).subscribe();
            }
          }
          this._restaurantsFilter.subscribe( () => { this.countRestaurants(); });
      });
    });
  }

  /**
   * Validate if restaurants exists
   */
  countRestaurants(): void {
    Restaurants.collection.find({}).count() > 0 ? this._thereAreRestaurants = true : this._thereAreRestaurants = false;
  }

  /**
   * Change Restaurant Filter
   * @param {string} _pRestaurantId 
   */
  changeRestaurantFilter (_pRestaurantId : string ) {
    if ( _pRestaurantId !== 'All' ) {
      console.log('--> _initDate: ' + this._initDate);
      console.log('--> _endDate:  ' + this._endDate);
      this._invoices = Invoices.find({ restaurant_id : _pRestaurantId, creation_date : { $gte: ISODate("2017-10-15T00:00:00.000Z"), $lt: ISODate("2017-10-18T00:00:00.000Z") }}).zone();
    } else {
      this._invoices = null;
    }
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
     * Generate Invoice pdf
     * @param { Invoice } _pInvoice 
     */
    invoiceGenerate( _pInvoice : Invoice ) {
      if( !Meteor.userId() ){
          var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
          this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
          return;
      }

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
      //TODO Invoice number
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
      pdf.save('9811261128-' + this.dateFormater(_pInvoice.creation_date) +'.pdf');
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
    * This function open de error dialog according to parameters 
    * @param {string} title
    * @param {string} subtitle
    * @param {string} content
    * @param {string} btnCancelLbl
    * @param {string} btnAcceptLbl
    * @param {boolean} showBtnCancel
    */
    openDialog(title: string, subtitle: string, content: string, btnCancelLbl: string, btnAcceptLbl: string, showBtnCancel: boolean) {
      
      this._dialogRef = this._dialog.open(AlertConfirmComponent, {
        disableClose: true,
        data: {
          title: title,
          subtitle: subtitle,
          content: content,
          buttonCancel: btnCancelLbl,
          buttonAccept: btnAcceptLbl,
          showBtnCancel: showBtnCancel
        }
      });
      this._dialogRef.afterClosed().subscribe(result => {
          this._dialogRef = result;
          if (result.success) {

          }
      });
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
   * Allow add top to pdf page
   * @param { number } _pY 
   * @param { number } _pAdd 
   */
  calculateY( _pY : number, _pAdd : number ) : number{
    _pY = _pY + _pAdd;
    return _pY;
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
   * Remove all subscriptions
   */
  removeSubscriptions():void{
    if( this._restaurantsSubscription ){ this._restaurantsSubscription.unsubscribe(); }
    if( this._invoicesSubscription ){ this._invoicesSubscription.unsubscribe(); }
  }

  ngOnDestroy(){
    this.removeSubscriptions();
  }

}