import { Meteor } from 'meteor/meteor';
import { Job, JobCollection } from 'meteor/vsivsi:job-collection';
import { UserDetail } from '../../../models/auth/user-detail.model';
import { UserDetails } from '../../../collections/auth/user-detail.collection';
import { WaiterCallDetail } from '../../../models/restaurant/waiter-call-detail.model';
import { WaiterCallDetails } from '../../../collections/restaurant/waiter-call-detail.collection';

var _queue = JobCollection('waiterCallQueue');
var _randomLast : number;

if (Meteor.isServer) {
    Meteor.startup(function () {
        _queue.startJobServer();

        //console.log("JobServer started: " + _queue.startJobServer());

        var workers = _queue.processJobs(
          'waiterCall',
          {
            concurrency: 1,
            payload: 1,
            pollInterval: 1*1000,
            prefetch: 1
          },
          function (job, callback) {
            var data_detail = WaiterCallDetails.collection.findOne({ _id : job.data.waiter_call_detail_id });
            var usr_id_enabled : string = validateWaiterEnabled( data_detail.restaurant_id );
            if( usr_id_enabled ){
              job.done(function (err, result){
              WaiterCallDetails.update({ _id : job.data.waiter_call_detail_id },
                  { $set : { "waiter_id" : usr_id_enabled, "status" : "completed" }
                });
              });
              UserDetails.update({user_id : usr_id_enabled} , { $set : { "enabled" : false } });
            }
            else {
              _queue.getJob(job._doc._id, function (err, job) {
                job.cancel();
                var data  : any = {
                  waiter_call_id : job._doc.data.waiter_call_detail_id,
                  restaurants : data_detail.restaurant_id,
                  tables : data_detail.table_id,
                  user : data_detail.user_id,
                  waiter_id : usr_id_enabled,
                  status : 'waiting'
                };
                job.remove(function (err, result) {
                  if (result) {
                    Meteor.call('waiterCall', true, data);
                  }
                });
              });
            }
            callback();
          }
        );
    });

}

Meteor.methods({
  waiterCall : function( _priorityHigh : boolean, _data : any){
    let priority : string = 'normal';
    let delay : number = 0;
    var waiterCallDetail : string;
    if (_priorityHigh) priority = 'critical', delay = 1*50000;
    
    if ( !_priorityHigh ) {
      waiterCallDetail = WaiterCallDetails.collection.insert({
        restaurant_id : _data.restaurants,
        table_id : _data.tables,
        user_id : _data.user,
        status : _data.status
        //status : "waiting"
      });
    } else {
      WaiterCallDetails.update({ _id : _data.waiter_call_id }, { $set : { waiter_id : _data.waiter_id }});
      waiterCallDetail = _data.waiter_call_id;
    }
    
    if(waiterCallDetail){
      Job(_queue,
        'waiterCall',
        { waiter_call_detail_id : waiterCallDetail }
      )
      .priority(priority)
      .delay(delay)
      .save();
    }
    return
  }
  
});

export function validateWaiterEnabled( _restaurant : string) : string {
  var waiterEnabled = UserDetails.collection.find({ restaurant_work : _restaurant, enabled : true, role_id : "200"});
  if(waiterEnabled.count() > 0){
    let position : number = 0;
    do {
      position = getRandomInt( 0, waiterEnabled.count() - 1);
    }
    while(position == _randomLast && position > 0);
    _randomLast = position;
    let usr_id = waiterEnabled.fetch()[position].user_id;
    return usr_id;
  } else {
    return null;
  }

}

export function getRandomInt(min, max) : number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}