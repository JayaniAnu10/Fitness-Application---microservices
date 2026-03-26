package com.fitness.gateway.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String keyclockId;

    @NotBlank(message = "Email is needed")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min=6,message = "Password must have at least 6 characters")
    private String password;

}
