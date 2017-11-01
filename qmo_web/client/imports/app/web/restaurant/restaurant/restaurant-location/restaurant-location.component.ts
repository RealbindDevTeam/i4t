import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
//import { MouseEvent } from "@agm/core";
import { Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { AlertConfirmComponent } from '../../../../web/general/alert-confirm/alert-confirm.component';

@Component({
  selector: 'restaurant-location',
  templateUrl: './restaurant-location.component.html',
  styleUrls: [ './restaurant-location.component.scss' ],
  providers: [ UserLanguageService ]
})
export class RestaurantLocationComponent implements OnInit, OnDestroy {
    
    public _restaurantLocation      : Restaurant;
    private _restaurantSub          : Subscription;
    private _mdDialogRef            : MatDialogRef<any>;
    
    private titleMsg                : string;
    private btnAcceptLbl            : string;

    public _lat                     : number = 37.4292;
    public _lng                     : number = -122.1381;

    /**
     * RestaurantLocationComponent constructor
     * @param {TranslateService} _translate
     * @param {MatDialogRef<any>} _dialogRef
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService, 
                 public _dialogRef: MatDialogRef<any>,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MatDialog ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        /*if( this._restaurantLocation.location.lat !== 0 && this._restaurantLocation.location.lng !== 0 ){
            this._lat = this._restaurantLocation.location.lat;
            this._lng = this._restaurantLocation.location.lng;
        } else {
            if( navigator.geolocation ) {
                navigator.geolocation.getCurrentPosition( this.setPosition.bind( this ) );
            }
        }*/
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe();
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
    }

    /**
     * Function to Add Restaurant Location
     */
    addRestaurantLocation():void{
        if( !Meteor.userId() ){
            var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            return;
        }
        
        Restaurants.update( this._restaurantLocation._id, {
            $set: {
                modification_user: Meteor.userId(),
                modification_date: new Date(),
                location: {
                        lat: this._lat,
                        lng: this._lng
                }
            }
        });
        var message_translate = this.itemNameTraduction('RESTAURANT_LOCATION.MSG_UPDATE_POSITION');
        this.openDialog(this.titleMsg, '', message_translate, '', this.btnAcceptLbl, false);
    }

    /**
     * If user allow get current position, latitude and longitude is setted with that
     * If user not allow current position, latitude and longitude is setted with default position
     * @param {any} _pPosition
     */
    setPosition( _pPosition ) {
      let _lAuxlat = _pPosition.coords.latitude;
      let _lAuxlng = _pPosition.coords.longitude;

      if( _lAuxlat != null && _lAuxlng != null){
          this._lat = _lAuxlat;
          this._lng = _lAuxlng;
      } else {
        this._lat = 37.4292;
        this._lng = -122.1381;
      }
    }

    /**
     * Set restaurant position
     * @param {MouseEvent} $event
     
    mapClicked( $event: MouseEvent ) {
        this._lat = $event.coords.lat;
        this._lng = $event.coords.lng;
    }*/

    /**
     * Set marker in the map
     * @param {MouseEvent} event 
     
    markerDragEnd( $event: MouseEvent ) {
        this._lat = $event.coords.lat;
        this._lng = $event.coords.lng;
    }*/

    /**
    * This function open de error dialog according to parameters 
    * @param {string} title
    * @param {string} subtitle
    * @param {string} content
    * @param {string} btnCancelLbl
    * @param {string} btnAcceptLbl
    * @param {boolean} showBtnCancel
    */
    openDialog(title: string, subtitle: string, content: string, btnCancelLbl: string, btnAcceptLbl: string, showBtnCancel: boolean) {
        
        this._mdDialogRef = this._mdDialog.open(AlertConfirmComponent, {
            disableClose: true,
            data: {
                title: title,
                subtitle: subtitle,
                content: content,
                buttonCancel: btnCancelLbl,
                buttonAccept: btnAcceptLbl,
                showBtnCancel: showBtnCancel
            }
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if (result.success) {

            }
        });
    }

    /**
     * This function allow translate
     * @param itemName 
     */
    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();   
    }
}