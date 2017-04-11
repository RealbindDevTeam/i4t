import { CollectionObject } from '../collection-object.model';

/**
 * Garnish Food model
 */
export interface GarnishFood extends CollectionObject {
    is_active: boolean;
    name: string;
    description?: string;
    price: number;
    restaurants: string[];
}