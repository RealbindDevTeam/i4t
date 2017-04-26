import { CollectionObject } from '../collection-object.model';

/**
 * Addition model
 */
export interface Addition extends CollectionObject{
    is_active: boolean;
    name: string;
    prices: AdditionPrices[];
}

/**
 * AdditionInformation model
 */
export interface AdditionPrices {
    restaurantId: string;
    price: number;
}