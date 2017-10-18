import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MdRadioChange } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../../../shared/services/user-language.service';
import { RestaurantLegality } from '../../../../../../../../../both/models/restaurant/restaurant.model';

import template from './colombia-legality.component.html';
import style from './colombia-legality.component.scss';

@Component({
    selector: 'colombia-legality',
    template,
    styles: [ style ]
})
export class ColombiaLegalityComponent implements OnInit, OnDestroy {

    private _colombiaLegalityForm: FormGroup;
    private _regimeSelected: string;
    private _forcedToInvoiceValue : boolean = false;
    private _showForcedToInvoice : boolean = false;
    private _showGeneralInvoice: boolean = false;
    private _showInvoiceSecondPart: boolean = false;
    private _showInvoiceFinalPart: boolean = false;
    private _bigContributorValue: boolean = false;
    private _showBigContributorDetail: boolean = false;
    private _selfAcceptingValue: boolean = false;
    private _showSeltAcceptingDetail: boolean = false;
    private _showPrefixName: boolean = false;
    private _prefrixValue: boolean = false;

    private _restaurantLegality: RestaurantLegality = { restaurant_id: '' };

    /**
     * ColombiaLegalityComponent Constructor
     * @param {TranslateService} _translate 
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService,
                 private _userLanguageService: UserLanguageService ) {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._colombiaLegalityForm = new FormGroup({
            forced_to_invoice: new FormControl( false ),
            business_name: new FormControl( '', [ Validators.required ] ),
            document: new FormControl( '', [ Validators.required ] ),
            invoice_resolution: new FormControl( '', [ Validators.required ] ),
            invoice_resolution_date: new FormControl( '', [ Validators.required ]),
            prefix: new FormControl( false ),
            prefix_name: new FormControl( '' ),
            numeration_from: new FormControl( '', [ Validators.required ] ),
            numeration_to: new FormControl( '', [ Validators.required ] ),
            is_big_contributor: new FormControl( false ),
            big_contributor_resolution: new FormControl( '' ),
            big_contributor_date: new FormControl( '' ),
            is_self_accepting: new FormControl( false ),
            self_accepting_resolution: new FormControl( '' ),
            self_accepting_date: new FormControl( '' ),
            text_at_the_end: new FormControl( '' )
        });
    }

    /**
     * Evaluate radio changes
     * @param {MdRadioChange} _event 
     */
    radioChange( _event: MdRadioChange ){
        this._colombiaLegalityForm.reset();
        this._restaurantLegality = { restaurant_id: '' };
        if( _event.value === 'regime_co' ){
            this._restaurantLegality.regime = _event.value;
            this._restaurantLegality.forced_to_invoice = true;
            this._restaurantLegality.forced_to_inc = true;
            this._forcedToInvoiceValue = false;
            this._showForcedToInvoice = false;
            this._showGeneralInvoice = true;
            this._showInvoiceSecondPart = true;
            this._showInvoiceFinalPart = true;
            this._bigContributorValue = false;
            this._showBigContributorDetail = false;
            this._selfAcceptingValue = false;
            this._showSeltAcceptingDetail = false;
            this._showPrefixName = false;
            this._prefrixValue = false;
        } else if( _event.value === 'regime_si' ){
            this._restaurantLegality.regime = _event.value;            
            this._restaurantLegality.forced_to_invoice = false;
            this._restaurantLegality.forced_to_inc = false;            
            this._showForcedToInvoice = true;
            this._showGeneralInvoice = false;
            this._showInvoiceSecondPart = false;
            this._showInvoiceFinalPart = false;
            this._bigContributorValue = false;
            this._showBigContributorDetail = false;
            this._selfAcceptingValue = false;
            this._showSeltAcceptingDetail = false;
            this._showPrefixName = false;
            this._prefrixValue = false;
        }
    }

    /**
     * Evaluate forced to invoice changes
     * @param {any} _event
     */
    evaluateForcedToInvoiceCheck( _event: any ){
        if( _event.checked ){
            this._showGeneralInvoice = true;
            this._showInvoiceFinalPart = true;
            this._restaurantLegality.forced_to_invoice = true;
        } else {
            this._restaurantLegality = { restaurant_id: '' };
            this._restaurantLegality.regime = 'regime_si';            
            this._restaurantLegality.forced_to_invoice = false;
            this._restaurantLegality.forced_to_inc = false;    
            this._showGeneralInvoice = false;
            this._showInvoiceFinalPart = false;
            this._restaurantLegality.forced_to_invoice = false;            
        }
    }

    /**
     * Evaluate prefix changes
     * @param {any} _event 
     */
    evaluatePrefixCheck( _event: any ){
        if( _event.checked ){
            this._showPrefixName = true;
            this._restaurantLegality.prefix = true;
        } else {
            this._showPrefixName = false;
            this._restaurantLegality.prefix = false;
        }
    }

    /**
     * Evaluate big contributor changes
     * @param {any} _event 
     */
    evaluateBigContributorCheck( _event: any ){
        if ( _event.checked ){
            this._showBigContributorDetail = true;
            this._restaurantLegality.is_big_contributor = true;
        } else {
            this._showBigContributorDetail = false;
            this._restaurantLegality.is_big_contributor = false;
        }
    }

    /**
     * Evaluate self accepting changes
     * @param {any} _event
     */
    evaluateSelfAcceptingCheck( _event: any ){
        if( _event.checked ){
            this._showSeltAcceptingDetail = true;
        } else {
            this._showSeltAcceptingDetail = false;
        }
    }

    buildColombiaRestaurantLegality():void{
        if( this._restaurantLegality.regime === 'regime_co' ){
            this._restaurantLegality.business_name = this._colombiaLegalityForm.value.business_name;
            this._restaurantLegality.document = this._colombiaLegalityForm.value.document;
            this._restaurantLegality.invoice_resolution = this._colombiaLegalityForm.value.invoice_resolution;
            this._restaurantLegality.invoice_resolution_date = this._colombiaLegalityForm.value.invoice_resolution_date;
            this._restaurantLegality.prefix = this._colombiaLegalityForm.value.prefix;
            if( this._restaurantLegality.prefix ){
                this._restaurantLegality.prefix_name = this._colombiaLegalityForm.value.prefix_name;
            }
            this._restaurantLegality.numeration_from = this._colombiaLegalityForm.value.numeration_from;
            this._restaurantLegality.numeration_to = this._colombiaLegalityForm.value.numeration_to;
            this._restaurantLegality.is_big_contributor = this._colombiaLegalityForm.value.is_big_contributor;
            if( this._restaurantLegality.is_big_contributor ){
                this._restaurantLegality.big_contributor_resolution = this._colombiaLegalityForm.value.big_contributor_resolution;
                this._restaurantLegality.big_contributor_date = this._colombiaLegalityForm.value.big_contributor_date;
            }
            this._restaurantLegality.is_self_accepting = this._colombiaLegalityForm.value.is_self_accepting;
            if( this._restaurantLegality.is_self_accepting ){
                this._restaurantLegality.self_accepting_resolution = this._colombiaLegalityForm.value.self_accepting_resolution;
                this._restaurantLegality.self_accepting_date = this._colombiaLegalityForm.value.self_accepting_date;
            }
            this._restaurantLegality.text_at_the_end = this._colombiaLegalityForm.value.text_at_the_end;
        } else if( this._restaurantLegality.regime === 'regime_si' ){
            if( this._restaurantLegality.forced_to_invoice ){
                this._restaurantLegality.business_name = this._colombiaLegalityForm.value.business_name;
                this._restaurantLegality.document = this._colombiaLegalityForm.value.document;
                this._restaurantLegality.invoice_resolution = this._colombiaLegalityForm.value.invoice_resolution;
                this._restaurantLegality.invoice_resolution_date = this._colombiaLegalityForm.value.invoice_resolution_date;
                this._restaurantLegality.prefix = this._colombiaLegalityForm.value.prefix;
                if( this._restaurantLegality.prefix ){
                    this._restaurantLegality.prefix_name = this._colombiaLegalityForm.value.prefix_name;
                }
                this._restaurantLegality.numeration_from = this._colombiaLegalityForm.value.numeration_from;
                this._restaurantLegality.numeration_to = this._colombiaLegalityForm.value.numeration_to;
                this._restaurantLegality.text_at_the_end = this._colombiaLegalityForm.value.text_at_the_end;
            }
        }
        console.log(this._restaurantLegality);
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){

    }
}