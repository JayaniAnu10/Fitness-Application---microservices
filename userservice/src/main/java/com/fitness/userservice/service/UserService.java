package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId).orElseThrow(()->new RuntimeException("user not found"));
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setEmail(user.getEmail());
        userResponse.setPassword(user.getPassword());
        userResponse.setCreatedDate(user.getCreatedDate());
        userResponse.setUpdatedDate(user.getUpdatedDate());
        return userResponse;
    }

    public UserResponse register(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        User user= new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User savedUser = userRepository.save(user);
        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setFirstName(savedUser.getFirstName());
        userResponse.setLastName(savedUser.getLastName());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setPassword(savedUser.getPassword());
        userResponse.setCreatedDate(savedUser.getCreatedDate());
        userResponse.setUpdatedDate(savedUser.getUpdatedDate());
        return userResponse;
    }

    public Boolean existByUserId(String userId) {
        log.info("calling existByUserId {}", userId);
        return userRepository.existsById(userId);
    }
}
