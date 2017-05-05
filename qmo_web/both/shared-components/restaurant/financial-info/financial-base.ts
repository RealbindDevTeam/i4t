/**
 * Financial Base Class
 */
export class FinancialBase<T> {
    value: T;
    key: string;
    label: string;
    required: boolean;
    order: number;
    controlType: string;
    minValue: number;
    maxValue: number;
    stepValue: number; 

    /**
     * FinancialBase Constructor
     * @param options 
     */
    constructor( options: {
                            value?: T,
                            key?: string,
                            label?: string,
                            required?: boolean,
                            order?: number,
                            controlType?: string,
                            minValue?: number,
                            maxValue?: number,
                            stepValue?: number 
                          } = {} ) {
        this.value = options.value;
        this.key = options.key || '';
        this.label = options.label || '';
        this.required = !!options.required;
        this.order = options.order === undefined ? 1 : options.order;
        this.controlType = options.controlType || '';
        this.minValue = options.minValue === undefined ? 0 : options.minValue;
        this.maxValue = options.maxValue === undefined ? 0 : options.maxValue;
        this.stepValue = options.stepValue === undefined ? 1 : options.stepValue;
    }
}