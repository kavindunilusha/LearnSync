package com.akna.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.akna.models.Post;
import com.akna.response.ApiResponse;
import com.akna.services.PostService;


@RestController
public class PostController {
	
	@Autowired
	PostService postService;
	
	@PostMapping("/posts/user/{userId}")
	public ResponseEntity<Post> createPost(@RequestBody Post post,@PathVariable("userId") Integer userId) throws Exception{
		
		Post createdPost=postService.createNewPost(post, userId);
		
		return new ResponseEntity<>(createdPost,HttpStatus.ACCEPTED);
	}
	
	@DeleteMapping("/posts/{postId}/user/{userId}")
	public ResponseEntity<ApiResponse> deletePost(@PathVariable("postId") Integer postId,@PathVariable("userId") Integer userId) throws Exception{
		
		String message = postService.deletePost(postId, userId);
		ApiResponse res=new ApiResponse(message,true);
		return new ResponseEntity<ApiResponse>(res,HttpStatus.OK);
		
	}
	@GetMapping("/posts/{postId}")
	public ResponseEntity<Post> findPostByIdHandler(@PathVariable("postId") Integer postId) throws Exception{
		
		Post post=postService.findPostById(postId);
		
		return new ResponseEntity<Post>(post,HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/posts/user/{userId}")
	public ResponseEntity<List<Post>> findUsersPost(@PathVariable("userId") Integer userId){
		
		List<Post> posts = postService.findPostByUserId(userId);
		
		return new ResponseEntity<List<Post>>(posts,HttpStatus.OK);
	}
	
	@GetMapping("/posts")
	public ResponseEntity<List<Post>> findAllPost(){
		
		List<Post> posts = postService.findAllPost();
		
		return new ResponseEntity<List<Post>>(posts,HttpStatus.OK);
	}
	
	@PutMapping("/posts/save/{postId}/user/{userId}")
	public ResponseEntity<Post> savedPostHandler(@PathVariable("postId") Integer postId,@PathVariable("userId") Integer userId) throws Exception{
		
		Post post=postService.savedPost(postId, userId);
		
		return new ResponseEntity<Post>(post,HttpStatus.ACCEPTED);
	}
	
	@PutMapping("/posts/like/{postId}/user/{userId}")
	public ResponseEntity<Post> likePostHandler(@PathVariable("postId") Integer postId,@PathVariable("userId") Integer userId) throws Exception{
		
		Post post=postService.likePost(postId, userId);
		
		return new ResponseEntity<Post>(post,HttpStatus.ACCEPTED);
	}
	
	@PutMapping("/posts/{postId}")
	public Post updatePost(@RequestBody Post post,@PathVariable("postId") Integer postId) throws Exception{
		
		Post updatePost = postService.updatPost(post, postId);
		
		return updatePost;
	}
	

}
