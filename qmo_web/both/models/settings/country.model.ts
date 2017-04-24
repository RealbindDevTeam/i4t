import { CollectionObject } from '../collection-object.model';

export interface Country extends CollectionObject {
    is_active: boolean;
    name: string;
    alfaCode2: string;
    alfaCode3: string;
    numericCode: string;
    indicative: string;
    currencyId: string;
}