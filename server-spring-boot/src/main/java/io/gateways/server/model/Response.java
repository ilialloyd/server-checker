package io.gateways.server.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.experimental.SuperBuilder;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Data
@SuperBuilder
@JsonInclude(NON_NULL)
public class Response {

    protected LocalDateTime timeStamp;

    protected int statusCode;
    protected HttpStatus status;

    protected String reason;
    protected String message;
    protected String developerMessage;
    //represent the response that going to send user every time that request coming to the application.
    //success or failure response. class gonna be response these all messages that will be sending all over the application
    protected Map<?,?> data;

}
