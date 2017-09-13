import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';

@Component({
    selector: 'addition-order-detail',
    templateUrl: 'addition-order-detail.html'
})

export class AdditionOrderDetailComponent implements OnInit, OnDestroy {

    @Input() additionId : string;
    @Input() currency   : string;
    @Input() price      : number;
    @Input() quantity   : number;
    private _additionsSubscription : Subscription;
    private _additions             : any;

    /**
     * AdditionOrderDetailComponent constructor
     */
    constructor(){
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._additionsSubscription = MeteorObservable.subscribe('additionsById', this.additionId).subscribe(()=>{
            this._additions = Additions.find({_id : this.additionId});
        });
    }

    /**
     * ngOnDestroy implimentation
     */
    ngOnDestroy(){
        this._additionsSubscription.unsubscribe();
    }
}