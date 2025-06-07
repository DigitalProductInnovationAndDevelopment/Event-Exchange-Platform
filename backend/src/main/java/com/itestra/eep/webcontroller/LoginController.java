package com.itestra.eep.webcontroller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/login/oauth2/code")
public class LoginController {

    @GetMapping("/gitlab")
    public ResponseEntity<Object> loginRequest() {
        return ResponseEntity.ok().build();
    }

}
