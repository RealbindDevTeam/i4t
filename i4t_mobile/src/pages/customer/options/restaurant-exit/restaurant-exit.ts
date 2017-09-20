import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'restaurant-exit',
    templateUrl: 'restaurant-exit.html'
})

export class RestaurantExitPage implements OnInit, OnDestroy {

    ngOnInit() {

    }

    ionViewWillEnter() {

    }


    ngOnDestroy() {
        
    }

    ionViewWillLeave() {
        
    }
}


