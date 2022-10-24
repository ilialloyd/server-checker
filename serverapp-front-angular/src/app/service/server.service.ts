import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, filter } from 'rxjs/operators';
import { Status } from '../enum/status.enum';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';

@Injectable({
  providedIn: 'root'
})
export class ServerService {


  private readonly apiUrl = `http://localhost:8080`;

  //dependency injection
  //we have the http client injected insdide of the server service
  //we can use this client to make as recall to the backend so 
  //that we can retrieve data and map this data to our application 
  //state that we have create
  constructor(private http: HttpClient) { }
  //this will return list of servers

  //we gonna make the call with here
  servers$ = <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/list`)
      .pipe(   //pipe the response
        tap(console.log),  //log the console we can see
        catchError(this.handleError)  //catch any error we have
      );

  save$ = (server: Server) => <Observable<CustomResponse>>      //this server will be the body of post reguest
    this.http.post<CustomResponse>(`${this.apiUrl}/server/save`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  ping$ = (ipAddress: string) => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  //filtering all servers by its status -> 
  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      suscriber => {
        console.log(response);
        suscriber.next(
          status === Status.ALL ? { ...response, message: `Server filtered by ${status} status` } :
            {
              ...response,
              message: response.data.servers // => stconfig.json -> "strict": false, turn it true later
                //in here we filter if we found someting that lenght of array greater than 0 we print this message as well
                .filter(server => server.status === status).length > 0 ? `Servers filtered by
            ${status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN '} status` : `No servers of ${status} found`,  //if not then we print this message -> SERVER DOWN
              data: {
                servers: response.data.servers
                  .filter(server => server.status === status)
              }

            }
        );
        suscriber.complete();
      }
    )
      //if someting going wrong above ->Observable  we catch here
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );


  delete$ = (serverId: number) => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/delete/${serverId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  //which if we have error this method will hande 
  // TODO: booster later, maybe if statement
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error)
    return throwError(() => new Error(`An error occured - Error code: ${error.status}`));
  }

}

