import { Currency } from '../../../../both/models/general/currency.model';
import { Currencies } from '../../../../both/collections/general/currency.collection';

export function loadCurrencies(){
    if(Currencies.find().cursor.count() === 0){
        const currencies: Currency[] = [
            {_id: "10", isActive: true, name: 'CURRENCIES.US_DOLLAR'},
            {_id: "20", isActive: true, name: 'CURRENCIES.CANADIAN_DOLLAR'},
            {_id: "30", isActive: true, name: 'CURRENCIES.EURO'},
            {_id: "40", isActive: true, name: 'CURRENCIES.COLOMBIAN_PESO'},
            {_id: "50", isActive: true, name: 'CURRENCIES.MEXICAN_PESO'}
        ];        
        currencies.forEach((cur:Currency) => Currencies.insert(cur));
    }
}