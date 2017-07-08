import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';


import template from './reactivate-restaurant.component.html';
import style from './reactivate-restaurant.component.scss';

@Component({
    selector: 'reactivate-restaurant',
    template,
    styles: [style]
})

export class ReactivateRestaurantComponent implements OnInit, OnDestroy {

    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);
    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }
}