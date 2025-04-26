package backend.controller;

import backend.model.CoursesModel;
import backend.repository.CoursesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
public class CoursesController {
    @Autowired
    private CoursesRepository coursesRepository;

    @GetMapping("/courses")
    List<CoursesModel> getAll() {return coursesRepository.findAll();}

    @GetMapping("/courses/{id}")
    CoursesModel getById(@PathVariable String id) {return coursesRepository.findById(id).get();}

}
