import { Observable } from 'rxjs/Observable';
import { TranslateLoader } from "@ngx-translate/core";
import { of } from "rxjs/observable/of";

import * as es_dictionary from '../../../../../public/i18n/es.json';
import * as en_dictionary from '../../../../../public/i18n/en.json';

export class CustomLoader implements TranslateLoader {

    /**
     * Gets the translations from the server
     * @param lang
     * @returns {any}
     */
    public getTranslation(lang: string): Observable<any> {
        if( lang === 'es' ){
            return of(es_dictionary);
        } else if( lang === 'en' ){
            return of(en_dictionary);            
        } else {
            return of(en_dictionary);
        }
    }
}