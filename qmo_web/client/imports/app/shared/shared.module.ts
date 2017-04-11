import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {FlexLayoutModule} from '@angular/flex-layout';
import {WidgetComponent} from './layout/widget/widget.component';
import {ChipComponent} from './layout/chip/chip.component';
import {MaterialModule} from '@angular/material';
import {ColorService} from './services/color.service';
import {CodeHighlighterDirective} from './layout/code-highlighter/code-highlighter.directive';
import {SearchService} from './services/search.service';
import {NavigationModule} from '../web/navigation/navigation.module';
import {NavigationService} from '../web/navigation/navigation.service';

@NgModule({
  declarations : [
    WidgetComponent, CodeHighlighterDirective
  ],
  exports : [FormsModule, HttpModule, CommonModule, MaterialModule, FlexLayoutModule, NavigationModule, WidgetComponent, CodeHighlighterDirective],
  imports : [FormsModule, HttpModule, CommonModule, MaterialModule, FlexLayoutModule, NavigationModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule : SharedModule,
      providers : [NavigationService, ColorService, SearchService]
    };
  }
}
