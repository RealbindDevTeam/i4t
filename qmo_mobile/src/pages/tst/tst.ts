import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Cities } from 'qmo_web/both/collections/settings/city.collection';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';

/*
  Generated class for the Tst page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-tst',
  templateUrl: 'tst.html'
})

export class TstPage implements OnInit {

  userLang: string;
  cities;
  _citiesSub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService) {
    this.userLang = navigator.language.split('-')[0];
    translate.setDefaultLang('en');
    translate.use(this.userLang);
  }

  ngOnInit() {
    this.cities = Cities.find({}).zone();
    this._citiesSub = MeteorObservable.subscribe('cities').subscribe();
  }
}
