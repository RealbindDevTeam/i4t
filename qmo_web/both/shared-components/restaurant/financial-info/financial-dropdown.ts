import { FinancialBase } from './financial-base';

export class FinancialDropDown extends FinancialBase<string>{
    controlType = 'dropdown';
    options: { key: string, value: string }[] = [];

    /**
     * FinancialDropDown Constructor
     * @param options 
     */
    constructor( options: {} = {} ){
        super( options );
        this.options = options[ 'options' ] || [];
    }
}