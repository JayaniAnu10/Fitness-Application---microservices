package com.fitness.userservice.service;

import com.fitness.userservice.dto.RegisterRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.model.User;
import com.fitness.userservice.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;

    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("user not found"));
        return mapUserToResponse(user);
    }

    public UserResponse getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("user not found");
        }
        return mapUserToResponse(user);
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            User existingUser = userRepository.findByEmail(request.getEmail());
            log.warn("User already exists with email: {}", request.getEmail());
            return mapUserToResponse(existingUser);
        }

        // Step 1: Create user in Keycloak first
        String keycloakId;
        try {
            keycloakId = keycloakAdminService.createKeycloakUser(
                    request.getFirstName(),
                    request.getLastName(),
                    request.getEmail(),
                    request.getPassword()
            );
            log.info("User created in Keycloak with ID: {}", keycloakId);
        } catch (Exception e) {
            log.error("Failed to create user in Keycloak: {}", e.getMessage());
            throw new RuntimeException("Registration failed: Unable to create user in identity provider", e);
        }

        // Step 2: Create user in local database
        try {
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setKeyclockId(keycloakId);
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword()); // Should be hashed in production

            User savedUser = userRepository.save(user);
            log.info("User created in database with ID: {} and Keycloak ID: {}", savedUser.getId(), keycloakId);
            
            return mapUserToResponse(savedUser);
        } catch (Exception e) {
            log.error("Failed to save user to database, rolling back Keycloak user: {}", e.getMessage());
            // Rollback: delete user from Keycloak if database save fails
            keycloakAdminService.deleteKeycloakUser(keycloakId);
            throw new RuntimeException("Registration failed: Unable to save user to database", e);
        }
    }

    public UserResponse updateKeycloakIdByEmail(String email, String keycloakId) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found for email: " + email);
        }
        if (user.getKeyclockId() == null || user.getKeyclockId().isBlank()) {
            user.setKeyclockId(keycloakId);
            User updatedUser = userRepository.save(user);
            return mapUserToResponse(updatedUser);
        }
        return mapUserToResponse(user);
    }

    public Boolean existByUserId(String userId) {
        log.info("calling existByUserId {}", userId);
        return userRepository.existsByKeyclockId(userId);
    }

    private UserResponse mapUserToResponse(User user) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setKeyclockId(user.getKeyclockId());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setEmail(user.getEmail());
        userResponse.setPassword(user.getPassword());
        userResponse.setCreatedDate(user.getCreatedDate());
        userResponse.setUpdatedDate(user.getUpdatedDate());
        return userResponse;
    }
}