import { SyncedCron } from 'meteor/percolate:synced-cron';
import { showText, showText2 } from './schedule';

SyncedCron.config({
    // Log job run details to console
    log: true,

    // Use a custom logger function (defaults to Meteor's logging package)
    logger: null,

    // Name of collection to use for synchronisation and logging
    collectionName: 'cronHistory',

    // Default to using localTime
    utc: false,

    /*
      TTL in seconds for history records in collection to expire
      NOTE: Unset to remove expiry but ensure you remove the index from
      mongo by hand

      ALSO: SyncedCron can't use the `_ensureIndex` command to modify
      the TTL index. The best way to modify the default value of
      `collectionTTL` is to remove the index by hand (in the mongo shell
      run `db.cronHistory.dropIndex({startedAt: 1})`) and re-run your
      project. SyncedCron will recreate the index with the updated TTL.
    */
    collectionTTL: 172800
  });


SyncedCron.add({
  name: 'SCHEDULED TASK 1',
  schedule: function(parser) {
    // parser is a later.parse object
     return parser.cron('12 17 ? * *');
  },
  job: function() {
    var numbersCrunched = showText();
    return numbersCrunched;
  }
});

SyncedCron.add({
  name: 'SCHEDULED TASK 2',
  schedule: function(parser) {
    // parser is a later.parse object
     return parser.cron('14 17 ? * *');
  },
  job: function() {
    var numbersCrunched = showText2();
    return numbersCrunched;
  }
});

SyncedCron.add({
  name: 'SCHEDULED TASK 3',
  schedule: function(parser) {
    // parser is a later.parse object
     return parser.cron('35 18 ? * *');
  },
  job: function() {
    var numbersCrunched = showText2();
    return numbersCrunched;
  }
});

SyncedCron.start();
