import { Countries } from '../../../../both/collections/settings/country.collection';
import { Country } from '../../../../both/models/settings/country.model';

export function loadCountries (){
    if(Countries.find().cursor.count() === 0){
        const countries: Country[] = [{
            _id: "100",
            is_active: true,
            name: "Argentina",
            language_code: "es",
            region: null,
            country_code: "arg",
            indicative: "000",
            currencies: null
        },{
            _id: "200",
            is_active: true,
            name: "Chile",
            language_code: "es",
            region: null,
            country_code: "chi",
            indicative: "000",
            currencies: null
        },{
            _id: "300",
            is_active: true,
            name: "Colombia",
            language_code: "es",
            region: null,
            country_code: "col",
            indicative: "000",
            currencies: null
        },{
            _id: "400",
            is_active: true,
            name: "Ecuador",
            language_code: "es",
            region: null,
            country_code: "ecu",
            indicative: "000",
            currencies: null
        },{
            _id: "500",
            is_active: true,
            name: "Panamá",
            language_code: "es",
            region: null,
            country_code: "pan",
            indicative: "000",
            currencies: null
        },{
            _id: "600",
            is_active: true,
            name: "Perú",
            language_code: "es",
            region: null,
            country_code: "per",
            indicative: "000",
            currencies: null
        }
        ];

        countries.forEach((country : Country) => Countries.insert(country));
    }
}