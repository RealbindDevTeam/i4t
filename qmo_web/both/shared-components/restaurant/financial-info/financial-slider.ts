import { FinancialBase } from './financial-base';

export class FinancialSlider extends FinancialBase<number> {
    controlType = 'slider';
    minValue: number;
    maxValue: number;
    stepValue: number; 

    /**
     * FinancialSlider Constructor
     * @param options 
     */
    constructor( options: {} = {} ){
        super( options );
        this.minValue = options[ 'minValue' ] || '';
        this.maxValue = options[ 'maxValue' ] || '';
        this.stepValue = options[ 'stepValue' ] || '';        
    }
}