import { Component, Input, Output, EventEmitter } from '@angular/core';

import template from './slider.component.html';
import style from './slider.component.scss';

@Component({
    selector:'iu-slider',
    template,
    styles: [ style ]
})
export class IurestSliderComponent {

    @Input() percentageValue: number;
    @Input() label: string;
    @Input() minValue: number;
    @Input() maxValue: number;
    @Input() stepValue: number;    

    @Output() sliderValue = new EventEmitter();

    /**
     * Get percentage value from slider
     * @param {any} _event 
     */
    onPercentageChange( _event:any ):void{
        this.percentageValue = _event;
        this.sliderValue.emit( ( this.label + ':' + this.percentageValue ) );
    }
}