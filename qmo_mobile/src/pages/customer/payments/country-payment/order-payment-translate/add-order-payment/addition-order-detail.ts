import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Order, OrderItem } from 'qmo_web/both/models/restaurant/order.model';
import { ItemImagesThumbs } from 'qmo_web/both/collections/administration/item.collection';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Items } from 'qmo_web/both/collections/administration/item.collection';

@Component({
    selector: 'addition-order-detail',
    templateUrl: 'addition-order-detail.html'
})

export class AdditionOrderDetailComponent implements OnInit, OnDestroy {

    @Input() addition : any;
    private _additionsSubscription : Subscription;
    private _additions             : any;

    constructor(){
        console.log(this.addition);
    }

    ngOnInit(){
        this._additionsSubscription = MeteorObservable.subscribe('additionsById', this.addition.additionId).subscribe(()=>{
            //this._additions
        });
    }

    ngOnDestroy(){
        this._additionsSubscription.unsubscribe();
    }
}