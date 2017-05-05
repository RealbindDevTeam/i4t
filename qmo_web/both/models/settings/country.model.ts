import { RestaurantFinancialElement } from '../restaurant/restaurant.model';

/**
 * Country Model
 */
export interface Country {
    _id?: string;
    is_active: boolean;
    name: string;
    alfaCode2: string;
    alfaCode3: string;
    numericCode: string;
    indicative: string;
    currencyId: string;
    itemsWithDifferentTax: boolean;
    financialInformation: RestaurantFinancialElement[];
}