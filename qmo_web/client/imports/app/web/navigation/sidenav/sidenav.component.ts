import { Component, Input, OnInit, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { NavigationService } from '../navigation.service';
import { MenuItem } from '../menu-item';
import { SidenavItemComponent } from './sidenav-item/sidenav-item.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector : 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: [ './sidenav.component.scss' ],
})
export class SidenavComponent implements OnInit, OnDestroy {
  @ViewChildren(SidenavItemComponent) children: QueryList<SidenavItemComponent>;
  @Input() isHovering: boolean = false;

  private sidenavStyle: string;

  private showSidenav: boolean = false;
  private menuItems: MenuItem[] = [];
  private _screenWidth: number = NavigationService.largeViewportWidth;
  private _initialLoad: boolean = true; // Used to show slide in effect on page load for sidenav
  private _this: SidenavComponent = this;
  private _subscriptions: Subscription[] = [];

  constructor(private _navigation: NavigationService) {
  }

  ngOnDestroy() {
    this._subscriptions.forEach(sub => {
      if( sub ){ sub.unsubscribe(); }
    })
  }

  ngOnInit() {
    this._subscriptions.push(this._navigation.sidenavOpened.subscribe(opened => {
      if(this._navigation.largeScreen) {
        if(opened) {
          this._navigation.openSidenavStyle.take(1).subscribe(style => {
            this.sidenavStyle = style;
          });
        } else {
          this._navigation.closedSidenavStyle.take(1).subscribe(style => {
            this.sidenavStyle = style;
          });
        }
      } else {
        this.sidenavStyle = 'over';
      }
    }));
    this._navigation.menuItems.subscribe(menuItems => {
      this.menuItems = menuItems;
    });
    
  }

  /*get height(): number {
    let addedHeight = 0;
    if(this.children) {
      this.children.forEach(childComponent => {
        if(childComponent.active) {
          addedHeight += childComponent.height;
        }
      });
    }
    return (this.menuItems.length * 48) + addedHeight;
  }*/

  toggle(active: boolean, child: SidenavItemComponent) {
    if(this.children) {
      this.children.forEach(childComponent => {
        if(child !== childComponent) {
          childComponent.toggle(false, undefined, true);
        }
      });
    }
  }

}
