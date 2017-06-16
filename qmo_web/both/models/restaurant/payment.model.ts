import { CollectionObject } from '../collection-object.model';

/**
 * Payment Model
 */
export interface Payment extends CollectionObject{
    restaurantId: string;
    tableId: string;
    userId: string;
    orders: string[];
    paymentMethodId: string;
    totalOrdersPrice: number;
    totalTip: number;
    totalToPayment: number;
    currencyId: string;
    status: string;
    received: boolean;
}