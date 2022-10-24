package io.gateways.server.service.implementation;

import io.gateways.server.model.Server;
import io.gateways.server.repo.ServerRepo;
import io.gateways.server.service.ServerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.InetAddress;
import java.util.Collection;
import java.util.Random;

import static io.gateways.server.enumaration.Status.SERVER_DOWN;
import static io.gateways.server.enumaration.Status.SERVER_UP;
import static java.lang.Boolean.TRUE;
import static org.springframework.data.domain.PageRequest.of;

@RequiredArgsConstructor
@Service
@Transactional
@Slf4j  //to get log details print in console to see what is going on
public class ServerServiceImpl implements ServerService {

    //dependency injection, lombok creates constructor for us
    private final ServerRepo serverRepo;

    @Override
    public Server create(Server server) {
        log.info("Saving new server: {}", server.getName());
        server.setImageUrl(setServerImageUrl());
        return serverRepo.save(server);
    }

    //this method will help us to reach the server and its ip
    @Override
    public Server ping(String ipAddress) throws IOException {
        log.info("Pinging  server IP: {}", ipAddress);
        Server server = serverRepo.findByIpAddress(ipAddress);

        //getting inet address for the specific ip address
        InetAddress address = InetAddress.getByName(ipAddress);

        //setting status of server. checking if reachable within given time
        server.setStatus(address.isReachable(10000) ? SERVER_UP : SERVER_DOWN);

        serverRepo.save(server);
        return server;
    }

    @Override
    public Collection<Server> list(int limit) {

        log.info("Fetching all servers");

        // this will return us pages with list of servers. because we also have limit, if system finds hundreds of server,
        // it will return us first page and also out limit of servers
        return serverRepo.findAll(of(0, limit)).toList();
    }

    @Override
    public Server get(Long id) {
        log.info("Fetching server by id: {}", id);
        return serverRepo.findById(id).get();
    }

    //JPA will handle update  that if the server does exist or not
    @Override
    public Server update(Server server) {
        log.info("Updating  server: {}", server.getName());
        return serverRepo.save(server);

    }

    @Override
    public Boolean delete(Long id) {
        log.info("Deleting  server by ID: {}", id);
        serverRepo.deleteById(id);
        return TRUE;
    }

    private String setServerImageUrl() {

        String[] imageNames = {"server1.png","server2.png","server3.png","server4.png"};
        //localhost:8080/server/image/+one of these images . to pick Randomly we call random and give it boundary
        return ServletUriComponentsBuilder.fromCurrentContextPath().path("/server/image/"+imageNames[new Random().nextInt(4)]).toUriString();
    }

}
