import { Server } from "./server";

export interface CustomResponse{
    timeStamp: Date;
    statusCode: number;
    status: string;
    reason: string;
    message: string;
    developerMessage: string;
    //? means optional, it means we mignt not get that
    data: {servers ?:Server[], server?: Server}
}