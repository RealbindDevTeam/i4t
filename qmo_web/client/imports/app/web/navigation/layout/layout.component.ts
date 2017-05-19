import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MdSidenav } from '@angular/material';
import { NavigationService } from '../navigation.service';

import { Observable, Subscription, Subject } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Menus } from '../../../../../../both/collections/auth/menu.collection';
import { Menu } from '../../../../../../both/models/auth/menu.model';
import { MenuItem } from '../menu-item';
import { TranslateService } from 'ng2-translate';

import template from './layout.component.html';
import style from './layout.component.scss';

@Component({
  template,
  styles: [style]
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild(MdSidenav) sideNav: MdSidenav;

  private sidenavStyle       : string = 'side';
  private isHovering         : boolean = false;
  private sidenavOpened      : boolean = true;
  private _isHoveringNew     : boolean = false;
  private _isHoveringTimeout : number;
  private _subscriptions     : Subscription[] = [];
  
  menuItemSetup: MenuItem[];
  userLang: string;

  /**
   * LayoutComponent constructor
   * @param _navigation 
   * @param translate 
   */
  constructor(private _navigation: NavigationService, private translate: TranslateService) {
        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
  }

  /**
   * ngOnDestroy Implementatio
   */
  ngOnDestroy() {
    this._subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * ngOnInit Implementation. Is validated user role to load layout corresponding
   */
  ngOnInit() {
    MeteorObservable.call('getRole').subscribe((role) => {
      if(role == "100"){
        this.showSidenav();
      }
    }, (error) => {
      alert(`Failed to to load layout ${error}`);
    });
  }

  /**
   * This method bundle the Sidenav functionality
   */
  showSidenav(){
    if(this._navigation.mediumScreenAndDown) {
      this.sideNav.close();
    }

    let lastWindowSize: number = 0;
    let combined = Observable.combineLatest(this._navigation.sidenavOpened, this._navigation.openSidenavStyle, this._navigation.closedSidenavStyle, this._navigation.windowSize, (opened, openStyle, closedStyle, windowSize) => {
      let screenSizeChange: boolean = false;
      if(windowSize !== lastWindowSize) {
        lastWindowSize = windowSize;
        screenSizeChange = true;
      }
      return {opened, openStyle, closedStyle, screenSizeChange};
    });

    this._subscriptions.push(combined.subscribe((p: {opened: boolean, openStyle: string, closedStyle: string, screenSizeChange: boolean}) => {
      if(p.openStyle === 'off') {
        this.sidenavOpened = false;
        this.sidenavStyle = 'over';
        this.sideNav.close();
        return;
      }
      this.sidenavOpened = p.opened;
      if(this._navigation.largeScreen) {
        if(p.opened) {
          this.sidenavStyle = p.openStyle;
        } else {
          this.sidenavStyle = p.closedStyle;
        }
        if(this.sidenavStyle !== 'off' && (this.sidenavStyle !== 'hidden' || p.opened) && (this.sidenavStyle !== 'push' || p.opened)) {
          this.sideNav.open();
        } else {
          this.sideNav.close();
        }
      } else {
        this.sidenavStyle = 'over';
        if(p.opened && !p.screenSizeChange) {
          this.sideNav.open();
        } else {
          this.sideNav.close();
        }
      }
    }));
    if(this.sidenavStyle === 'hidden' || this.sidenavStyle === 'push') {
      this.sideNav.close(); // Close on initial load
    }

    this.menuItemSetup = [];

    MeteorObservable.call('getMenus').subscribe((param: Menu[]) => {
       for(let entry of param){
         var nameTraduced = this.itemNameTraduction(entry.name);
              let menuItem =  new MenuItem({title : nameTraduced, link : entry.url, icon : entry.icon_name});
              if(typeof entry.children != "undefined"){
                for(let entry2 of entry.children){
                  var nameTraduced2 = this.itemNameTraduction(entry2.name)
                  let menuItem2 = new MenuItem({title : nameTraduced2, link : entry2.url, icon : entry2.icon_name});
                  menuItem.children.push(menuItem2);
                }
              }
          this.menuItemSetup.push(menuItem);
      }

    }, (error) => {
      alert(`Failed to to load menu ${error}`);
    });

    this._navigation.setMenuItems(this.menuItemSetup);

  }

  public get sidenavMode(): string {
    if(this.sidenavStyle === 'icon overlay' && this.isHovering) {
      return 'over';
    } else if(this.sidenavStyle === 'icon' || this.sidenavStyle === 'icon overlay') {
      return 'side';
    } else if(this.sidenavStyle === 'hidden') {
      return 'over';
    } else if(this.sidenavStyle === 'off') {
      return 'over';
    }
    return this.sidenavStyle;
  }

  private sidenavToggle(opened: boolean) {
    this._navigation.setSidenavOpened(opened);
  }

  toggleHover(isHovering: boolean) {
    this._isHoveringNew = isHovering;
    if(isHovering) {
      this.isHovering = true;
    } else if(this._isHoveringTimeout !== 0) {
      this._isHoveringTimeout = window.setTimeout(() => {
        this.isHovering = this._isHoveringNew;
      }, 50);
    }
  }

  itemNameTraduction(itemName: string): string{
    var wordTraduced: string;
    this.translate.get(itemName).subscribe((res: string) => {
      wordTraduced = res; 
    });
    return wordTraduced;
  }

}