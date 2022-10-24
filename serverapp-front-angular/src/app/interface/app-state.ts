import { DataState } from "../enum/data-state.enum";

export interface AppState <T>{
    dataState: DataState;
    //we either get appData or error, we cant get both
    //that is why we make them optional with "?" after
    appData?: T;
    error?: string;
}