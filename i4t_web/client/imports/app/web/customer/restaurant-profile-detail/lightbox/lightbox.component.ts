import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'lightbox',
    templateUrl: './lightbox.component.html',
    styleUrls: ['./lightbox.component.scss']
})
export class LightBoxComponent {

    /**
     * LightBoxComponent constructor
     */
    constructor(public _dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    /**
     * Close the dialog
     */
    closeDialog() {
        this._dialogRef.close({ success: false });
    }
}