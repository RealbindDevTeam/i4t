import { FinancialBase } from './financial-base';

export class FinancialSlider extends FinancialBase<string> {
    controlType = 'slider';
    percentageValue: number;
    minValue: number;
    maxValue: number;
    stepValue: number; 

    /**
     * FinancialSlider Constructor
     * @param options 
     */
    constructor( options: {} = {} ){
        super( options );
        this.percentageValue = options[ 'percentageValue' ] || '';
        this.minValue = options[ 'minValue' ] || '';
        this.maxValue = options[ 'maxValue' ] || '';
        this.stepValue = options[ 'stepValue' ] || '';        
    }
}