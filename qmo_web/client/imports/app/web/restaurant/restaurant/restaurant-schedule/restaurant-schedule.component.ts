import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';

import template from './restaurant-schedule.component.html';
import style from './restaurant-schedule.component.scss';

@Component({
    selector: 'resturant-schedule',
    template,
    styles: [ style ]
})
export class RestaurantScheduleComponent{

    public _restaurantSchedule: Restaurant;

    /**
     * ResturantScheduleComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( public _dialogRef: MdDialogRef<any> ){

    }
}