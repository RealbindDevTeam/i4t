import { Countries } from '../../../../both/collections/settings/country.collection';
import { Country } from '../../../../both/models/settings/country.model';

export function loadCountries() {
    if (Countries.find().cursor.count() === 0) {
        const countries: Country[] = [
            { _id: '100', is_active: false, name: 'COUNTRIES.ALBANIA', alfaCode2: 'AL', alfaCode3: 'ALB', numericCode: '008', indicative: '(+ 355)', currencyId: '270', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '200', is_active: false, name: 'COUNTRIES.GERMANY', alfaCode2: 'DE', alfaCode3: 'DEU', numericCode: '276', indicative: '(+ 49)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '300', is_active: false, name: 'COUNTRIES.ANDORRA', alfaCode2: 'AD', alfaCode3: 'AND', numericCode: '020', indicative: '(+ 376)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '400', is_active: false, name: 'COUNTRIES.ARGENTINA', alfaCode2: 'AR', alfaCode3: 'ARG', numericCode: '032', indicative: '(+ 54)', currencyId: '370', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '500', is_active: false, name: 'COUNTRIES.ARMENIA', alfaCode2: 'AM', alfaCode3: 'ARM', numericCode: '051', indicative: '(+ 374)', currencyId: '190', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '600', is_active: false, name: 'COUNTRIES.AUSTRIA', alfaCode2: 'AT', alfaCode3: 'AUT', numericCode: '040', indicative: '(+ 43)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '700', is_active: false, name: 'COUNTRIES.AZERBAIJAN', alfaCode2: 'AZ', alfaCode3: 'AZE', numericCode: '031', indicative: '(+ 994)', currencyId: '350', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '800', is_active: false, name: 'COUNTRIES.BELGIUM', alfaCode2: 'BE', alfaCode3: 'BEL', numericCode: '056', indicative: '(+ 32)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '900', is_active: false, name: 'COUNTRIES.BELIZE', alfaCode2: 'BZ', alfaCode3: 'BLZ', numericCode: '084', indicative: '(+ 501)', currencyId: '130', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1000', is_active: false, name: 'COUNTRIES.BERMUDAS', alfaCode2: 'BM', alfaCode3: 'BMU', numericCode: '060', indicative: '(+ 1004)', currencyId: '140', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1100', is_active: false, name: 'COUNTRIES.BELARUS', alfaCode2: 'BY', alfaCode3: 'BLR', numericCode: '112', indicative: '(+ 375)', currencyId: '440', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1200', is_active: false, name: 'COUNTRIES.BOLIVIA', alfaCode2: 'BO', alfaCode3: 'BOL', numericCode: '068', indicative: '(+ 591)', currencyId: '30', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1300', is_active: false, name: 'COUNTRIES.BOSNIA_HERZEGOVINA', alfaCode2: 'BA', alfaCode3: 'BIH', numericCode: '070', indicative: '(+ 387)', currencyId: '360', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1400', is_active: false, name: 'COUNTRIES.BRAZIL', alfaCode2: 'BR', alfaCode3: 'BRA', numericCode: '076', indicative: '(+ 55)', currencyId: '430', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1500', is_active: false, name: 'COUNTRIES.BULGARIA', alfaCode2: 'BG', alfaCode3: 'BGR', numericCode: '100', indicative: '(+ 359)', currencyId: '310', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1600', is_active: false, name: 'COUNTRIES.CANADA', alfaCode2: 'CA', alfaCode3: 'CAN', numericCode: '124', indicative: '(+ 001)', currencyId: '150', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1700', is_active: false, name: 'COUNTRIES.CHILE', alfaCode2: 'CL', alfaCode3: 'CHL', numericCode: '152', indicative: '(+ 56)', currencyId: '380', itemsWithDifferentTax: true, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1800', is_active: false, name: 'COUNTRIES.CYPRUS', alfaCode2: 'CY', alfaCode3: 'CYP', numericCode: '196', indicative: '(+357)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '1900', is_active: true, name: 'COUNTRIES.COLOMBIA', alfaCode2: 'CO', alfaCode3: 'COL', numericCode: '170', indicative: '(+ 57)', currencyId: '390', itemsWithDifferentTax: false, queue: ["0", "1"], financialInformation: [{ controlType: 'text', key: 'INC', label: 'FINANCIAL_INFO.COLOMBIA.INC', order: 1 }, { controlType: 'text', key: 'BUSINESS_NAME_TEXT', label: 'FINANCIAL_INFO.COLOMBIA.BUSINESS_NAME', order: 2 }, { controlType: 'textbox', key: 'BUSINESS_NAME', label: 'FINANCIAL_INFO.COLOMBIA.BUSINESS_NAME_LABEL', required: true, order: 3 }, { controlType: 'text', key: 'NIT_TEXT', label: 'FINANCIAL_INFO.COLOMBIA.NIT', order: 4 }, { controlType: 'textbox', key: 'NIT', label: 'FINANCIAL_INFO.COLOMBIA.NIT_LABEL', required: true, order: 5 }, { controlType: 'text', key: 'DIAN_NUMERATION_TEXT', label: 'FINANCIAL_INFO.COLOMBIA.DIAN_NUMERATION', order: 6 }, { controlType: 'textbox', key: 'DIAN_NUMERATION_FROM', label: 'FINANCIAL_INFO.COLOMBIA.DIAN_NUMERATION_FROM', required: true, order: 7 }, { controlType: 'textbox', key: 'DIAN_NUMERATION_TO', label: 'FINANCIAL_INFO.COLOMBIA.DIAN_NUMERATION_TO', required: true, order: 8 }, { controlType: 'text', key: 'TIP_PERCENTAGE_TEXT', label: 'FINANCIAL_INFO.COLOMBIA.ENTER_TIP_PERCENTAGE', order: 9 }, { controlType: 'slider', key: 'TIP_PERCENTAGE', label: 'TIP_PERCENTAGE', value: 0, minValue: 0, maxValue: 100, stepValue: 0.01, required: true, order: 10 }], restaurantPrice: 22000, tablePrice: 200, cronValidateActive: '*/10 * * * *', cronChangeFreeDays: '*/15 * * * *', cronEmailChargeSoon: '*/1 * * * *', cronEmailExpireSoon: '30 17 3 * *', cronEmailResExpired: '1 0 6 * *' },
            { _id: '2000', is_active: false, name: 'COUNTRIES.COSTA_RICA', alfaCode2: 'CR', alfaCode3: 'CRI', numericCode: '188', indicative: '(+ 506)', currencyId: '40', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2100', is_active: false, name: 'COUNTRIES.CROATIA', alfaCode2: 'HR', alfaCode3: 'HRV', numericCode: '191', indicative: '(+ 385)', currencyId: '250', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2200', is_active: false, name: 'COUNTRIES.DENMARK', alfaCode2: 'DK', alfaCode3: 'DNK', numericCode: '208', indicative: '(+ 45)', currencyId: '70', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2300', is_active: false, name: 'COUNTRIES.ECUADOR', alfaCode2: 'EC', alfaCode3: 'ECU', numericCode: '218', indicative: '(+ 593)', currencyId: '160', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2400', is_active: false, name: 'COUNTRIES.EL_SALVADOR', alfaCode2: 'SV', alfaCode3: 'SLV', numericCode: '222', indicative: '(+ 503)', currencyId: '160', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2500', is_active: false, name: 'COUNTRIES.SLOVAKIA', alfaCode2: 'SK', alfaCode3: 'SVK', numericCode: '703', indicative: '(+ 421)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2600', is_active: false, name: 'COUNTRIES.SLOVENIA', alfaCode2: 'SI', alfaCode3: 'SVN', numericCode: '705', indicative: '(+ 386)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2700', is_active: false, name: 'COUNTRIES.SPAIN', alfaCode2: 'ES', alfaCode3: 'ESP', numericCode: '724', indicative: '(+ 34)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2800', is_active: false, name: 'COUNTRIES.UNITED_STATES', alfaCode2: 'US', alfaCode3: 'USA', numericCode: '840', indicative: '(+ 1)', currencyId: '160', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '2900', is_active: false, name: 'COUNTRIES.ESTONIA', alfaCode2: 'EE', alfaCode3: 'EST', numericCode: '233', indicative: '(+ 372)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3000', is_active: false, name: 'COUNTRIES.FINLAND', alfaCode2: 'FI', alfaCode3: 'FIN', numericCode: '246', indicative: '(+ 358)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3100', is_active: false, name: 'COUNTRIES.FRANCE', alfaCode2: 'FR', alfaCode3: 'FRA', numericCode: '250', indicative: '(+ 33)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3200', is_active: false, name: 'COUNTRIES.GEORGIA', alfaCode2: 'GE', alfaCode3: 'GEO', numericCode: '268', indicative: '(+ 995)', currencyId: '260', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3300', is_active: false, name: 'COUNTRIES.GREECE', alfaCode2: 'GR', alfaCode3: 'GRC', numericCode: '300', indicative: '(+ 30)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3400', is_active: false, name: 'COUNTRIES.GREENLAND', alfaCode2: 'GL', alfaCode3: 'GRL', numericCode: '304', indicative: '(+ 299)', currencyId: '70', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3500', is_active: false, name: 'COUNTRIES.GUATEMALA', alfaCode2: 'GT', alfaCode3: 'GTM', numericCode: '320', indicative: '(+ 502)', currencyId: '420', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3600', is_active: false, name: 'COUNTRIES.FRENCH_GUIANA', alfaCode2: 'GF', alfaCode3: 'GUF', numericCode: '254', indicative: '(+ 594)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3700', is_active: false, name: 'COUNTRIES.GUYANA', alfaCode2: 'GY', alfaCode3: 'GUY', numericCode: '328', indicative: '(+ 592)', currencyId: '170', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3800', is_active: false, name: 'COUNTRIES.HONDURAS', alfaCode2: 'HN', alfaCode3: 'HND', numericCode: '340', indicative: '(+ 504)', currencyId: '280', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '3900', is_active: false, name: 'COUNTRIES.HUNGARY', alfaCode2: 'HU', alfaCode3: 'HUN', numericCode: '348', indicative: '(+ 36)', currencyId: '210', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4000', is_active: false, name: 'COUNTRIES.IRELAND', alfaCode2: 'IE', alfaCode3: 'IRL', numericCode: '372', indicative: '(+ 353)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4100', is_active: false, name: 'COUNTRIES.ICELAND', alfaCode2: 'IS', alfaCode3: 'ISL', numericCode: '352', indicative: '(+ 354)', currencyId: '80', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4200', is_active: false, name: 'COUNTRIES.FALKLAND_ISLANDS', alfaCode2: 'FK', alfaCode3: 'FLK', numericCode: '238', indicative: '(+ 500)', currencyId: '330', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4300', is_active: false, name: 'COUNTRIES.ITALY', alfaCode2: 'IT', alfaCode3: 'ITA', numericCode: '380', indicative: '(+ 39)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4400', is_active: false, name: 'COUNTRIES.KAZAKHSTAN', alfaCode2: 'KZ', alfaCode3: 'KAZ', numericCode: '398', indicative: '(+ 731)', currencyId: '470', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4500', is_active: false, name: 'COUNTRIES.LATVIA', alfaCode2: 'LV', alfaCode3: 'LVA', numericCode: '428', indicative: '(+ 371)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4600', is_active: false, name: 'COUNTRIES.LIECHTENSTEIN', alfaCode2: 'LI', alfaCode3: 'LIE', numericCode: '438', indicative: '(+ 417)', currencyId: '220', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4700', is_active: false, name: 'COUNTRIES.LITHUANIA', alfaCode2: 'LT', alfaCode3: 'LTU', numericCode: '440', indicative: '(+ 370)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4800', is_active: false, name: 'COUNTRIES.LUXEMBOURG', alfaCode2: 'LU', alfaCode3: 'LUX', numericCode: '442', indicative: '(+ 352)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '4900', is_active: false, name: 'COUNTRIES.MACEDONIA', alfaCode2: 'MK', alfaCode3: 'MKD', numericCode: '807', indicative: '(+ 389)', currencyId: '110', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5000', is_active: false, name: 'COUNTRIES.MALTA', alfaCode2: 'MT', alfaCode3: 'MLT', numericCode: '470', indicative: '(+ 356)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5100', is_active: false, name: 'COUNTRIES.MEXICO', alfaCode2: 'MX', alfaCode3: 'MEX', numericCode: '484', indicative: '(+ 52)', currencyId: '400', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5200', is_active: false, name: 'COUNTRIES.MOLDAVIA', alfaCode2: 'MD', alfaCode3: 'MDA', numericCode: '498', indicative: '(+ 373)', currencyId: '290', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5300', is_active: false, name: 'COUNTRIES.MONACO', alfaCode2: 'MC', alfaCode3: 'MCO', numericCode: '492', indicative: '(+ 377)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5400', is_active: false, name: 'COUNTRIES.MONTENEGRO', alfaCode2: 'ME', alfaCode3: 'MNE', numericCode: '499', indicative: '(+ 382)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5500', is_active: false, name: 'COUNTRIES.NICARAGUA', alfaCode2: 'NI', alfaCode3: 'NIC', numericCode: '558', indicative: '(+ 505)', currencyId: '50', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5600', is_active: false, name: 'COUNTRIES.NORWAY', alfaCode2: 'NO', alfaCode3: 'NOR', numericCode: '578', indicative: '(+ 47)', currencyId: '90', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5700', is_active: false, name: 'COUNTRIES.NETHERLANDS', alfaCode2: 'NL', alfaCode3: 'NLD', numericCode: '528', indicative: '(+ 31)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5800', is_active: false, name: 'COUNTRIES.PANAMA', alfaCode2: 'PA', alfaCode3: 'PAN', numericCode: '591', indicative: '(+ 507)', currencyId: '10', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '5900', is_active: false, name: 'COUNTRIES.PARAGUAY', alfaCode2: 'PY', alfaCode3: 'PRY', numericCode: '600', indicative: '(+ 595)', currencyId: '240', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6000', is_active: false, name: 'COUNTRIES.PERU', alfaCode2: 'PE', alfaCode3: 'PER', numericCode: '604', indicative: '(+ 51)', currencyId: '460', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6100', is_active: false, name: 'COUNTRIES.POLAND', alfaCode2: 'PL', alfaCode3: 'POL', numericCode: '616', indicative: '(+ 48)', currencyId: '480', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6200', is_active: false, name: 'COUNTRIES.PORTUGAL', alfaCode2: 'PT', alfaCode3: 'PRT', numericCode: '620', indicative: '(+ 351)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6300', is_active: false, name: 'COUNTRIES.UNITED_KINGDOM', alfaCode2: 'GB', alfaCode3: 'GBR', numericCode: '826', indicative: '(+ 44)', currencyId: '320', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6400', is_active: false, name: 'COUNTRIES.CZECH_REPUBLIC', alfaCode2: 'CZ', alfaCode3: 'CZE', numericCode: '203', indicative: '(+ 42)', currencyId: '60', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6500', is_active: false, name: 'COUNTRIES.ROMANIA', alfaCode2: 'RO', alfaCode3: 'ROU', numericCode: '642', indicative: '(+ 40)', currencyId: '300', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6600', is_active: false, name: 'COUNTRIES.RUSSIA', alfaCode2: 'RU', alfaCode3: 'RUS', numericCode: '643', indicative: '(+ 7)', currencyId: '450', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6700', is_active: false, name: 'COUNTRIES.SAN_MARINO', alfaCode2: 'SM', alfaCode3: 'SMR', numericCode: '674', indicative: '(+ 378)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6800', is_active: false, name: 'COUNTRIES.SAINT_PIERRE_MIQUELON', alfaCode2: 'PM', alfaCode3: 'SPM', numericCode: '666', indicative: '(+ 508)', currencyId: '200', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '6900', is_active: false, name: 'COUNTRIES.SERBIA', alfaCode2: 'RS', alfaCode3: 'SRB', numericCode: '688', indicative: '(+ 381)', currencyId: '120', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '7000', is_active: false, name: 'COUNTRIES.SWEDEN', alfaCode2: 'SE', alfaCode3: 'SWE', numericCode: '752', indicative: '(+ 46)', currencyId: '100', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '7100', is_active: false, name: 'COUNTRIES.SWITZERLAND', alfaCode2: 'CH', alfaCode3: 'CHE', numericCode: '756', indicative: '(+ 41)', currencyId: '220', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '7200', is_active: false, name: 'COUNTRIES.SURINAM', alfaCode2: 'SR', alfaCode3: 'SUR', numericCode: '740', indicative: '(+ 597)', currencyId: '180', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '7300', is_active: false, name: 'COUNTRIES.TURKEY', alfaCode2: 'TR', alfaCode3: 'TUR', numericCode: '792', indicative: '(+ 90)', currencyId: '340', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '7400', is_active: false, name: 'COUNTRIES.UKRAINE', alfaCode2: 'UA', alfaCode3: 'UKR', numericCode: '804', indicative: '(+ 380)', currencyId: '230', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '7500', is_active: false, name: 'COUNTRIES.URUGUAY', alfaCode2: 'UY', alfaCode3: 'URY', numericCode: '858', indicative: '(+ 598)', currencyId: '410', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' },
            { _id: '7600', is_active: false, name: 'COUNTRIES.VENEZUELA', alfaCode2: 'VE', alfaCode3: 'VEN', numericCode: '862', indicative: '(+ 58)', currencyId: '20', itemsWithDifferentTax: false, queue: [], financialInformation: [], restaurantPrice: 0, tablePrice: 0, cronValidateActive: '', cronChangeFreeDays: '', cronEmailChargeSoon: '', cronEmailExpireSoon: '', cronEmailResExpired: '' }
        ];
        countries.forEach((country: Country) => Countries.insert(country));
    }
}