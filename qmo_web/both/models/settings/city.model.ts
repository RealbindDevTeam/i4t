import { CollectionObject } from '../collection-object.model';

export interface City extends CollectionObject {
    is_active: boolean;
    name: string;
    country?: string;
}