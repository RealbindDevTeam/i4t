import { Injectable } from '@angular/core';

@Injectable()
export class UserLanguageService{

    /**
     * Get user language
     * @param {string} _pUserId
     */
    getLanguage( _pUser: Meteor.User ):string {
        if( _pUser ){
            if( _pUser.services ){
                if( _pUser.services.facebook ){
                    if( _pUser.services.facebook.locale !== '' && _pUser.services.facebook.locale !== null && _pUser.services.facebook.locale !== undefined ){
                            return this.getAvailableLanguage( _pUser.services.facebook.locale.split( '_' )[0] );
                    } else {
                        return 'en';
                    }
                } else if( _pUser.services.twitter ){
                    return 'en';
                } else if( _pUser.services.google ){
                    return 'en';
                }
            } else if( _pUser.profile ){
                if( _pUser.profile.language_code !== '' && _pUser.profile.language_code !== null && _pUser.profile.language_code !== undefined ){
                    return this.getAvailableLanguage(_pUser.profile.language_code );
                } else {
                    return 'en';
                }
            } else {
                if( navigator.language.split( '-' )[0] === 'en' || navigator.language.split( '-' )[0] === 'es' ){
                    return navigator.language.split( '-' )[0];
                } else{
                    return 'en';
                }
            }
        } else {
            return 'en';
        }
    }

    /**
     * Return navigation language
     */
    getNavigationLanguage():string {
        if( navigator.language.split( '-' )[0] === 'en' || navigator.language.split( '-' )[0] === 'es' ){
            return navigator.language.split( '-' )[0];
        } else {
            return 'en'
        }
    }

    /**
     * Return available languages
     * @param {_pLanguage} _pLanguage 
     */
    getAvailableLanguage( _pLanguage: string ):string{
        if( _pLanguage === 'en' || _pLanguage === 'es' ){
            return _pLanguage;
        } else {
            return 'en';
        }
    }
}