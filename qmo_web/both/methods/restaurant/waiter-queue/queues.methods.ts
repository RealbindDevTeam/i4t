import { Meteor } from 'meteor/meteor';
import { MongoObservable } from 'meteor-rxjs'
import { Job, JobCollection } from 'meteor/vsivsi:job-collection';
import { UserDetail } from '../../../models/auth/user-detail.model';
import { UserDetails } from '../../../collections/auth/user-detail.collection';
import { WaiterCallDetail } from '../../../models/restaurant/waiter-call-detail.model';
import { WaiterCallDetails } from '../../../collections/restaurant/waiter-call-detail.collection';
import { Restaurant, RestaurantTurn } from '../../../models/restaurant/restaurant.model';
import { Restaurants, RestaurantTurns } from '../../../collections/restaurant/restaurant.collection';
import { Queue, QueueName } from '../../../models/general/queue.model';
import { Queues } from '../../../collections/general/queue.collection';

if (Meteor.isServer) {

  Meteor.startup(function () {

    let queues : Queue = Queues.collection.findOne({});
    if(queues){
        queues.queues.forEach(element => {
            let queueCollection = JobCollection(element.name);
            console.log("JobServer started: " + queueCollection.startJobServer());
            
            var workers = queueCollection.processJobs(
                'waiterCall',
                {
                    concurrency: 1,
                    payload: 1,
                    pollInterval: 1*1000,
                    prefetch: 1
                },
                function (job, callback) {
                    var data_detail = WaiterCallDetails.collection.findOne({ _id : job._doc.data.waiter_call_detail_id });
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
                        WaiterCallDetails.update({ _id : job._doc.data.waiter_call_detail_id },
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
                        queueCollection.getJob(job._doc._id, function (err, job) {
                            job.cancel();
                            var data  : any = {
                                waiter_call_id : job.data.waiter_call_detail_id,
                                restaurants : data_detail.restaurant_id,
                                tables : data_detail.table_id,
                                user : data_detail.user_id,
                                waiter_id : usr_id_enabled,
                                status : 'waiting'
                            };
                            job.remove(function (err, result) {
                                if (result) {
                                    Meteor.call('waiterCall', element.name,true, data);
                                }
                            });
                        });
                    }
                    callback();
                }
            );
        });
    }
  });

  Meteor.methods({
      
    /**
     * This Meteor Method allow find the queue corresponding to current restaurant of the user
     * @param { string } _restaurantId
     */
    findQueueByRestaurant : function ( _restaurantId : string, _data : any ) {
        let restaurant = Restaurants.collection.findOne({_id : _restaurantId});
        let queue = restaurant.queue;
        let valEmpty : boolean = Number.isInteger(restaurant.queue.length);
        let queueName : string = "";

        if (valEmpty && restaurant.queue.length > 0){
            let position = Meteor.call('getRandomInt', 0, restaurant.queue.length - 1);
            if ( restaurant.queue[position] !== "" ) {
                queueName = "queue" + position;
                Meteor.call("queueValidate", queueName, function(err, result){
                    if(err){
                        console.log('Error : ' + err);
                        throw new Error("Error on Queue validating");
                    } else {
                        Meteor.call('waiterCall', queueName, false, _data);
                    }
                });
            }
        }
    },

    /**
     * This Meteor Method validate if exist queue in the collection
     * @param { string } _queue
     */
    queueValidate : function ( _queue : string ) {
        let queueNew        : QueueName = { name : _queue };;
        let queues          : Queue = Queues.collection.findOne({});
        if(queues){
            let doc = Queues.collection.findOne({ queues : { $elemMatch: { name : _queue } } });
            if(!doc){
                Queues.update({ _id : queues._id }, 
                    { $addToSet : { queues :  queueNew }
                });
                let queueCollection = JobCollection(queueNew.name);
            }
        } else {
            Queues.insert({
                 queues : [queueNew]
            });
            let queueCollection = JobCollection(queueNew.name);
        }
    }
  });
}