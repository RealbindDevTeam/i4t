import '../imports/polyfills';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from '../imports/app/app.module';
import { Meteor } from 'meteor/meteor';

function setClass(css: any) {
    if (!document.body.className) {
        document.body.className = "";
    }
    document.body.className += " " + css;
}

Meteor.startup(() => {
    setClass('web');

    if (Meteor.isProduction) {
        enableProdMode();
    }
    platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.log(err));
});