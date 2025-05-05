package com.akna.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.akna.models.User;
import com.akna.repository.UserRepository;
import com.akna.services.UserService;


@RestController
public class UserController {
	
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	UserService userService;
	
	@PostMapping("/users")
	public User registerUser(@RequestBody User user) {
		
		User savedUser= userService.registerUser(user);
		
		return savedUser;
	}
	
	@GetMapping("/api/users")
	public List<User>getUsers(){
		
		List<User> users= userRepository.findAll();
		return users;
//		List<User> users = new ArrayList<>();
//		User user1 = new User(1,"akna","bethmi","akna3bethmi@gmail.com","12345");
//		User user2 = new User(2,"ravindu","susal","ravindususal@gmail.com","12345");
//		
//		users.add(user1);
//		users.add(user2);
//		
//		return users;
	}
	
	@GetMapping("/api/users/{userId}")
	public User getUserById(@PathVariable("userId")Integer id) throws Exception {
		
		User user = userService.findUserById(id);
		
		return user;

//		User user1 = new User(1,"akna","bethmi","akna3bethmi@gmail.com","12345");
//		user1.setId(id);
//		
//		return user1;
	}
	
	
	
	@PutMapping("/api/users/{userId}")
	public User updateUser(@RequestBody User user,@PathVariable("userId") Integer userId) throws Exception{
		
		User updatedUser = userService.updatUser(user, userId);
		
		return updatedUser;
//		User user1 = new User(1,"akna","bethmi","akna3bethmi@gmail.com","12345");
//		
//		if(user.getFirstName()!=null) {
//			user1.setFirstName(user.getFirstName());
//		}
//		if(user.getLastName()!=null) {
//			user1.setLastName(user.getLastName());
//		}
//		if(user.getEmail()!=null) {
//			user1.setEmail(user.getEmail());
//		}
//		return user1;
	}
	
	@DeleteMapping("users/{userId}")
	public String deleteUser(@PathVariable("userId") Integer userId)throws Exception{
		
		Optional <User> user = userRepository.findById(userId);
		
		if(user.isEmpty()) {
			throw new Exception("user not exit with id " + userId);
		}
		
		userRepository.delete(user.get());
		
		return "User deleted successfully with id " + userId;
	}
	
	@PutMapping("/api/users/follow/{userId1}/{userId2}")
	public User followUserHandler(@PathVariable("userId1") Integer userId1,@PathVariable("userId2") Integer userId2) throws Exception {
		
		User user = userService.followUser(userId1, userId2);
		return user;
	}
	
	@GetMapping("/api/users/search")
	public List<User> searchUser(@RequestParam("query") String query){
		
		List<User> users = userService.searchUser(query);
		
		return users;
	}
}
