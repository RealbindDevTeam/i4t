import { CollectionObject } from '../collection-object.model';

export interface Country extends CollectionObject {
    is_active: boolean;
    name: string;
    language_code: string;
    region?: string;
    country_code: string;
    indicative: string;
    currencies: string[];
}