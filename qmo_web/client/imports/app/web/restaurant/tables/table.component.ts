import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { QRCodeComponent } from 'angular2-qrcode';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { generateQRCode, createTableCode } from '../../../../../../both/methods/restaurant/restaurant.methods';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Table } from '../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../both/collections/restaurant/table.collection';

import template from './table.component.html';
import style from './table.component.scss';

import * as QRious from 'qrious';

let jsPDF = require('jspdf');

@Component({
  selector: 'iu-table',
  template,
  styles: [style]

})
export class TableComponent implements OnInit, OnDestroy {


  private tableForm: FormGroup;
  private restaurants: Observable<Restaurant[]>;
  private restaurantSub: Subscription;
  private tables: Observable<Table[]>;
  private tableSub: Subscription;
  selectedRestaurantValue: string;
  private restaurantCode: string = '';
  private tables_count: number = 0;
  private all_checked: boolean;
  private enable_print: boolean;

  private tables_selected: Table[];
  private isChecked: false;
  private tooltip_msg: string = '';
  private show_cards: boolean;


  finalImg: any;

  constructor(private _formBuilder: FormBuilder, private translate: TranslateService, private _router: Router) {
    var userLang = navigator.language.split('-')[0];
    translate.setDefaultLang('en');
    translate.use(userLang);
    this.selectedRestaurantValue = "";
    this.tables_selected = [];
    this.all_checked = false;
    this.enable_print = true;
    this.show_cards = false;
  }

  ngOnInit() {
    this.tableForm = new FormGroup({
      restaurant: new FormControl('', [Validators.required]),
      tables_number: new FormControl('', [Validators.required])
    });
    this.restaurants = Restaurants.find({}).zone();
    this.restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();
    this.tables = Tables.find({}).zone();
    this.tableSub = MeteorObservable.subscribe('tables', Meteor.userId()).subscribe();
    this.tooltip_msg = this.itemNameTraduction('TABLES.MSG_TOOLTIP');
  }

  addTables() {
    if (!Meteor.userId()) {
      alert('Please log in to add a restaurant');
      return;
    }

    if (this.tableForm.valid) {
      let _lRestau: Restaurant = Restaurants.findOne({ _id: this.tableForm.value.restaurant });
      let _lTableNumber: number = this.tableForm.value.tables_number;
      this.restaurantCode = _lRestau.restaurant_code;

      //this.tables_count = Tables.collection.find({}).fetch().length;

      this.tables_count = Tables.collection.find({ restaurantId: this.tableForm.value.restaurant }).count();

      for (let _i = 0; _i < _lTableNumber; _i++) {
        let _lRestaurantTableCode: string = '';
        let _lTableCode: string = '';

        _lTableCode = this.generateTableCode();

        _lRestaurantTableCode = this.restaurantCode + _lTableCode;
        let _lCodeGenerator = generateQRCode(_lRestaurantTableCode);

        let _lQrCode = new QRious({
          background: 'white',
          backgroundAlpha: 1.0,
          foreground: 'black',
          foregroundAlpha: 1.0,
          level: 'H',
          mime: 'image/svg',
          padding: null,
          size: 150,
          value: _lCodeGenerator.getQRCode()
        });

        let _lNewTable: Table = {
          creation_user: Meteor.userId(),
          creation_date: new Date(),
          restaurantId: this.tableForm.value.restaurant,
          table_code: _lTableCode,
          is_active: true,
          QR_code: _lCodeGenerator.getQRCode(),
          QR_information: {
            significativeBits: _lCodeGenerator.getSignificativeBits(),
            bytes: _lCodeGenerator.getFinalBytes()
          },
          amount_people: 0,
          status: 'FREE',
          QR_URI: _lQrCode.toDataURL(),
          _number: this.tables_count + (_i + 1)
        };
        Tables.insert(_lNewTable);
        Restaurants.update({ _id: this.tableForm.value.restaurant }, { $set: { tables_quantity: _lRestau.tables_quantity + (_i + 1) } })
      }
      this.tableForm.reset();
    }
  }

  changeRestaurant(_pRestaurant) {
    this.selectedRestaurantValue = _pRestaurant;
    this.tableForm.controls['restaurant'].setValue(_pRestaurant);
  }

  changeRestaurantFilter(_pRestaurant) {
    if (_pRestaurant == 'All') {
      this.tables = Tables.find({}).zone();
      this.enable_print = true;
      this.tooltip_msg = this.itemNameTraduction('TABLES.MSG_TOOLTIP');
    } else {
      this.tables = Tables.find({ restaurantId: _pRestaurant }).zone();
      this.enable_print = false;
      this.tooltip_msg = "";
      this.show_cards = true;
      this.tables_selected = [];
    }
    this.all_checked = false;
  }

  cancel(): void {
    if (this.selectedRestaurantValue !== "") { this.selectedRestaurantValue = ""; }
    this.tableForm.controls['tables_number'].reset();
  }

  generateTableCode(): string {
    let _lCode: string = '';

    while (true) {
      _lCode = createTableCode();
      if (Tables.find({ table_code: _lCode }).cursor.count() === 0) {
        break;
      }
    }
    return _lCode;
  }

  ngOnDestroy() {
    this.restaurantSub.unsubscribe();
    this.tableSub.unsubscribe();
  }

  printQrPdf() {

    let auxStr: string;
    let tableStr: string = this.itemNameTraduction('TABLES.TABLE');
    let codeStr: string = this.itemNameTraduction('TABLES.CODE');
    let countVar: number = 0;

    let qr_pdf = new jsPDF("portrait", "mm", "a4");

    if (this.all_checked) {

      this.tables.forEach(table => {
        table.forEach(table2 => {
          auxStr = table2._number.toString();
          countVar += 1;

          if ((countVar % 2) == 1) {
            qr_pdf.rect(55, 25, 90, 90); // empty square
            qr_pdf.text(70, 35, tableStr + auxStr);
            qr_pdf.addImage(table2.QR_URI, 'JPEG', 70, 40, 60, 60);
            qr_pdf.text(70, 110, codeStr + table2.QR_code);
          } else {
            qr_pdf.rect(55, 150, 90, 90); // empty square
            qr_pdf.text(70, 160, tableStr + auxStr);
            qr_pdf.addImage(table2.QR_URI, 'JPEG', 70, 165, 60, 60);
            qr_pdf.text(70, 235, codeStr + table2.QR_code);
            qr_pdf.addPage();
          }
        });
      });
      this.tables_selected = [];
      qr_pdf.output('dataurlnewwindow');
    } else if (!this.all_checked && this.tables_selected.length > 0){
      this.tables_selected.forEach(table2 => {
        auxStr = table2._number.toString();
        countVar += 1;

        if ((countVar % 2) == 1) {
          qr_pdf.rect(55, 25, 90, 90); // empty square
          qr_pdf.text(70, 35, tableStr + auxStr);
          qr_pdf.addImage(table2.QR_URI, 'JPEG', 70, 40, 60, 60);
          qr_pdf.text(70, 110, codeStr + table2.QR_code);
        } else {
          qr_pdf.rect(55, 150, 90, 90); // empty square
          qr_pdf.text(70, 160, tableStr + auxStr);
          qr_pdf.addImage(table2.QR_URI, 'JPEG', 70, 165, 60, 60);
          qr_pdf.text(70, 235, codeStr + table2.QR_code);
          qr_pdf.addPage();
        }
      });
      qr_pdf.output('dataurlnewwindow');
    }
    //qr_pdf.save('qr_codes.pdf');
  }

  addToPrintArray(selected, isChecked: boolean) {
    if (isChecked) {
      this.tables_selected.push(selected);
    } else {
      this.tables_selected = this.tables_selected.filter(function (element) {
        return element._id !== selected._id;
      });
    }
  }

  /**
   * Go to add new Restaurant
   */
  goToAddRestaurant(){
      this._router.navigate(['/app/restaurantRegister']);
  }

  itemNameTraduction(itemName: string): string {
    var wordTraduced: string;
    this.translate.get(itemName).subscribe((res: string) => {
      wordTraduced = res;
    });
    return wordTraduced;
  }
}
