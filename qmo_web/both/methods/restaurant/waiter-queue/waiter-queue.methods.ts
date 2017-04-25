import { Meteor } from 'meteor/meteor';
import { Job, JobCollection } from 'meteor/vsivsi:job-collection';
import { UserDetail } from '../../../models/auth/user-detail.model';
import { UserDetails } from '../../../collections/auth/user-detail.collection';
import { WaiterCallDetail } from '../../../models/restaurant/waiter-call-detail.model';
import { WaiterCallDetails } from '../../../collections/restaurant/waiter-call-detail.collection';
import { Restaurant, RestaurantTurn } from '../../../models/restaurant/restaurant.model';
import { Restaurants, RestaurantTurns } from '../../../collections/restaurant/restaurant.collection';

var _queue = JobCollection('waiterCallQueue');

if (Meteor.isServer) {

  /**
   * This function startup the Waiter call queue, also allow execute each jobs
   * Validate state of Jobs Queue: console.log("JobServer started: " + _queue.startJobServer());
   */
  Meteor.startup(function () {
      
    _queue.startJobServer();

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
        var restaurant = Restaurants.collection.findOne({ _id : data_detail.restaurant_id });
        
        var usr_id_enabled : UserDetail = Meteor.call('validateWaiterEnabled', data_detail.restaurant_id, restaurant.max_jobs);
        if( usr_id_enabled ){
          job.done(function (err, result){
            //Storage of turns the restaurants by date
            var toDate = new Date().toLocaleDateString();
            RestaurantTurns.update({restaurant_id : data_detail.restaurant_id , creation_date : { $gte : new Date(toDate)}}, 
              {$set : { last_waiter_id : usr_id_enabled.user_id , modification_user: 'SYSTEM', modification_date: new Date(),  }
            });
            //Waiter call detail update in completed state
            WaiterCallDetails.update({ _id : job.data.waiter_call_detail_id },
              { $set : { "waiter_id" : usr_id_enabled.user_id, "status" : "completed"}
              });
            });

            //Waiter update of current jobs and state
            let usr_jobs : number = usr_id_enabled.jobs + 1 ;
            if ( usr_jobs < restaurant.max_jobs ) {
              UserDetails.update({user_id : usr_id_enabled.user_id} , { $set : { "jobs" : usr_jobs } });
            } else if ( usr_jobs == restaurant.max_jobs ){
              UserDetails.update({user_id : usr_id_enabled.user_id} , { $set : { "enabled" : false, "jobs" : usr_jobs } });
            }
        } else {
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
      });
  });
  
  Meteor.methods({
    /**
     * This Meteor Method add job in the Waiter call queue
     * @param {boolean} _priorityHigh
     * @param {any} _data
     */
    waiterCall : function( _priorityHigh : boolean, _data : any){
      let priority : string = 'normal';
      let delay : number = 0;
      var waiterCallDetail : string;
      if (_priorityHigh) {
        priority = 'critical', delay = 1*50000;
        WaiterCallDetails.update({ _id : _data.waiter_call_id }, { $set : { waiter_id : _data.waiter_id }});
        waiterCallDetail = _data.waiter_call_id;
      } else {
        var toDate = new Date().toLocaleDateString();
        let newTurn : number = 1; //= restaurantTurn.turn + 1;

        var restaurantTurn : RestaurantTurn = RestaurantTurns.collection.findOne({
          restaurant_id : _data.restaurants,
          creation_date : { $gte : new Date(toDate)}
        });

        if(restaurantTurn){
          newTurn = restaurantTurn.turn + 1;
          RestaurantTurns.update(
            {_id : restaurantTurn._id}, 
            {$set : { turn : newTurn, modification_user: 'SYSTEM', modification_date: new Date(),  }
          });
        } else {
          RestaurantTurns.insert({
            restaurant_id : _data.restaurants,
            turn : newTurn,
            last_waiter_id : "",
            creation_user: 'SYSTEM',
            creation_date: new Date(),
          });
        }

        waiterCallDetail = WaiterCallDetails.collection.insert({
          restaurant_id : _data.restaurants,
          table_id : _data.tables,
          user_id : _data.user,
          turn : newTurn,
          status : _data.status,
          creation_user : _data.user,
          creation_date : new Date(),
        });
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
    },
    /**
     * This Meteor Method allow delete a job in the Waiter call queue
     * @param {string} _waiter_call_detail_id
     * @param {string} _waiter_id
     */
    closeCall : function( _waiter_call_detail_id : string, _waiter_id : string ){
      let job = new Job(_queue, _queue.findOne({ "data.waiter_call_detail_id" : _waiter_call_detail_id }));
      job.remove(function (err, result){
        WaiterCallDetails.update({ _id : _waiter_call_detail_id },
          { $set : { "status" : "closed", modification_user : _waiter_id, modification_date : new Date() }
        });
        let usr_detail = UserDetails.collection.findOne({ user_id : _waiter_id });
        let jobs = usr_detail.jobs - 1;
        UserDetails.update({user_id : _waiter_id} , { $set : { "enabled" : true, "jobs" : jobs } });
      });
      return;
    },
  
    /**
     * This function validate waiters enabled
     * @param {string} _restaurant
     * @param {string} _maxJobs
     */
    validateWaiterEnabled ( _restaurant : string, _maxJobs : string ) : UserDetail {
      let usr_id      : UserDetail = null;
      let position    : number   = 0;
      let _randomLast : string;
        
      let waiterEnabled = UserDetails.collection.find({ restaurant_work : _restaurant, enabled : true, role_id : "200", jobs : {$lt : _maxJobs} });
      if( waiterEnabled.count() > 0 ) {
        let restaurantTurn = RestaurantTurns.collection.findOne({ "restaurant_id" : _restaurant },
          {
            sort : {"creation_date":-1}
          }
        );

        if( restaurantTurn ){
          _randomLast = restaurantTurn.last_waiter_id;
        }
        do {
          position = Meteor.call('getRandomInt', 0, waiterEnabled.count() - 1);
          usr_id = waiterEnabled.fetch()[position];
        }
        while( usr_id.user_id === _randomLast && waiterEnabled.count() > 0);
        return usr_id;
      } else {
        return null;
      }
    },

    /**
    * This function return a random number
    * @param {string} _restaurant
    */
    getRandomInt(min, max) : number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  });
}
