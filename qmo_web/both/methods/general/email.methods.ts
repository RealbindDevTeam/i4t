import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';
import { EmailContents } from '../../collections/general/email-content.collection';
import { EmailContent } from '../../models/general/email-content.model';
import { Restaurants } from '../../collections/restaurant/restaurant.collection';
import { Restaurant } from '../../models/restaurant/restaurant.model';
import { Users } from '../../collections/auth/user.collection';
import { User } from '../../models/auth/user.model';
import { Parameters } from '../../collections/general/parameter.collection';



if (Meteor.isServer) {
    Meteor.methods({
        /**
         * This function validate if restaurant trial period has ended
         */
        validateTrialPeriod: function (_countryId: string) {
            console.log('### _countryId: ' + _countryId);

            var currentDate: Date = new Date();
            var currentString: string = Meteor.call('convertDate', currentDate);
            console.log('### currentDate: ' + currentString);

            var trialDays: number = Number.parseInt(Parameters.collection.findOne({ name: 'trial_days' }).value);
            console.log('### trialDays: ' + trialDays);

            var firstAdviceDays: number = Number.parseInt(Parameters.collection.findOne({ name: 'first_advice_days' }).value);
            console.log('### warningDays: ' + firstAdviceDays);

            var secondAdviceDays: number = Number.parseInt(Parameters.collection.findOne({ name: 'second_advice_days' }).value);
            console.log('### warningDays: ' + secondAdviceDays);

            var thirdAdviceDays: number = Number.parseInt(Parameters.collection.findOne({ name: 'third_advice_days' }).value);
            console.log('### warningDays: ' + thirdAdviceDays);

            Restaurants.collection.find({ countryId: _countryId, isActive: true, tstPeriod: true }).forEach((restaurant: Restaurant) => {

                console.log('-----------------------------------------------');
                console.log('*********' + restaurant.name);
                console.log('****** restaurant.creation_date: ' + restaurant.creation_date);
                let diff = Math.round((currentDate.valueOf() - restaurant.creation_date.valueOf()) / (1000 * 60 * 60 * 24));
                console.log('****** diff: ' + diff);

                let forwardDate: Date = Meteor.call('addDays', restaurant.creation_date, trialDays);
                console.log('****** forwardDate: ' + forwardDate);
                let forwardString: string = Meteor.call('convertDate', forwardDate);
                console.log('****** forwardString: ' + forwardString);

                let firstAdviceDate: Date = Meteor.call('substractDays', forwardDate, firstAdviceDays);
                console.log('****** firstAdviceDate: ' + firstAdviceDate);
                let firstAdviceString: string = Meteor.call('convertDate', firstAdviceDate);
                console.log('****** firstAdviceString: ' + firstAdviceString);

                let secondAdviceDate: Date = Meteor.call('substractDays', forwardDate, secondAdviceDays);
                console.log('****** secondAdviceDate: ' + secondAdviceDate);
                let secondAdviceString: string = Meteor.call('convertDate', secondAdviceDate);
                console.log('****** secondAdviceString: ' + secondAdviceString);


                let thirdAdviceDate: Date = Meteor.call('substractDays', forwardDate, thirdAdviceDays);
                console.log('****** thirdAdviceDate: ' + thirdAdviceDate);
                let thirdAdviceString: string = Meteor.call('convertDate', thirdAdviceDate);
                console.log('****** thirdAdviceString: ' + thirdAdviceString);

                if (diff > trialDays) {
                    Restaurants.collection.update({ _id: restaurant._id }, { $set: { isActive: false } })
                } else {
                    if(currentString == firstAdviceString || currentString == secondAdviceString || currentString == thirdAdviceString){
                        Meteor.call('sendEmail', restaurant.creation_user);
                    }
                }
            });

            /*
                        Email.send({
                            to: "clgrhc@gmail.com",
                            from: "leonardogonzalez@realbind.com",
                            subject: "Example Email",
                            text: "Correo enviado desde tarea programada en meteor method " + _countryId
                        });
            */
            return "emailSend";
        },
        /**
         * This function convert the day and returning in format yyyy-m-d
         */
        convertDate: function (_date: Date) {
            let year = _date.getFullYear();
            let month = _date.getMonth() + 1;
            let day = _date.getDate();

            return year.toString() + '-' + month.toString() + '-' + day.toString();
        },
        /**
         * This function add days to the passed date
         */
        addDays: function (_date: Date, _days: number) {
            var result = new Date(_date);
            result.setDate(result.getDate() + _days);
            return result;
        },
        /**
         * This function substract days to the passed date
         */
        substractDays: function (_date: Date, _days: number) {
            var result = new Date(_date);
            result.setDate(result.getDate() - _days);
            return result;
        },
        sendEmail: function (_userId: string){
            let user: User = Users.collection.findOne({_id: _userId})
            console.log('SE ENVÍA CORREO A '+ user.emails[0].address);
        }
    });
}