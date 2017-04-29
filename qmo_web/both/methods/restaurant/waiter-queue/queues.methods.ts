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
            }
            let queueCollection = JobCollection(queueNew.name);
        } else {
            Queues.insert({
                 queues : [queueNew]
            });
            let queueCollection = JobCollection(queueNew.name);
        }
    }
  });
}