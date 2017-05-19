import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers } from "@angular/http";

@Injectable()
export class PayuPaymenteService {

    private apiURI = 'https://jsonplaceholder.typicode.com/';
    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    getPosts(): Observable<any> {
        return this.http.get(this.apiURI + 'posts')
        .map(response => response.json() as any[])
        .catch(this.handleError);
    }

    private handleError(error: any): Observable<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Observable.throw(error.message || error);
    }
}