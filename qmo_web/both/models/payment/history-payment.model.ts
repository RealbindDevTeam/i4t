import { CollectionObject } from '../collection-object.model';

export interface HistoryPayment extends CollectionObject {
    restaurantId: string;
    startDate: Date;  
    endDate: Date;
    month: string;
    year: string;
    paymentValue: number;
    currency: string;
    status: string;
}