package com.akna.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
	
	@GetMapping //retrieve data
	public String homeControllerHandler() {
		return "this is home controller";
	}
	
	@GetMapping("/home") //retrieve data
	public String homeControllerHandler2() {
		return "this is home controller2";
	}
	//@PutMapping - update data
	//@PostMapping - insert data
	//@DeleteMapping - delete data

}
