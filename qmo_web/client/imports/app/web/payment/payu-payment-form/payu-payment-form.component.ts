import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';

import { PayuPaymenteService } from '../payu-payment-service/payu-payment.service';

import template from './payu.payment.form.component.html';
import style from './payu-payment-form.component.scss';

@Component({
    selector: 'payu-payment-form',
    template,
    styles: [style]
})

export class PayuPaymentFormComponent implements OnInit, OnDestroy {

    private mensaje: string;
    private planObj: any;
    private post: any;

    constructor(private _router: Router, private _activateRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _translate: TranslateService,
        private _payuPaymentService: PayuPaymenteService) {

        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);

        this.getCode();
    }

    getCode(){
        this._payuPaymentService.getTestPing().subscribe(
            pingResult => {
                this.post = pingResult;
                console.log('+++');
                console.log(this.post);
            },
            error => {
                console.log(error);
            }
        );
    }

    ngOnInit() {
        this._activateRoute.params.forEach((params: Params) => {
            this.mensaje = params['param'];
        });

    }

    ngOnDestroy() {

    }
}