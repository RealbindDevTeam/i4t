import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Countries } from '../both/collections/settings/country.collection';
import { Email } from 'meteor/email';

export function createCrons() {
  let activeCountries = Countries.collection.find({ is_active: true }).fetch();
  activeCountries.forEach(country => {

    SyncedCron.add({
      name: 'SCHEDULE_TRIAL.' + country.name,
      schedule: function (parser) {
        return parser.cron(country.cronSchedule);
      },
      job: function () {
        var numbersCrunched = Meteor.call('validateTrialPeriod', country._id);
        return numbersCrunched;
      }
    });
  });
}

SyncedCron.start();