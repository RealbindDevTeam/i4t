import { Cities } from '../../../../both/collections/settings/city.collection';
import { City } from '../../../../both/models/settings/city.model';

export function loadCities(){
    if(Cities.find().cursor.count() === 0){
        const cities: City[] = [{
            _id: "10",
            is_active: true,
            name: 'Buenos Aires',
            //language_code: 'es',
            country: '100'
        },{
            _id: "20",
            is_active: true,
            name: 'Córdoba',
            //language_code: 'es',
            country: '100'
        }];

        cities.forEach((city: City) => Cities.insert(city));
    }
}