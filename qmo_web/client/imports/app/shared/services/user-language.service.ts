import { Injectable } from '@angular/core';

@Injectable()
export class UserLanguageService{

    /**
     * Get user language
     * @param {string} _pUserId
     */
    getLanguage( _pUserId: Meteor.User ):string {
        let _lLanguage:string = 'en';

        if( _pUserId.profile.language_code !== '' ){
            _lLanguage = _pUserId.profile.language_code;
        } else {
            if( navigator.language.split( '-' )[0] === 'en' || navigator.language.split( '-' )[0] === 'es' ){
                _lLanguage = navigator.language.split( '-' )[0];
            } else{
                _lLanguage ='en';
            }
        }
        return _lLanguage;
    }

    /**
     * Return navigation language
     */
    getNavigationLanguage():string {
        let _lNavigationLanguage:string = 'en';

        if( navigator.language.split( '-' )[0] === 'en' || navigator.language.split( '-' )[0] === 'es' ){
            _lNavigationLanguage = navigator.language.split( '-' )[0];
        }
        return _lNavigationLanguage;
    }
}