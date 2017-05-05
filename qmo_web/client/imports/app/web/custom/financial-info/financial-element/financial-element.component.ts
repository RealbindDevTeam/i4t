import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FinancialBase } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-base';

import template from './financial-element.component.html';
import style from './financial-element.component.scss';

@Component({
  selector: 'iu-financialelement',
  template,
  styles: [ style ]
})
export class IurestFinancialElementComponent {
  
    @Input() element: FinancialBase<any>;
    @Input() form: FormGroup;
    @Output() financialInformation = new EventEmitter();

    private financialInfo = {};

    /**
     * Function to build JSON with financial information
     */
    onChangeValue(){
      let _lJsonValues = JSON.parse( JSON.stringify( this.form.value ) );
      let arr:any[] = Object.keys( _lJsonValues );
      arr.forEach( ( a ) => {
            if( _lJsonValues[ a ] ){
                this.financialInfo[ a ] = _lJsonValues[ a ];
            }
        });
      this.financialInformation.emit( this.financialInfo );
    }

    /**
     * Receive slider value and insert in JSON with financial information
     * @param {string} _event 
     */
    receiveSliderValue( _event:string ):void {
      let _lValues:string[] = [];
      _lValues = _event.split(":");
      this.financialInfo[ _lValues[ 0 ] ] = _lValues[ 1 ];
      this.financialInformation.emit( this.financialInfo );
    }
}