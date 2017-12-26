import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../services/general/user-language.service';

@Component({
  selector: 'c-customer-menu',
  templateUrl: './customer-menu.component.html'
})
export class CustomerMenuComponent {

  @Output()
  menuname: EventEmitter<string> = new EventEmitter<string>();
  /**
   * CustomerMenuComponent Contructor
   * @param {Router} router 
   */
  constructor(protected _router: Router,
    private _translate: TranslateService,
    private _userLanguageService: UserLanguageService) {
    //super(_router);
    _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
    _translate.setDefaultLang('en');
  }

  /**
   * This method allow the redictection to components
   * @param {string} _route 
   */
  goToRoute(_route: string, _menuName: string) {
    this._router.navigate([_route]);
    this.menuname.emit(_menuName);
  }
}