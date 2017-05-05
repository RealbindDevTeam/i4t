import { FinancialBase } from './financial-base';

export class FinancialTextBox extends FinancialBase<String> {
    controlType = 'textbox';
    type: string;

    /**
     * FinancialTextBox Constructor
     * @param options 
     */
    constructor( options: {} = {} ){
        super( options );
        this.type = options[ 'type' ] || '';
    }
}