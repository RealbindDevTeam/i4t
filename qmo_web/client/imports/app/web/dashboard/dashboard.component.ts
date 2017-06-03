import {Component} from '@angular/core';

import template from './dashboard.component.html';
import style from './dashboard.component.scss';   

@Component({
  selector : 'c-dashboard',
  template,
  styles: [ style ]
})
export class DashboardComponent{

  private sysDate: Date;

  constructor(){
    this.sysDate = new Date();
    console.log('**********');
    console.log(this.sysDate);
  }

}
