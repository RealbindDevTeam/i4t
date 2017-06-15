import { Meteor } from 'meteor/meteor';
import { Accounts } from '../../collections/restaurant/account.collection';
import { Orders } from '../../collections/restaurant/order.collection';
import { Payments } from '../../collections/restaurant/payment.collection';
import { Tables } from '../../collections/restaurant/table.collection';
import { UserDetails } from "../../collections/auth/user-detail.collection";

if(Meteor.isServer){
    Meteor.methods({

        closePay : function (_restaurantId : string , _tableId : string) {
            
            let _paymentsToPay : any;
            let _countOrders   : number = 0;

            _paymentsToPay = Payments.collection.find( { restaurantId: _restaurantId, tableId: _tableId, status: 'PAYMENT.NO_PAID' } )
            
            _paymentsToPay.fetch().forEach((pay)=>{
                pay.orders.forEach((order)=> {
                    Orders.update({_id : order}, { $set : { status : 'ORDER_STATUS.CLOSED' }});
                });
                Payments.update({_id : pay._id },{ $set : { status : 'PAYMENT.PAID' }});
                let orderOwner = Orders.collection.find({creation_user : pay.creation_user, status : 
                    { $in : ['ORDER_STATUS.REGISTERED','ORDER_STATUS.IN_PROCESS','ORDER_STATUS.PREPARED','ORDER_STATUS.DELIVERED','ORDER_STATUS.PENDING_CONFIRM']}}).count();
                if(orderOwner===0){
                    UserDetails.update({ user_id : pay.creation_user },{ $set : { current_restaurant : '', current_table : '' }});
                    let currentTable = Tables.findOne({_id: _tableId});
                    Tables.update({ _id :  _tableId }, { $set : { amount_people : (currentTable.amount_people - 1) }});
                }
            });
            
            _countOrders = Orders.collection.find({ restaurantId: _restaurantId, tableId: _tableId, status: 
                { $in : ['ORDER_STATUS.REGISTERED','ORDER_STATUS.IN_PROCESS','ORDER_STATUS.PREPARED','ORDER_STATUS.DELIVERED','ORDER_STATUS.PENDING_CONFIRM'] }  }).count();
            
            if ( _countOrders === 0 ) {
                let accountTable = Accounts.collection.findOne({tableId : _tableId});
                Accounts.update({ _id : accountTable._id }, { $set : { status : 'CLOSED' } });
                Tables.update({ _id :  _tableId }, { $set : { status : 'FREE', amount_people : 0 }});
            }
        }
    });
}