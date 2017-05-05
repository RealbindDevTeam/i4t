import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FinancialBase } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-base';
import { FinancialControlService } from '../financial-control.service';

import template from './financial-form.component.html';
import style from './financial-form.component.scss';

@Component({
  selector: 'iu-financialform',
  template,
  styles: [ style ]
})
export class IurestFinancialFormComponent implements OnInit {

  @Input() financialElements: FinancialBase<any>[] = [];
  @Output() restaurantFinancialInfo = new EventEmitter();
  form: FormGroup;
  private financialJSON:Object = {};

  /**
   * FinancialFormComponent Constructor
   * @param {FinancialControlService} _financialControlService 
   */
  constructor( private _financialControlService: FinancialControlService ){

  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit() {
    this.form = this._financialControlService.toFormGroup( this.financialElements );
  }

  /**
   * Set Financial Information and return JSON
   * @param {Object} _event 
   */
  setFinancialInfo( _event: Object ):void{
    let arr:any[] = Object.keys( _event );
    arr.forEach( ( p ) => {
        if( _event[ p ] ){
            this.financialJSON[ p ] = _event[ p ];
        }
    });
    this.restaurantFinancialInfo.emit( this.financialJSON );
  }
}