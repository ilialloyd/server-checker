import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataState } from './enum/data-state.enum';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { ServerService } from './service/server.service';
import { map, startWith, catchError } from 'rxjs/operators';
import { Status } from './enum/status.enum';
import { NgForm } from '@angular/forms';
import { Server } from './interface/server';
import { NotificationService } from './service/notification.service';
import { ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent implements OnInit {


  //application state going to be inside observable or
  //appState type of observable, we pass in type for that observable which is the entire app state and the data will be custom http rtesponse
  appState$: Observable<AppState<CustomResponse>>;


  readonly DataState = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();



  constructor(private serverService: ServerService, private notifier: NotificationService) { }

  //when 
  /**
   * @method ngOnInit() will be called when @ AppComponent class initialized
   *  When we get @param response first we save response in @param dataSubject
   *  because later on we will use that data in another methods
   */
  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
          this.notifier.onDefault(response.message);
          this.dataSubject.next(response);                                        //when we save new ipAddress, it will start listing from that with reverse()
          return { dataState: DataState.LOADED_STATE, appData: { ...response, data: { servers: response.data.servers.reverse() } } }
        }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }


  /**
   * 
   * @method map(response =>) --->  when we call this method, we will get data from the @param DataSubject to run startWith. so that is why we fetch dataSubject value here
   * @param startWith() - in here, we will get data from the @param DataSubject to run @method startWith. so that is why we fetch @param dataSubject value here
   */
  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress); //to get spinner instead of loader near ping
    this.appState$ = this.serverService.ping$(ipAddress)
      .pipe(
        map(response => {
          const index = this.dataSubject.value.data.servers.findIndex(server => server.id === response.data.server.id);
          this.dataSubject.value.data.servers[index] = response.data.server;
          this.notifier.onDefault(response.message);
          this.filterSubject.next('');
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.filterSubject.next('');
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }


  saveServer(serverForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.serverService.save$(serverForm.value as Server)
      .pipe(
        map(response => {
          /**
           * we changing that previous data we are pushing new object onto it and that object is from respons
           * and we overriging @param  servers/data, because we displaying previous servers. -> we take first server that we got from the user(resonse)
           * we put it at index zero and give us all the other ones from the @param dataSubject
            */
          this.dataSubject.next(
            { ...response, data: { servers: [response.data.server, ...this.dataSubject.value.data.servers] } }
          );
          this.notifier.onDefault(response.message);
          document.getElementById('closeModal').click();
          this.isLoading.next(false);

          serverForm.resetForm({ status: this.Status.SERVER_DOWN });
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.isLoading.next(false);
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error })
        })
      );
  }



  /**
   * 
   * When we call this @function filterServers from the UI only we gonna need from the user is the Status
   */
  filterServers(status: Status): void {
    this.appState$ = this.serverService.filter$(status, this.dataSubject.value)
      .pipe(
        map(response => {
          this.notifier.onDefault(response.message);
          return { dataState: DataState.LOADED_STATE, appData: response }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }



  deleteServer(server: Server): void {
    this.appState$ = this.serverService.delete$(server.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {
              ...response, data:
                { servers: this.dataSubject.value.data.servers.filter(s => s.id !== server.id) }
            }
          );
          this.notifier.onDefault(response.message);
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.filterSubject.next('');
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  //download report as a excel file
  printReport(): void {
    // window.print();    this method is for directly print the file or save as pdf
    let dataType = 'application/vnd.ms-excell-sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers');
    let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ',' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
