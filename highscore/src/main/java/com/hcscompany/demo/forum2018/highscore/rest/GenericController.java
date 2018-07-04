package com.hcscompany.demo.forum2018.highscore.rest;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GenericController {

    @RequestMapping("/")
    public String index() {
        return "highscore service";
    }
}
