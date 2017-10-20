import { CollectionObject } from '../collection-object.model';

/**
 * Invoice Model
 */
export interface Invoice extends CollectionObject{
    restaurant_id         : string;
    payment_id            : string;
    restaurant_name       : string;
    table_number          : number;
    total_pay             : number;
    total_order           : number;
    total_tip             : number;
    customer_id           : string;
    currency              : string;
    pay_method            : string;
    items?                : InvoiceItem[];
    additions?            : InvoiceAddition[];
    financial_information : FinancialInformation;
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

/**
 * FinancialInformation Model
 */
export interface FinancialInformation {
    business_name        : string;
    nit                  : string;
    dian_numeration_from : string;
    dian_numeration_to   : string;
    tip_porcentage       : string;
    address              : string;
    phone                : string;
}