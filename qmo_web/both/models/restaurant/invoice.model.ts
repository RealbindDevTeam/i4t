import { CollectionObject } from '../collection-object.model';

/**
 * Invoice Model
 */
export interface Invoice extends CollectionObject{
    restaurant_name : string;
    table_number    : number;
    total_pay       : number;
    total_order     : number;
    total_tip       : number;
    customer_id     : string;
    currency        : string;
    items?          : InvoiceItem[];
    additions?      : InvoiceAddition[];
}

/**
 * Invoice Item Model
 */
export interface InvoiceItem {
    item_name    : string;
    quantity     : number;
    garnish_food : string[];
    additions    : string[];
    price        : number;
}

/**
 * Invoice Addition Model
 */
export interface InvoiceAddition {
    addition_name : string;
    quantity      : number;
    price         : number;
}