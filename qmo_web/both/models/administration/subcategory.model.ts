import { CollectionObject } from '../collection-object.model';

/**
 * Subcategory model
 */
export interface Subcategory extends CollectionObject{
    is_active: boolean;
    name: string;
    description?: string;
    category: string;
}