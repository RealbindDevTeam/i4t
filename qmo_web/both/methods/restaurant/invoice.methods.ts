import { Meteor } from 'meteor/meteor';
import { Invoice, InvoiceItem, InvoiceAddition, FinancialInformation } from '../../models/restaurant/invoice.model';
import { Invoices } from '../../collections/restaurant/invoice.collection';
import { Restaurants } from '../../collections/restaurant/restaurant.collection';
import { Tables } from '../../collections/restaurant/table.collection';
import { Orders } from '../../collections/restaurant/order.collection';
import { Items } from '../../collections/administration/item.collection';
import { GarnishFoodCol } from '../../collections/administration/garnish-food.collection';
import { Additions } from '../../collections/administration/addition.collection';
import { Currencies } from "../../collections/general/currency.collection";
import { PaymentMethods } from "../../collections/general/paymentMethod.collection";

if (Meteor.isServer) {
    Meteor.methods({
        /**
         * This function allow Invoice generate
         * @param { string } _restaurantId
         */
        invoiceGenerating : function( _pPay : any ) {
            let lRestaurant = Restaurants.findOne({_id : _pPay.restaurantId});
            let lTable      = Tables.findOne({_id : _pPay.tableId});
            let lCurrency   = Currencies.findOne({_id : lRestaurant.currencyId});
            let lPayMethod  = PaymentMethods.findOne({_id : _pPay.paymentMethodId});

            let lInvoiceItems         : InvoiceItem[] = [];
            let lInvoiceAdditions     : InvoiceAddition[] = [];
            let lFinantialInformation : FinancialInformation;
            
            _pPay.orders.forEach((order)=> {
                let lOrder = Orders.findOne({_id : order});
                
                lOrder.items.forEach((item)=> {
                    let lItem = Items.findOne({_id : item.itemId});
                    let lGarnishFood : any[] = [];
                    let lAdditions   : any[] = [];
                    
                    if(item.garnishFood.length > 0){
                        item.garnishFood.forEach((gf)=>{
                            let lgf = GarnishFoodCol.findOne({_id : gf});
                            lGarnishFood.push({ garnish_food_name : lgf.name, 
                                                price : lgf.restaurants.filter( g => g.restaurantId === _pPay.restaurantId )[0].price });
                        });
                    }
                    if(item.additions.length > 0){
                        item.additions.forEach((ad) => {
                            let lad = Additions.findOne({_id: ad});
                            lAdditions.push({ addition_name : lad.name,
                                              price : lad.restaurants.filter( a => a.restaurantId === _pPay.restaurantId)[0].price});
                        });
                    }
                    let lInvoiceItem : InvoiceItem = {
                        item_name    : lItem.name,
                        quantity     : item.quantity,
                        garnish_food : lGarnishFood,
                        additions    : lAdditions,
                        price        : lItem.restaurants.filter( i => i.restaurantId === _pPay.restaurantId)[0].price,
                    }
                    lInvoiceItems.push(lInvoiceItem);
                });

                lOrder.additions.forEach((addition) => {
                    let lAddition = Additions.findOne({_id : addition.additionId});
                    let lAddAddition : InvoiceAddition = {
                        addition_name : lAddition.name,
                        quantity      : addition.quantity,
                        price         : lAddition.restaurants.filter( a => a.restaurantId === _pPay.restaurantId)[0].price,
                    }
                    lInvoiceAdditions.push(lAddAddition);
                });
            });
            
            lFinantialInformation = {
                business_name        : lRestaurant.financialInformation['BUSINESS_NAME'],
                nit                  : lRestaurant.financialInformation['NIT'],
                dian_numeration_from : lRestaurant.financialInformation['DIAN_NUMERATION_FROM'],
                dian_numeration_to   : lRestaurant.financialInformation['DIAN_NUMERATION_TO'],
                tip_porcentage       : lRestaurant.financialInformation['TIP_PERCENTAGE'],
                address              : lRestaurant.address,
                phone                : lRestaurant.phone,
            }
            
            Invoices.insert({
                restaurant_id         : _pPay.restaurantId,
                payment_id            : _pPay._id,
                restaurant_name       : lRestaurant.name,
                table_number          : lTable._number,
                total_pay             : _pPay.totalToPayment,
                total_order           : _pPay.totalOrdersPrice,
                total_tip             : _pPay.totalTip,
                customer_id           : _pPay.userId,
                currency              : lCurrency.code,
                pay_method            : lPayMethod.name,
                items                 : lInvoiceItems,
                additions             : lInvoiceAdditions,
                financial_information : lFinantialInformation,
                creation_user         : Meteor.userId(),
                creation_date         : new Date()
            });
        }
    });
}