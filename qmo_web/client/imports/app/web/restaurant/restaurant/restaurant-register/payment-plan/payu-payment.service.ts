import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers } from "@angular/http";

@Injectable()
export class PayuPaymenteService {

    private apiURI = 'https://jsonplaceholder.typicode.com/';
    private apiURI2 = 'https://sandbox.api.payulatam.com/payments-api/';
    private headers = new Headers({ 'Content-Type': 'application/json' });
    
    private headers2 = new Headers({
        //'Host': 'sandbox.api.payulatam.com',
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Accept-language': 'es',
        //'Content-Length': 'length',
        'Authorization': 'Basic cFJSWEtPbDhpa01tdDl1OjRWajhlSzRybG9VZDI3Mkw0OGhzcmFyblVB'
    });
    

    constructor(private http: Http) { }

    getPosts(): Observable<any> {
        return this.http.get(this.apiURI + 'posts/1')
            .map(response => response.json() as any)
            .catch(this.handleError);
    }


    getPlans(): Observable<any> {
        return this.http.get(this.apiURI2 + 'rest/v4.9/plans/sample-plan-code-qmo', { headers: this.headers2 })
            .map(response => response.json() as any)
            .catch(this.handleError);
    }

    private handleError(error: any): Observable<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Observable.throw(error.message || error);
    }
}