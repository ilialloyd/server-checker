package io.gateways.server.service;

import io.gateways.server.model.Server;

import java.io.IOException;
import java.util.Collection;

public interface ServerService {

    // that will return the server
    Server create(Server server);

    //this method will help to see the status of ip addresses as well
    Server ping(String ipAddress) throws IOException;

    //will return collections of limited servers
    Collection<Server>list(int limit);

    Server get(Long id);
    Server update(Server server);

    Boolean delete(Long id);


}
