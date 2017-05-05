import { Injectable }   from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { FinancialBase } from '../../../../../../both/shared-components/restaurant/financial-info/financial-base';

@Injectable()
export class FinancialControlService {

    /**
     * FinancialControlService Constructor
     */
    constructor( ){

    }

    toFormGroup( _pElements: FinancialBase<any>[] ) {
        let _lGroup: any = {};

        _pElements.forEach( ( element ) => {
            _lGroup[ element.key ] = element.required ? new FormControl( element.value || '', Validators.required )
                                                      : new FormControl( element.value || '' );
        });
        return new FormGroup( _lGroup );
    }
}