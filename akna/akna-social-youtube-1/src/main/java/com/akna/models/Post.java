package com.akna.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Size;

@Entity

public class Post {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;
	
	private String caption;
	@ElementCollection
	@CollectionTable(name = "post_images")
	@Size(max = 3, message = "Maximum of 3 images allowed")
	private List<String> images = new ArrayList<>();
//	private String image;
	private String video;
	
	
	@ManyToOne//one user have multiple posts
	private User user;
	
	private LocalDateTime createdAt;
	
	@OneToMany //Multiple users like to one post
	private List<User> liked=new ArrayList<>();
	
	
	
	public Post() {
		// TODO Auto-generated constructor stub
	}
	

public Post(Integer id, String caption, List<String> images, String video, User user, LocalDateTime createdAt,
			List<User> liked) {
		super();
		this.id = id;
		this.caption = caption;
		this.images = images;
		this.video = video;
		this.user = user;
		this.createdAt = createdAt;
		this.liked = liked;
	}

//	public Post(Integer id, String caption, String image, String video, User user, LocalDateTime createdAt,
//			List<User> liked) {
//		super();
//		this.id = id;
//		this.caption = caption;
//		this.image = image;
//		this.video = video;
//		this.user = user;
//		this.createdAt = createdAt;
//		this.liked = liked;
//	}

	public List<User> getLiked() {
		return liked;
	}
	public void setLiked(List<User> liked) {
		this.liked = liked;
	}
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getCaption() {
		return caption;
	}
	public void setCaption(String caption) {
		this.caption = caption;
	}
	
	public List<String> getImages() {
		return images;
	}


	public void setImages(List<String> images) {
		this.images = images;
	}


	//	public String getImage() {
//		return image;
//	}
//	public void setImage(String images) {
//		this.image = image;
//	}
	public String getVideo() {
		return video;
	}
	public void setVideo(String video) {
		this.video = video;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	
	
	

}
