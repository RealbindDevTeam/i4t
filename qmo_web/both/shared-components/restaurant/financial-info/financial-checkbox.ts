import { FinancialBase } from './financial-base';

export class FinancialCheckBox extends FinancialBase<string> {
    controlType = 'checkbox'

    /**
     * FinancialCheckBox Constructor
     * @param options 
     */
    constructor( options: {} = {} ){
        super( options );
    }
}