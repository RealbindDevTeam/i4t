/**
 * EmailContent Model
 */
export interface EmailContent {
    language: string;
    lang_dictionary: LangDictionary[];
}

export interface LangDictionary {
    label: string;
    traduction: string;
}