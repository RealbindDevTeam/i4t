import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';

@Component({
    selector: 'change-table',
    templateUrl: 'change-table.html'
})

export class ChangeTablePage implements OnInit, OnDestroy {

    private _tablesSub: Subscription;

    private _res_code: string = '';
    private _table_code: string = '';

    constructor(public _navCtrl: NavController,
        public _navParams: NavParams,
        public _alertCtrl: AlertController,
        public _loadingCtrl: LoadingController,
        private _translate: TranslateService,
        private _userLanguageService: UserLanguageService,
        private _ngZone: NgZone) {
        _translate.setDefaultLang('en');

        this._res_code = this._navParams.get("res_id");
    }

    ngOnInit() {
        this._translate.use(this._userLanguageService.getLanguage(Meteor.user()));

        if(this._res_code !== ''){
            console.log('código de restaurante lleno');
        }
    }

    ngOnDestroy() {
        this.removeSubscriptions();
    }

    removeSubscriptions() {

    }

}