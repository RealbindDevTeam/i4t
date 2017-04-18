import { CollectionObject } from '../collection-object.model';

export interface Order extends CollectionObject{
    restaurantId: string;
    tableId: string;
    code: number;
    status: string;
    accountId: string;
    items: OrderItem[];
    totalPayment: number;
    orderItemCount: number;
}

export interface OrderItem{
    index: number;
    itemId: string;
    quantity: number;
    observations: string;
    garnishFood: string[];
    additions: string[];
    paymentItem: number;
}