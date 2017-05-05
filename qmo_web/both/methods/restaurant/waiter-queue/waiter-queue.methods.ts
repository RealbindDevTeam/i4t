import { Meteor } from 'meteor/meteor';
import { Job, JobCollection } from 'meteor/vsivsi:job-collection';
import { UserDetail } from '../../../models/auth/user-detail.model';
import { UserDetails } from '../../../collections/auth/user-detail.collection';
import { WaiterCallDetail } from '../../../models/restaurant/waiter-call-detail.model';
import { WaiterCallDetails } from '../../../collections/restaurant/waiter-call-detail.collection';
import { Restaurant, RestaurantTurn } from '../../../models/restaurant/restaurant.model';
import { Restaurants, RestaurantTurns } from '../../../collections/restaurant/restaurant.collection';

//var _queue = JobCollection('waiterCallQueue');

if (Meteor.isServer) {

  Meteor.methods({
    /**
     * This Meteor Method add job in the Waiter call queue
     * @param {boolean} _priorityHigh
     * @param {any} _data
     */
    waiterCall : function( _queue : string, _priorityHigh : boolean, _data : any){
      let priority : string = 'normal';
      let delay : number = 0;
      var waiterCallDetail : string;

      var job = new Job(
        _queue,
        'waiterCall',
        { data : '' }
      );
      job
        .priority(priority)
        .delay(delay)
        .save();

      if (_priorityHigh) {
        priority = 'critical', delay = 10000;
        WaiterCallDetails.update({ job_id : _data.job_id }, { $set : { waiter_id : _data.waiter_id, job_id : job._doc._id }});
        waiterCallDetail = _data.waiter_call_id;
      } else {
        let newTurn = Meteor.call('turnCreate', _data);
        waiterCallDetail = WaiterCallDetails.collection.insert({
          restaurant_id : _data.restaurants,
          table_id : _data.tables,
          user_id : _data.user,
          turn : newTurn,
          status : _data.status,
          creation_user : _data.user,
          creation_date : new Date(),
          queue : _queue,
          job_id : job._doc._id,
          type : _data.type
        });
      } 
      return;
    },

    processJobs : function(job, callback, queueName){
      var data_detail = WaiterCallDetails.collection.findOne({ job_id : job._doc._id });
      var restaurant = Restaurants.collection.findOne({ _id : data_detail.restaurant_id });
      
      var usr_id_enabled : UserDetail = Meteor.call('validateWaiterEnabled', data_detail.restaurant_id, restaurant.max_jobs);
      if( usr_id_enabled ){
        Job.getJob(queueName, job._doc._id, function (err, job) {
          job.done(function (err, result){});
          //Storage of turns the restaurants by date
          var toDate = new Date().toLocaleDateString();
          RestaurantTurns.update({restaurant_id : data_detail.restaurant_id , creation_date : { $gte : new Date(toDate)}}, 
            {$set : { last_waiter_id : usr_id_enabled.user_id , modification_user: 'SYSTEM', modification_date: new Date(),  }
          });
          //Waiter call detail update in completed state
          WaiterCallDetails.update({ job_id : job._doc._id },
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
          Job.getJob(queueName, job._doc._id, function (err, job) {
              job.cancel();
              var data  : any = {
                  job_id : job._doc._id,
                  restaurants : data_detail.restaurant_id,
                  tables : data_detail.table_id,
                  user : data_detail.user_id,
                  waiter_id : usr_id_enabled,
                  status : 'waiting'
              };
              job.remove(function (err, result) {
                  if (result) {
                      Meteor.call('waiterCall', queueName,true, data);
                  }
              });
          });
      }
      callback();
    },

    /**
     * This Meteor method allow get new turn to the client
     * @param { any } _data 
     */
    turnCreate ( _data : any ) : number {
      var newTurn : number = 1;
      var toDate = new Date().toLocaleDateString();
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
      return newTurn;
    },

    /**
     * This Meteor Method allow delete a job in the Waiter call queue
     * @param {string} _waiter_call_detail_id
     * @param {string} _waiter_id
     */
    closeCall : function( _jobDetail : WaiterCallDetail, _waiter_id : string ){
      Job.getJob(_jobDetail.queue, _jobDetail.job_id, function (err, job) {
        job.remove(function (err, result){
          WaiterCallDetails.update({ job_id : _jobDetail.job_id },
            { $set : { "status" : "closed", modification_user : _waiter_id, modification_date : new Date() }
          });
          let usr_detail = UserDetails.collection.findOne({ user_id : _waiter_id });
          let jobs = usr_detail.jobs - 1;
          UserDetails.update({user_id : _waiter_id} , { $set : { "enabled" : true, "jobs" : jobs } });
        });
      });
      return;
    },
  
    /**
     * This function validate waiters enabled
     * @param {string} _restaurant
     * @param {string} _maxJobs
     */
    validateWaiterEnabled ( _restaurant : string, _maxJobs : string ) : UserDetail {
      let usr     : UserDetail = null;
      let position    : number   = 0;
      let _randomLast : string;
        
      let waiterEnableds = UserDetails.collection.find({ restaurant_work : _restaurant, enabled : true, role_id : "200", jobs : {$lt : _maxJobs} });
      var count =  waiterEnableds.count();

      if( count > 0 ) {
        let restaurantTurn = RestaurantTurns.collection.findOne({ "restaurant_id" : _restaurant },
          {
            sort : {"creation_date":-1}
          }
        );
        if( restaurantTurn ){
          _randomLast = restaurantTurn.last_waiter_id;
        }
        do {
          position = Meteor.call('getRandomInt', 0, count - 1);
          usr = waiterEnableds.fetch()[position];
        }
        while( usr.user_id == _randomLast && count > 1);
        return usr;
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
