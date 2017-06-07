import { CollectionObject } from '../collection-object.model';

export interface RestaurantPlan extends CollectionObject{
    planCode: string;
    isActive: boolean;
    minTableNumber: number;
    maxTableNumber?: number;
    price: Price[];
}

export interface Price {
    country: string;
    price: number;
}