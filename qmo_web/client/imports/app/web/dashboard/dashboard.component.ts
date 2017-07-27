import {Component} from '@angular/core';

import template from './dashboard.component.html';
import style from './dashboard.component.scss';   

@Component({
  selector : 'c-dashboard',
  template,
  styles: [ style ]
})
export class DashboardComponent{

  options: Object;

  constructor() {
        this.options = {
            chart: {
                type: 'pie'
            },
            title : { text : 'Detalle de Ordenes' },
            series: [
              { name : 'Ordenes', 
                data: [{
                    x: 1,
                    y: 5,
                    name: "Ordenes Registradas",
                    color: "#546E7A"
                }, {
                    x: 2,
                    y: 9,
                    name: "Ordenes En Proceso",
                    color: "#F0BD4F"
                }, {
                    x: 3,
                    y: 7,
                    name: "Ordenes Entregadas",
                    color: "#4CAF50"
                }, {
                    x: 4,
                    y: 8,
                    name: "Ordenes Canceladas",
                    color: "#EF5350"
                }], 
              }
            ]
        };
    }

    folders = [
      {
        name: 'Photos',
        updated: new Date('1/1/16'),
      },
      {
        name: 'Recipes',
        updated: new Date('1/17/16'),
      },
      {
        name: 'Work',
        updated: new Date('1/28/16'),
      }
    ];
    notes = [
      {
        name: 'Vacation Itinerary',
        updated: new Date('2/20/16'),
      },
      {
        name: 'Kitchen Remodel',
        updated: new Date('1/18/16'),
      },
      {
        name: 'Kitchen Remodel',
        updated: new Date('1/18/16'),
      },
      {
        name: 'Kitchen Remodel',
        updated: new Date('1/18/16'),
      },
      {
        name: 'Kitchen Remodel',
        updated: new Date('1/18/16'),
      },
      {
        name: 'Kitchen Remodel',
        updated: new Date('1/18/16'),
      },
      {
        name: 'Kitchen Remodel',
        updated: new Date('1/18/16'),
      }
    ];
}
