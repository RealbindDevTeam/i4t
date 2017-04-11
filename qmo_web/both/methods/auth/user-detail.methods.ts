import { Meteor } from 'meteor/meteor';
import { UserDetails } from '../../collections/auth/user-detail.collection';
import { UserDetail } from '../../models/auth/user-detail.model';

if (Meteor.isServer) {
    Meteor.methods({
        getRole: function () {
            let role: string;
            let userDetail = UserDetails.collection.findOne({user_id: this.userId});
            role = userDetail.role_id;
            return role;
        }
    });

    Meteor.methods({
        getDetailsCount: function () {
            let count: number;
            count = UserDetails.collection.find({user_id: this.userId}).count();
            return count;
        }
    });
}


    
