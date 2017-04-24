import { Cities } from '../../../../both/collections/settings/city.collection';
import { City } from '../../../../both/models/settings/city.model';

export function loadCities(){
    if(Cities.find().cursor.count() === 0){
        const cities: City[] = [
            { _id: "1901", is_active: true, name: 'Bogota D.C', country: '1900'},
            { _id: "1902", is_active: true, name: 'Medellin', country: '1900'},
            { _id: "1903", is_active: true, name: 'Cali', country: '1900'},
            { _id: "1904", is_active: true, name: 'Cartagena', country: '1900'},
            { _id: "1905", is_active: true, name: 'Santa Marta', country: '1900'}  
        ];

        cities.forEach((city: City) => Cities.insert(city));
    }
}