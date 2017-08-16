import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Item, ItemImage, ItemPrice } from '../../../../../../../both/models/administration/item.model';
import { Items, ItemImages } from '../../../../../../../both/collections/administration/item.collection';

import template from './items-enable-sup.component.html';
import style from '../item.component.scss';

@Component({
    selector: 'item-enable-sup',
    template,
    styles: [style]
})

export class ItemEnableSupComponent implements OnInit, OnDestroy {

    constructor(private _translate: TranslateService,
        private _ngZone: NgZone,
        private _userLanguageService: UserLanguageService) {
        _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
        _translate.setDefaultLang('en');
    }


    /**
     * ngOnInit implementation
     */
    ngOnInit() {
    }

    ngOnDestroy() {
    }
}
