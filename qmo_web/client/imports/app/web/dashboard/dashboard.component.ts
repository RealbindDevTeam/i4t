import {Component} from '@angular/core';

import template from './dashboard.component.html';
import style from './dashboard.component.scss';   

@Component({
  selector : 'admin-dashboard',
  template,
  styles: [ style ]
})
export class DashboardComponent{

  private _ordersOptions: Object;
  private _salesOptions: Object;
  private _salesChart : Object;
  private _fromSales: any;
  private _toSales: any;

  constructor() {
        this._ordersOptions = {
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

        this._salesOptions = {
            title : { text : 'Ventas 28/07/2017' },
            _salesChart: { 
              type: 'spline',
              zoomType: 'x' 
            },
            series: [{
                name : 'Ventas en COP'
            }],
            xAxis : {
              title: {
                    text: 'Horas del Dia'
                },
                categories: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
            },
            yAxis: {
                title: {
                    text: 'Recaudo en COP'
                }
            }
        };
        this._salesOptions.series[0].data = [2,3,5,8,13];
        setInterval(() => this._salesChart.series[0].addPoint(Math.random() * 10), 600000);
    }

    saveInstance(chartInstance) {
        this._salesChart = chartInstance;
    }

    onChartSelection (e) {
      this._fromSales = e.originalEvent.xAxis[0].min.toFixed(2);
      this._toSales = e.originalEvent.xAxis[0].max.toFixed(2);
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
