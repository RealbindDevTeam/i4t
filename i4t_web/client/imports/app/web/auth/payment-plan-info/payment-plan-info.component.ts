import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';

@Component({
  selector: 'payment-plan-info',
  templateUrl: './payment-plan-info.component.html',
  styleUrls: [ './payment-plan-info.component.scss' ],
  providers: [ UserLanguageService ]
})
export class PaymentPlanInfo {

    constructor( public _dialogRef: MatDialogRef<any> ){
    }

    cancel() {
        this._dialogRef.close({success : false});
    }

}