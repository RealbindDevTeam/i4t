import { Component, ViewContainerRef } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { TranslateService } from 'ng2-translate';
import { Job, JobCollection } from 'meteor/vsivsi:job-collection';

import template from './waiter-call.component.html';
import style from './waiter-call.component.scss';

@Component({
    selector: 'waiter-call',
    template,
    styles: [ style ]
})
export class WaiterCallComponent {

    constructor (protected _translate: TranslateService, 
                 public _viewContainerRef: ViewContainerRef) {
                     
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(_userLang);
    }

    addWaiterCall(){
        var restaurant_id = 'LbkQ3xAEzDjgRf7is';
        var table_id = '4fycTkJX8CKaSW7zP';
        //var usrId = Meteor.userId();
        var usrId = Meteor.user().username;

        var data : any = {
            restaurants : restaurant_id,
            tables : table_id,
            user : usrId,
            waiter_id : ""
        }
        Meteor.call('waiterCall', false, data);
    }

}