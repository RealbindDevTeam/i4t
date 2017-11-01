import 'angular2-meteor-polyfills';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './imports/app/app.module';
import { Meteor } from 'meteor/meteor';

function setClass(css) {
    if (!document.body.className) {
        document.body.className = "";
    }
    document.body.className += " " + css;
}

Meteor.startup(() => {
    setClass('web');
    enableProdMode();
    const platform = platformBrowserDynamic();
    platform.bootstrapModule(AppModule).catch(err => console.log(err));
});