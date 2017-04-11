import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

export const Users = MongoObservable.fromExisting(Meteor.users);

function loggedIn(){
    return !!Meteor.user();
}

Users.allow({
    update: loggedIn
});
