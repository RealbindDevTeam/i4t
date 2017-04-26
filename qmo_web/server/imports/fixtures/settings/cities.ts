import { Cities } from '../../../../both/collections/settings/city.collection';
import { City } from '../../../../both/models/settings/city.model';

export function loadCities(){
    if(Cities.find().cursor.count() === 0){
        const cities: City[] = [
            { _id: "1901", is_active: true, name: 'Bogota D.C', country: '1900'},
            { _id: "1902", is_active: true, name: 'Medellin', country: '1900'},
            { _id: "1903", is_active: true, name: 'Cali', country: '1900'},
            { _id: "1904", is_active: true, name: 'Cartagena', country: '1900'},
            { _id: "1905", is_active: true, name: 'Santa Marta', country: '1900'},
            { _id: "1701", is_active: true, name: 'Viña del Mar', country: '1700'},  
            { _id: "1702", is_active: true, name: 'Valparaíso', country: '1700'}, 
            { _id: "1703", is_active: true, name: 'La Serena', country: '1700'}, 
            { _id: "1704", is_active: true, name: 'Concepción', country: '1700'}, 
            { _id: "1705", is_active: true, name: 'Santiago', country: '1700'}, 
        ];

        cities.forEach((city: City) => Cities.insert(city));
    }
}