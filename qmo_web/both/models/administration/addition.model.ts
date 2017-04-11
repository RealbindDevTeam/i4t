import { CollectionObject } from '../collection-object.model';

/**
 * Addition model
 */
export interface Addition extends CollectionObject{
    is_active: boolean;
    name: string;
    price: number;
    restaurants: string[];
}