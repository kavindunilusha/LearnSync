package com.akna.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.akna.repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.akna.models.Post;
import com.akna.models.User;
import com.akna.repository.PostRepository;

@Service
public class PostServiceImplementation  implements PostService{
	
	@Autowired
	PostRepository postRepository;
	
	@Autowired
	UserService userService;
	
	@Autowired
	UserRepository userRepository;

	@Override
	public Post createNewPost(@Valid Post post, Integer userId) throws Exception {
		
		User user = userService.findUserById(userId);
		
		Post newPost = new Post();
		newPost.setCaption(post.getCaption());
//		newPost.setImage(post.getImage());
		newPost.setImages(post.getImages());
		newPost.setCreatedAt(LocalDateTime.now());
		newPost.setVideo(post.getVideo());
		newPost.setUser(user);
		return postRepository.save(newPost);
	}

	@Override
	public String deletePost(Integer postId, Integer userId) throws Exception {
		
		Post post = findPostById(postId);
		User user = userService.findUserById(userId);
		
		if(post.getUser().getId()!=user.getId()){
			throw new Exception("You can't delete another users post");
		}
		
		postRepository.delete(post);
		return "Post deleted Successfully";
	}

	@Override
	public List<Post> findPostByUserId(Integer userId) {
		
		return postRepository.findPostByUserId(userId);
	}

	@Override
	public Post findPostById(Integer postId) throws Exception {
		Optional<Post> opt = postRepository.findById(postId);
		if(opt.isEmpty()) {
			throw new Exception("post not found by id "+ postId); 
		}
		
		return opt.get();
	}

	@Override
	public List<Post> findAllPost() {
		return postRepository.findAll();
	}

	@Override
	public Post savedPost(Integer postId, Integer userId) throws Exception {
		Post post = findPostById(postId);
		User user = userService.findUserById(userId);
		
		if(user.getSavedPost().contains(post)) {
			user.getSavedPost().remove(post);
		}
		else {
			user.getSavedPost().add(post);
			userRepository.save(user);
		}
		
		return post;
	}

	@Override
	public Post likePost(Integer postId, Integer userId) throws Exception {
		Post post = findPostById(postId);
		User user = userService.findUserById(userId);
		
		if(post.getLiked().contains(user)) {
			
			post.getLiked().remove(user);
		}
		else {
			post.getLiked().add(user);
		}
		
		return postRepository.save(post);
	}

	@Override
	public Post updatPost(@Valid Post post, Integer postId) throws Exception {
		
		Optional <Post> post1 = postRepository.findById(postId);
		
		if(post1.isEmpty()) {
			throw new Exception("post not exit with id " + postId);
		}
		Post oldPost = post1.get();
		
		if(post.getCaption()!=null) {
			oldPost.setCaption(post.getCaption());
		}
//		if (post.getImage() != null) {
//		    oldPost.setImage(post.getImage());
//		}
		if (post.getImages() != null && !post.getImages().isEmpty()) {
		    if (post.getImages().size() > 3) {
		        throw new Exception("Maximum of 3 images allowed.");
		    }
		    oldPost.setImages(post.getImages());
		}

		if(post.getVideo()!=null) {
			oldPost.setVideo(post.getVideo());
		}
		
		Post updatedPost= postRepository.save(oldPost);
		
		return updatedPost;
	}

}
