import {Component, OnChanges, SimpleChanges, HostBinding} from '@angular/core';
import {Input} from '@angular/core';
import {ColorService} from '../../services/color.service';

@Component({
  selector : 'core-widget',
  template : `
   <md-card class="flex-item widget" [ngStyle]="{'background-color': style, 'color': textStyle}">
    <md-card-content class="layout-stretch-between layout-row">
      <md-icon style="min-width: 100px;" class="widget-icon" *ngIf="icon">{{icon}}</md-icon>
      <div class="layout-column">
        <p [ngStyle]="{'background-color': style, 'color': textStyle}" class="counter">{{count}}</p>
        <p [ngStyle]="{'background-color': style, 'color': textStyle}" class="description" *ngIf="description">{{description}}</p>
      </div>
    </md-card-content>
  </md-card>
  `,
  styles : []
})
export class WidgetComponent implements OnChanges {
  @HostBinding('class') get class() {
    return 'flex-item';
  }

  @Input() icon: string = null;
  @Input() count: number = 0;
  @Input() description: string = null;
  @Input() palette: {palette: string, hue?: string, shade?: string} = null;
  @Input() hexColor: string = null;
  @Input() hexTextColor: string = null;

  private _color = '#fff';
  private _textColor = '#000';

  constructor(private _colorService: ColorService) {}

  get style() {
    return this._color;
  }

  get textStyle() {
    return this._textColor;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      if(propName === 'hexColor' || propName === 'palette') {
        this._color = this.hexColor !== null ? this.hexColor : (this.palette !== null ? 'black' : 'white');
      }
      
      this._textColor = this.hexTextColor !== null ? this.hexTextColor : 'white';
    }
  }

}
