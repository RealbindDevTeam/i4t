import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FinancialBase } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-base';
import { FinancialControlService } from '../financial-control.service';

import template from './financial-form.component.html';
import style from './financial-form.component.scss';

@Component({
  selector: 'iu-financialform',
  template,
  styles: [ style ]
})
export class IurestFinancialFormComponent implements OnInit {

  @Input() financialElements: FinancialBase<any>[] = [];
  form: FormGroup;

  /**
   * FinancialFormComponent Constructor
   * @param {FinancialControlService} _financialControlService 
   */
  constructor( private _financialControlService: FinancialControlService ){

  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit() {
    this.form = this._financialControlService.toFormGroup( this.financialElements );
  }
}