import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';
import { EmailContents } from '../../collections/general/email-content.collection';
import { EmailContent } from '../../models/general/email-content.model';
import { LangDictionary } from '../../models/general/email-content.model';
import { Restaurants } from '../../collections/restaurant/restaurant.collection';
import { Restaurant } from '../../models/restaurant/restaurant.model';
import { HistoryPayments } from '../../collections/payment/history-payment.collection';
import { HistoryPayment } from '../../models/payment/history-payment.model';
import { Users } from '../../collections/auth/user.collection';
import { User } from '../../models/auth/user.model';
import { Parameters } from '../../collections/general/parameter.collection';
import { Parameter } from '../../models/general/parameter.model';
import { SSR } from 'meteor/meteorhacks:ssr';


if (Meteor.isServer) {
    Meteor.methods({
        /**
         * This function change the freeDays flag to false
         * * @param {string} _countryId
         */
        changeFreeDaysToFalse: function (_countryId: string) {
            Restaurants.collection.update({ countryId: _countryId, freeDays: true }, { $set: { freeDays: false } });
        },
        /**
         * This function send the email to warn for iurest charge soon
         * * @param {string} _countryId
         */
        sendEmailChargeSoon: function (_countryId: string) {
            let parameter: Parameter = Parameters.collection.findOne({ name: 'from_email' });
            let currentDate = new Date(2017, 6, 28);
            let lastMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            let auxArray: string[] = [];

            Restaurants.collection.find({ countryId: _countryId, isActive: true }).forEach((restaurant: Restaurant) => {
                let user: User = Users.collection.findOne({ _id: restaurant.creation_user });
                let indexofvar = auxArray.indexOf(user._id);

                if (indexofvar < 0) {
                    auxArray.push(user._id);
                }
            });

            Users.collection.find({ _id: { $in: auxArray } }).forEach((user: User) => {
                let auxRestaurants: string[] = [];
                Restaurants.collection.find({ creation_user: user._id }, { fields: { _id: 0, name: 1 } }).forEach((name: Restaurant) => {
                    auxRestaurants.push(name.name);
                });

                let emailContent: EmailContent = EmailContents.collection.findOne({ language: user.profile.language_code });
                let greetVar = Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                let greeting: string = (user.profile && user.profile.first_name) ? (greetVar + ' ' + user.profile.first_name + ",") : greetVar;
                SSR.compileTemplate('chargeSoonEmailHtml', Assets.getText('charge-soon-email.html'));

                var emailData = {
                    greeting: greeting,
                    reminderMsgVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderChargeSoonMsgVar'),
                    restaurantListVar: auxRestaurants.toString(),
                    reminderMsgVar2: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderChargeSoonMsgVar2'),
                    dateVar: Meteor.call('convertDateToSimple', lastMonthDay),
                    regardVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar'),
                    followMsgVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar')
                }

                Email.send({
                    to: user.emails[0].address,
                    from: parameter.value,
                    subject: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'chargeSoonEmailSubjectVar'),
                    html: SSR.render('chargeSoonEmailHtml', emailData),
                });
            });
        },
        /**
         * This function send the email to warn for iurest expire soon
         * * @param {string} _countryId
         */
        sendEmailExpireSoon: function (_countryId: string) {
            let parameter: Parameter = Parameters.collection.findOne({ name: 'from_email' });
            let currentDate = new Date(2017, 6, 3);
            let firstMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            let maxPaymentDay = new Date(firstMonthDay);
            let endDay = Parameters.collection.findOne({ name: 'end_payment_day' });
            maxPaymentDay.setDate(maxPaymentDay.getDate() + (Number(endDay.value) - 1));
            let auxArray: string[] = [];

            Restaurants.collection.find({ countryId: _countryId, isActive: true, freeDays: false }).forEach((restaurant: Restaurant) => {
                let user: User = Users.collection.findOne({ _id: restaurant.creation_user });
                let indexofvar = auxArray.indexOf(user._id);

                if (indexofvar < 0) {
                    auxArray.push(user._id);
                }
            });

            Users.collection.find({ _id: { $in: auxArray } }).forEach((user: User) => {
                let auxRestaurants: string[] = [];
                Restaurants.collection.find({ creation_user: user._id }, { fields: { _id: 0, name: 1 } }).forEach((name: Restaurant) => {
                    auxRestaurants.push(name.name);
                });

                let emailContent: EmailContent = EmailContents.collection.findOne({ language: user.profile.language_code });
                let greetVar = Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                let greeting: string = (user.profile && user.profile.first_name) ? (greetVar + ' ' + user.profile.first_name + ",") : greetVar;
                SSR.compileTemplate('expireSoonEmailHtml', Assets.getText('expire-soon-email.html'));

                var emailData = {
                    greeting: greeting,
                    reminderMsgVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderExpireSoonMsgVar'),
                    restaurantListVar: auxRestaurants.toString(),
                    reminderMsgVar2: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderExpireSoonMsgVar2'),
                    dateVar: Meteor.call('convertDateToSimple', maxPaymentDay),
                    reminderMsgVar3: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderExpireSoonMsgVar3'),
                    regardVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar'),
                    followMsgVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar')
                }

                Email.send({
                    to: user.emails[0].address,
                    from: parameter.value,
                    subject: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'expireSoonEmailSubjectVar'),
                    html: SSR.render('expireSoonEmailHtml', emailData),
                });
            });
        },
        /**
         * This function validate the restaurant registered in history_payment and change isActive to false if is not 
         * @param {string} _countryId
         */
        validateActiveRestaurants: function (_countryId: string) {
            let currentDate: Date = new Date();
            let currentMonth: string = (currentDate.getMonth() + 1).toString();
            let currentYear: string = currentDate.getFullYear().toString();

            Restaurants.collection.find({ countryId: _countryId, isActive: true, freeDays: false }).forEach((restaurant: Restaurant) => {
                let historyPayment: HistoryPayment;
                historyPayment = HistoryPayments.collection.findOne({ restaurantId: restaurant._id, month: currentMonth, year: currentYear, status: 'PAID' });

                if (!historyPayment) {
                    Restaurants.collection.update({ _id: restaurant._id }, { $set: { isActive: false, firstPay: false } });
                }
            });
        },
        /**
         * This function send email to warn that the service has expired
         * @param {string} _countryId
         */
        sendEmailRestExpired: function (_countryId: string) {
            let parameter: Parameter = Parameters.collection.findOne({ name: 'from_email' });
            let auxArray: string[] = [];

            Restaurants.collection.find({ countryId: _countryId, isActive: false, freeDays: false, firstPay: false }).forEach((restaurant: Restaurant) => {
                let user: User = Users.collection.findOne({ _id: restaurant.creation_user });
                let indexofvar = auxArray.indexOf(user._id);

                if (indexofvar < 0) {
                    auxArray.push(user._id);
                }
            });

            Users.collection.find({ _id: { $in: auxArray } }).forEach((user: User) => {
                let auxRestaurants: string[] = [];
                Restaurants.collection.find({ creation_user: user._id, isActive: false, freeDays: false }, { fields: { _id: 0, name: 1 } }).forEach((name: Restaurant) => {
                    auxRestaurants.push(name.name);
                });

                let emailContent: EmailContent = EmailContents.collection.findOne({ language: user.profile.language_code });
                let greetVar = Meteor.call('getEmailContent', emailContent.lang_dictionary, 'greetVar');
                let greeting: string = (user.profile && user.profile.first_name) ? (greetVar + ' ' + user.profile.first_name + ",") : greetVar;
                SSR.compileTemplate('restExpiredEmailHtml', Assets.getText('rest-expired-email.html'));

                var emailData = {
                    greeting: greeting,
                    reminderMsgVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderRestExpiredVar'),
                    restaurantListVar: auxRestaurants.toString(),
                    reminderMsgVar2: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderRestExpiredVar2'),
                    reminderMsgVar3: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'reminderRestExpiredVar3'),
                    regardVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'regardVar'),
                    followMsgVar: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'followMsgVar')
                }

                Email.send({
                    to: user.emails[0].address,
                    from: parameter.value,
                    subject: Meteor.call('getEmailContent', emailContent.lang_dictionary, 'restExpiredEmailSubjectVar'),
                    html: SSR.render('restExpiredEmailHtml', emailData),
                });
            });
        },
        /**
         * This function gets the value from EmailContent collection
         * * @param {string} _countryId
         */
        getEmailContent(_langDictionary: LangDictionary[], _label: string): string {
            let value = _langDictionary.filter(function (wordTraduced) {
                return wordTraduced.label == _label;
            });
            return value[0].traduction;
        },
        /**
         * This function convert the day and returning in format yyyy-m-d
         */
        convertDateToSimple: function (_date: Date) {
            let year = _date.getFullYear();
            let month = _date.getMonth() + 1;
            let day = _date.getDate();
            return day.toString() + '/' + month.toString() + '/' + year.toString();
        }
    });
}