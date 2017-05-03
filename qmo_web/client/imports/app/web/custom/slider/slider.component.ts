import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import template from './slider.component.html';
import style from './slider.component.scss';

@Component({
    selector:'iu-slider',
    template,
    styles: [ style ]
})
export class IurestSliderComponent implements OnInit {

    @Input() percentageValue: number;
    @Input() label: string;
    @Input() minValue: number;
    @Input() maxValue: number;
    @Input() stepValue: number;    

    @Output() sliderValue = new EventEmitter();

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this.sliderValue.emit( this.percentageValue );
    }

    /**
     * Get percentage value
     * @param {any} _event 
     */
    onPercentageChange( _event:any ):void{
        this.percentageValue = _event.value;
        this.sliderValue.emit( this.percentageValue );
    }
}