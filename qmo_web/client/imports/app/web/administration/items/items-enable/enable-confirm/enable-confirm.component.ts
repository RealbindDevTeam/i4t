import { Component, NgZone, Inject, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA, MdSnackBar } from '@angular/material';
import { MeteorObservable } from "meteor-rxjs";
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../../both/collections/restaurant/restaurant.collection';
import { Item } from '../../../../../../../../both/models/administration/item.model';
import { Items } from '../../../../../../../../both/collections/administration/item.collection';

import template from './enable-confirm.component.html';
import style from './enable-confirm.component.scss';

@Component({
    selector: 'enable-confirm',
    template,
    styles: [style],
    providers: [UserLanguageService]
})

export class EnableConfirmComponent implements OnInit, OnDestroy {

    private _restaurantSub: Subscription;

    constructor(public _dialogRef: MdDialogRef<any>,
        private _zone: NgZone,
        @Inject(MD_DIALOG_DATA) public data: any,
        private translate: TranslateService,
        private _userLanguageService: UserLanguageService,
        public snackBar: MdSnackBar) {
        translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        translate.setDefaultLang('en');
    }

    ngOnInit() {
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe(() => { });
    }

    /** 
     * Function to ge the restaurant name
    */
    getRestaurantName(_restaurantId: string): string {
        let restaurant: Restaurant = Restaurants.findOne({ _id: _restaurantId });
        if (restaurant) {
            return restaurant.name;
        } else {
            return;
        }
    }

    /**
     * Function to update de item restaurant avalaibility
     */
    updateAvailableFlag(_restaurantId: string) {
        let snackMsg: string = this.itemNameTraduction('ENABLE_DISABLED.AVAILABILITY_CHANGED');
        MeteorObservable.call('updateItemAvailable', _restaurantId, this.data.one._id).subscribe();
        this.snackBar.open(snackMsg, '', {
            duration: 1000,
        });
    }

    /**
     * Function that returns true to Parent component
     */
    closeConfirm() {
        this._dialogRef.close({ success: true });
    }

    /**
     * This function allow closed the modal dialog
     */
    cancel() {
        this._dialogRef.close({ success: false });
    }

    /**
     * This function cleans the tables_number fields form
     * @param {string} itemName
     * @return {string}
     */
    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this.translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

    ngOnDestroy() {
        this._restaurantSub.unsubscribe();
    }
}

