import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { UserDetails } from '../../../../../../../../../both/collections/auth/user-detail.collection';

@Component({
    selector: 'after-restaurant-creation',
    templateUrl: './after-restaurant-creation.component.html',
    styleUrls: ['./after-restaurant-creation.component.scss']
})
export class AfterRestaurantCreationComponent {

    private _userId: string;
    private showAfterRestCreation: boolean = false;
    
     /**
      * AfterRestaurantCreationComponent constructor
      * @param _dialogRef 
      */
    constructor(public _dialogRef: MatDialogRef<any>) {
        this._userId = Meteor.userId();
    }

    /**
     * Validate if the show dialog check is true
     */
    validateShowDialog(){
        if (this.showAfterRestCreation){
            let _lUsrdetail = UserDetails.findOne({ user_id: this._userId });
            if(_lUsrdetail){
                UserDetails.update({ _id: _lUsrdetail._id }, {
                    $set: {
                        show_after_rest_creation: false
                    }
                });
            }
        }
        this.closeDialog();
    }

    /**
     * Close the dialog
     */
    closeDialog() {
        this._dialogRef.close({ success: false });
    }

}