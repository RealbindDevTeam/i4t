import '../imports/polyfills';
import { Meteor } from 'meteor/meteor';
import { WebApp, WebAppInternals } from 'meteor/webapp';
import { enableProdMode, PlatformRef, ApplicationModule, ApplicationRef } from '@angular/core';
import { ResourceLoader } from '@angular/compiler';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import { platformDynamicServer, BEFORE_APP_SERIALIZED, INITIAL_CONFIG, PlatformState } from '@angular/platform-server';
import { ServerAppModule } from '../imports/app/server-app.module';

import '../imports/server-side/publications/menu/sections';
import '../imports/server-side/publications/menu/categories';
import '../imports/server-side/publications/menu/subcategories';
import '../imports/server-side/publications/menu/additions';
import '../imports/server-side/publications/menu/garnish-food';
import '../imports/server-side/publications/menu/item';
import '../imports/server-side/publications/auth/users';
import '../imports/server-side/publications/auth/roles';
import '../imports/server-side/publications/auth/menus';
import '../imports/server-side/publications/auth/collaborators';
import '../imports/server-side/publications/auth/user-details';
import '../imports/server-side/publications/general/hour';
import '../imports/server-side/publications/general/currency';
import '../imports/server-side/publications/general/paymentMethod';
import '../imports/server-side/publications/general/email-content';
import '../imports/server-side/publications/general/parameter';
import '../imports/server-side/publications/general/cities';
import '../imports/server-side/publications/general/countries';
import '../imports/server-side/publications/general/languages';
import '../imports/server-side/publications/payment/payment-history';
import '../imports/server-side/publications/payment/cc-payment-method';
import '../imports/server-side/publications/payment/payment-transaction';
import '../imports/server-side/publications/payment/invoice-info';
import '../imports/server-side/publications/payment/iurest-invoices';
import '../imports/server-side/publications/restaurant/restaurant';
import '../imports/server-side/publications/restaurant/table';
import '../imports/server-side/publications/restaurant/account';
import '../imports/server-side/publications/restaurant/order';
import '../imports/server-side/publications/restaurant/waiter-call';
import '../imports/server-side/publications/restaurant/payment';
import '../imports/server-side/publications/restaurant/invoice';

import '../imports/both/methods/menu/item.methods';
import '../imports/both/methods/auth/collaborators.methods';
import '../imports/both/methods/auth/menu.methods';
import '../imports/both/methods/auth/user-detail.methods';
import '../imports/both/methods/auth/user-devices.methods';
import '../imports/both/methods/auth/user-login.methods';
import '../imports/both/methods/auth/user.methods';
import '../imports/both/methods/general/cron.methods';
import '../imports/both/methods/general/email.methods';
import '../imports/both/methods/general/parameter.methods';
import '../imports/both/methods/general/change-email.methods';
import '../imports/both/methods/general/country.methods';
import '../imports/both/methods/general/iurest-invoice.methods';
import '../imports/both/methods/general/push-notifications.methods';
import '../imports/both/methods/restaurant/restaurant.methods';
import '../imports/both/methods/restaurant/invoice.methods';
import '../imports/both/methods/restaurant/order.methods';
import '../imports/both/methods/restaurant/payment.methods';
import '../imports/both/methods/restaurant/schedule.methods';
import '../imports/both/methods/restaurant/table.method';
import '../imports/both/methods/restaurant/waiter-queue/waiter-queue.methods';
import '../imports/both/methods/restaurant/waiter-queue/queues.methods';

import '../imports/server-side/fixtures/auth/account-creation';
import '../imports/server-side/fixtures/auth/email-config';
import { removeFixtures } from '../imports/server-side/fixtures/remove-fixtures';
import { loadRoles } from '../imports/server-side/fixtures/auth/roles';
import { loadMenus } from '../imports/server-side/fixtures/auth/menus';
import { loadHours } from '../imports/server-side/fixtures/general/hours';
import { loadCurrencies } from '../imports/server-side/fixtures/general/currencies';
import { loadPaymentMethods } from '../imports/server-side/fixtures/general/paymentMethods';
import { loadCountries } from '../imports/server-side/fixtures/general/countries';
import { loadCities } from '../imports/server-side/fixtures/general/cities';
import { loadLanguages } from '../imports/server-side/fixtures/general/languages';
import { loadEmailContents } from '../imports/server-side/fixtures/general/email-contents';
import { loadParameters } from '../imports/server-side/fixtures/general/parameters';
import { loadCcPaymentMethods } from '../imports/server-side/fixtures/payments/cc-payment-methods';
import { loadInvoicesInfo } from '../imports/server-side/fixtures/payments/invoices-info';
import { createdbindexes } from '../imports/server-side/indexes/indexdb';
import { createCrons } from '../imports/server-side/cron';

Meteor.startup(() => {

    // Enable Angular's production mode if Meteor is in production mode
    if (Meteor.isProduction) {
        enableProdMode();
    }

    // When page requested
    WebApp.connectHandlers.use(async (request, response, next) => {

        let document, platformRef: PlatformRef;
        // Handle Angular's error, but do not prevent client bootstrap
        try {

            document = await WebAppInternals.getBoilerplate(request, WebApp.defaultArch);

            // Integrate Angular's router with Meteor
            const url = request.url;

            // Get rendered document
            platformRef = platformDynamicServer([
                {
                    provide: INITIAL_CONFIG,
                    useValue: {
                        // Initial document
                        document,
                        url
                    }
                }
            ]);

            const appModuleRef = await platformRef.bootstrapModule(ServerAppModule, {
                providers: [
                    {
                        provide: ResourceLoader,
                        useValue: {
                            get: Assets.getText
                        },
                        deps: []
                    }
                ]
            });

            const applicationRef: ApplicationRef = appModuleRef.injector.get(ApplicationRef);

            await applicationRef.isStable
                .first(isStable => isStable == true)
                .toPromise();

            // Run any BEFORE_APP_SERIALIZED callbacks just before rendering to string.
            const callbacks = appModuleRef.injector.get(BEFORE_APP_SERIALIZED, null);
            if (callbacks) {
                for (const callback of callbacks) {
                    try {
                        callback();
                    } catch (e) {
                        // Ignore exceptions.
                        console.warn('Ignoring BEFORE_APP_SERIALIZED Exception: ', e);
                    }
                }
            }

            const platformState: PlatformState = appModuleRef.injector.get(PlatformState);

            document = platformState.renderToString();

        } catch (e) {

            // Write errors to console
            console.error('Angular SSR Error: ' + e.stack || e);

        } finally {

            //Make sure platform is destroyed before rendering

            if (platformRef) {
                platformRef.destroy();
            }

            response.end(document);

        }
    })

    removeFixtures();
    loadMenus();
    loadRoles();
    loadHours();
    loadCurrencies();
    loadPaymentMethods();
    loadCountries();
    loadCities();
    loadLanguages();
    createdbindexes();
    loadEmailContents();
    loadParameters();
    loadCcPaymentMethods();
    loadInvoicesInfo();
    createCrons();
});
