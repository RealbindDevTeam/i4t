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
         * This function insert active restraurants in history_payment
         * @param {string} _countryId
         */
        validateActiveRestaurants: function (_countryId: string) {
            let _currentDate = new Date(2017, 5, 3);
            let _firstMonthDay = new Date(_currentDate.getFullYear(), _currentDate.getMonth() + 1, 1);
            let _lastMonthDay = new Date(_firstMonthDay.getFullYear(), _firstMonthDay.getMonth() + 1, 0);
            let _month = (_firstMonthDay.getMonth() + 1).toString();
            let _year = _firstMonthDay.getFullYear().toString();

            Restaurants.collection.find({ countryId: _countryId, isActive: true }).forEach((restaurant: Restaurant) => {
                console.log(restaurant.name);
                HistoryPayments.collection.insert({
                    restaurantId: restaurant._id,
                    startDate: _firstMonthDay,
                    endDate: _lastMonthDay,
                    month: _month,
                    year: _year,
                    status: 'NOT_PAID'
                })
            });
        },
        /**
         * This function change the freeDays flag to false
         * * @param {string} _countryId
         */
        changeFreeDaysToFalse: function (_countryId: string) {
            Restaurants.collection.update({ countryId: _countryId, freeDays: true }, { $set: { freeDays: false } });
        },
        /**
         * This function send the email to warb for iurest charge soon
         * * @param {string} _countryId
         */
        sendEmailChargeSoon: function (_countryId: string) {
            Restaurants.collection.find({ countryId: _countryId, isActive: true, freeDays: false }).forEach((restaurant: Restaurant) => {
                let user: User = Users.collection.findOne({ _id: restaurant.creation_user });
                let parameter: Parameter = Parameters.collection.findOne({ name: 'from_email' });
                let emailContent: EmailContent = EmailContents.collection.findOne({ language: user.profile.language_code });

                let subjectVar = Meteor.call('getEmailContent', emailContent.lang_dictionary, 'charge_soon_email_subject');
                console.log('*** variable subjectVar: ' + subjectVar);
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
        }
    });
}