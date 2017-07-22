import { CollectionObject } from '../collection-object.model';

export interface HistoryPayment extends CollectionObject {
    restaurantIds: string[];
    startDate: Date;  
    endDate: Date;
    month: string;
    year: string;
    status: string;
    paymentValue?: number;
    currency?: string;
}