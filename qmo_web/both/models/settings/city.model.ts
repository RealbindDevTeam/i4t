import { CollectionObject } from '../collection-object.model';

export interface City extends CollectionObject {
    is_active: boolean;
    name: string;
    //language_code: string;
    country?: string;
}