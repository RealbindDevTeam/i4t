import './imports/publications/administration/sections';
import { Meteor } from 'meteor/meteor';
import './imports/fixtures/auth/account-creation';
import './imports/publications/administration/categories';
import './imports/publications/administration/subcategories';
import './imports/publications/administration/additions';
import './imports/publications/administration/promotions';
import './imports/publications/administration/garnish-food';
import './imports/publications/auth/users';
import './imports/publications/auth/roles';
import './imports/publications/auth/menus';
import './imports/publications/restaurant/restaurant';
import './imports/publications/general/hour';
import './imports/publications/general/currency';
import '../both/methods/restaurant/restaurant.methods';
import './imports/publications/general/paymentMethod';
import '../both/methods/auth/menu.methods';
import '../both/methods/auth/user-detail.methods';
import '../both/methods/restaurant/waiter-queue/waiter-queue.methods';
import './imports/publications/settings/cities';
import './imports/publications/settings/countries';
import './imports/publications/settings/languages';
import '../both/methods/administration/promotion.methods';
import './imports/publications/restaurant/table';
import './imports/publications/administration/item';
import './imports/fixtures/auth/email-config';
import './imports/publications/auth/collaborators';
import './imports/publications/auth/user-details';
import './imports/publications/restaurant/account';
import './imports/publications/restaurant/order';
import './imports/publications/restaurant/waiter-call';
import './imports/publications/restaurant/restaurant-plan';
import './imports/publications/general/email-content';
import './imports/publications/general/parameter';
import './imports/publications/restaurant/payment';

import { loadRoles } from './imports/fixtures/auth/roles';
import { loadMenus } from './imports/fixtures/auth/menus';
import { loadHours } from './imports/fixtures/general/hours';
import { loadCurrencies } from './imports/fixtures/general/currencies';
import { loadPaymentMethods } from './imports/fixtures/general/paymentMethods';
import { loadCountries } from './imports/fixtures/settings/countries';
import { loadCities } from './imports/fixtures/settings/cities';
import { loadLanguages } from './imports/fixtures/settings/languages';
import { loadRestaurantPlans } from './imports/fixtures/restaurant/restaurant-plans';
import { loadEmailContents } from './imports/fixtures/general/email-contents';
import { createCrons } from './cron';
import { loadParameters } from './imports/fixtures/general/parameters';

import { createdbindexes } from './imports/indexes/indexdb';

Meteor.startup(() => {
    loadMenus();
    loadRoles();
    loadHours();
    loadCurrencies();
    loadPaymentMethods();
    loadCountries();
    loadCities();
    loadLanguages();
    createdbindexes();
    loadRestaurantPlans();
    createCrons();
    loadEmailContents();
    loadParameters();
});
