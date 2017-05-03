import { FinancialBase } from './financial-base';

export class FinancialText extends FinancialBase<string> {
    controlType = 'text';

    /**
     * FinancialText Constructor
     * @param options
     */
    constructor( options: {} = {} ){
        super( options );
    }
}