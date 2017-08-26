import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar } from '@angular/material';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Subcategories } from '../../../../../../../both/collections/administration/subcategory.collection';
import { Subcategory } from '../../../../../../../both/models/administration/subcategory.model';
import { Categories } from '../../../../../../../both/collections/administration/category.collection';
import { Category } from '../../../../../../../both/models/administration/category.model';
import { AlertConfirmComponent } from '../../../../web/general/alert-confirm/alert-confirm.component';

import template from './subcategories-edit.component.html';
import style from './subcategories-edit.component.scss';

@Component({
    selector: 'subcategory-edit',
    template,
    styles: [ style ],
    providers:[ UserLanguageService ]
})
export class SubcategoryEditComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    public _subcategoryToEdit       : Subcategory;
    private _editForm               : FormGroup;
    private _mdDialogRef            : MdDialogRef<any>;

    private _subcategories          : Observable<Subcategory[]>;
    private _categories             : Observable<Category[]>;

    private _subcategorySub         : Subscription;    
    private _categoriesSub          : Subscription;

    private _subcategoryCategory    : string;
    private titleMsg                : string;
    private btnAcceptLbl            : string;

    /**
     * SubcategoryEditComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef
     * @param {MdSnackBar} snackBar
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _formBuilder: FormBuilder,     
                 private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>, 
                 public snackBar: MdSnackBar,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MdDialog ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._subcategoryToEdit._id ],
            editName: [ this._subcategoryToEdit.name, Validators.required ],
            editActive: [ this._subcategoryToEdit.is_active ],
            editCategory: [ this._subcategoryToEdit.category ]
        });
        this._subcategoryCategory = this._subcategoryToEdit.category;
        this._categoriesSub = MeteorObservable.subscribe( 'categories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._categories = Categories.find( { } ).zone();
            });
        });
        this._subcategorySub = MeteorObservable.subscribe( 'subcategories', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._subcategories = Subcategories.find( { } ).zone();
            });
        });
    }

    /**
     * This function set category value in the form when the value select change
     * @param {string} _category
     */
    changeCategoryEdit( _category ):void{
        this._editForm.controls['editCategory'].setValue( _category) ;
    }

    /**
     * Function to edit Subcategory
     */
    editSubCategory():void{
        if( !Meteor.userId() ){
            var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            return;
        }

        if( this._editForm.valid ){
            Subcategories.update( this._editForm.value.editId,{
                $set: {
                    modification_user: this._user,
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    is_active: this._editForm.value.editActive,
                    category: this._editForm.value.editCategory
                }
            });

            let _lMessage:string = this.itemNameTraduction( 'SUBCATEGORIES.SUBCATEGORY_EDITED' );
            this.snackBar.open( _lMessage, '',{
                duration: 2500
            });
        }
        this._dialogRef.close();
    }

    /**
     * Return traduction
     * @param {string} itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

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
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._categoriesSub.unsubscribe();
        this._subcategorySub.unsubscribe();
    }
}