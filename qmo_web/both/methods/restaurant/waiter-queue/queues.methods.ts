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
     * This Meteor Method add job in the Waiter call queue
     * @param {boolean} _priorityHigh
     * @param {any} _data
     */
    queueValidate( _queue : string ) {

        var queueNew : QueueName;
        var queues   : Queue = Queues.collection.findOne();
        //console.log(queues.queues);

        if(queues){
            console.log("Existe Collection");
            let toArray = Queues.collection.findOne({
                queues : { $in : [ _queue ] }
            });

            console.log(toArray);

        } else {
            queueNew = {
                name : _queue
            }
            Queues.insert({
                 queues : [queueNew]
            });
        }


        //var queue: any;
        //let col = new Mongo.Collection( '' );
        //var collection = col.rawCollection();
//
        //console.log('prueba');
        //console.log(collection);
//
        //let col2 = new Mongo.Collection( 'cities' );
        //var collection2 = col2.rawCollection();
//
        //console.log('cities');
        //console.log(collection2);        

        //let countPrueba = col.find().count();
        //console.log('--> ' + countPrueba);

       /*if( collection.s.name !== '' ){
            console.log('existe');
            queue = _queue
        } else {
            console.log('No existe');            
            queue = JobCollection(_queue);
        }

        var job = new Job(
            queue,
            'waiterCall',
            { waiter_call_detail_id : '-------' }
        )
        //.priority(priority)
        //.delay(delay)
        .save();*/
    }
  });
}