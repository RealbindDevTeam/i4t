import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Countries } from '../both/collections/settings/country.collection';
import { Email } from 'meteor/email';

export function createCrons() {
  let activeCountries = Countries.collection.find({ is_active: true }).fetch();
  activeCountries.forEach(country => {

    SyncedCron.add({
      name: 'SCHEDULED.' + country.name,
      schedule: function (parser) {
        // parser is a later.parse object
        return parser.cron(country.cronSchedule);
      },
      job: function () {
        var numbersCrunched = showText(country);
        return numbersCrunched;
      }
    });
  });
}

export function showText(country) {
  console.log(country._id);
}

SyncedCron.start();