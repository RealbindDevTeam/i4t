import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FinancialBase } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-base';

import template from './financial-element.component.html';
import style from './financial-element.component.scss';

@Component({
  selector: 'iu-financialelement',
  template,
  styles: [ style ]
})
export class IurestFinancialElementComponent {
  
    @Input() element: FinancialBase<any>;
    @Input() form: FormGroup;
}