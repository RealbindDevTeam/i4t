import './polyfills';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './imports/app/app.module';
import { Meteor } from 'meteor/meteor';

import '../both/methods/administration/promotion.methods';
import '../both/methods/administration/collaborators.methods';
import '../both/methods/administration/item.methods';
import '../both/methods/auth/menu.methods';
import '../both/methods/auth/user-detail.methods';
import '../both/methods/auth/user-devices.methods';
import '../both/methods/auth/user-login.methods';
import '../both/methods/auth/user.methods';
import '../both/methods/general/cron.methods';
import '../both/methods/general/email.methods';
import '../both/methods/general/parameter.methods';
import '../both/methods/restaurant/restaurant.methods';
import '../both/methods/restaurant/invoice.methods';
import '../both/methods/restaurant/order.methods';
import '../both/methods/restaurant/payment.methods';
import '../both/methods/restaurant/schedule.methods';
import '../both/methods/restaurant/table.method';
import '../both/methods/restaurant/waiter-queue/waiter-queue.methods';
import '../both/methods/restaurant/waiter-queue/queues.methods';

function setClass(css:any) {
    if (!document.body.className) {
        document.body.className = "";
    }
    document.body.className += " " + css;
}

Meteor.startup(() => {
    setClass('web');
    //enableProdMode();
    platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.log(err));
});