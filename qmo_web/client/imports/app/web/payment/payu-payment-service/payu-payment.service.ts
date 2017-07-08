import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers } from "@angular/http";

@Injectable()
export class PayuPaymenteService {

    private apiURI = 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi';

    private headers = new Headers({
        //'Host': 'sandbox.api.payulatam.com',
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json',
        //'Accept-language': 'es',
        //'Content-Length': 'length',
    });


    constructor(private http: Http) { }

    getTestPing(): Observable<any> {
        return this.http
            .post(this.apiURI,
            JSON.stringify({
                test: false,
                language: "en",
                command: "PING",
                merchant: {
                    apiLogin: "pRRXKOl8ikMmt9u",
                    apiKey: "4Vj8eK4rloUd272L48hsrarnUA"
                }
            }),
            { headers: this.headers })
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Observable<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Observable.throw(error.message || error);
    }
}