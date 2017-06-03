import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Countries } from '../both/collections/settings/country.collection';
import { Email } from 'meteor/email';

export function createCrons() {
  let activeCountries = Countries.collection.find({ is_active: true }).fetch();
  activeCountries.forEach(country => {

    SyncedCron.add({
      name: 'SCHEDULE_TRIAL.' + country.name,
      schedule: function (parser) {
        // parser is a later.parse object
        return parser.cron(country.cronSchedule);
      },
      job: function () {
        var numbersCrunched = Meteor.call('validateTrialPeriod', country._id);
        return numbersCrunched;
      }
    });
  });
}

export function showText(country) {
  console.log(country._id);

  Email.send({
    to: "clgrhc@gmail.com",
    from: "leonardogonzalez@realbind.com",
    subject: "Example Email",
    text: "The contents of our email in plain text. "+country.name
  });
}

SyncedCron.start();