import { CollectionObject } from '../collection-object.model';

export interface PaymentTransaction extends CollectionObject {
    count: number;
    referenceName: string;
    status: string;
}