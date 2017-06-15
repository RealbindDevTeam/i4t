import { CollectionObject } from '../collection-object.model';

/**
 * Order Model
 */
export interface Order extends CollectionObject{
    restaurantId: string;
    tableId: string;
    code: number;
    status: string;
    accountId: string;
    items: OrderItem[];
    totalPayment: number;
    orderItemCount: number;
    translateInfo: OrderTranslateInfo;
    toPay?: boolean;
}

/**
 * Order Item Model
 */
export interface OrderItem{
    index: number;
    itemId: string;
    quantity: number;
    observations: string;
    garnishFood: string[];
    additions: string[];
    paymentItem: number;
}

/**
 * Order Translate Information Model
 */
export interface OrderTranslateInfo{
    firstOrderOwner: string;
    markedToTranslate: boolean;
    lastOrderOwner: string;
    confirmedToTranslate: false;
}