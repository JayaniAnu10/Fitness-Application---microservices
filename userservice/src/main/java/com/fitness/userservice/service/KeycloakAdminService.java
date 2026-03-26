package com.fitness.userservice.service;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
@Slf4j
@AllArgsConstructor
@RequiredArgsConstructor
public class KeycloakAdminService {

    @Value("${keycloak.admin.server-url:http://localhost:8181}")
    private String keycloakServerUrl;

    @Value("${keycloak.admin.realm:fitness-oauth2}")
    private String keycloakRealm;

    @Value("${keycloak.admin.auth-realm:master}")
    private String keycloakAuthRealm;

    @Value("${keycloak.admin.client-id:admin-cli}")
    private String keycloakClientId;

    @Value("${keycloak.admin.client-secret:}")
    private String keycloakClientSecret;

    @Value("${keycloak.admin.username:admin}")
    private String keycloakAdminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String keycloakAdminPassword;

    @Value("${keycloak.admin.grant-type:password}")
    private String keycloakAdminGrantType;

    public String createKeycloakUser(String firstName, String lastName, String email, String password) {
        try {
            Keycloak keycloak = getKeycloakAdminClient();
            
            UserRepresentation userRepresentation = new UserRepresentation();
            userRepresentation.setFirstName(firstName);
            userRepresentation.setLastName(lastName);
            userRepresentation.setEmail(email);
            userRepresentation.setUsername(email);
            userRepresentation.setEnabled(true);
            
            // Create the user in Keycloak
            var response = keycloak.realm(keycloakRealm).users().create(userRepresentation);
            
            if (response.getStatus() != 201) {
                throw new RuntimeException("Failed to create user in Keycloak: HTTP " + response.getStatus());
            }
            
            // Extract user ID from Location header
            String locationUri = response.getLocation().toString();
            String keycloakUserId = locationUri.substring(locationUri.lastIndexOf('/') + 1);
            
            log.info("User created in Keycloak with ID: {}", keycloakUserId);
            
            // Set password for the user
            setKeycloakUserPassword(keycloakUserId, password, keycloak);
            
            return keycloakUserId;
            
        } catch (Exception e) {
            log.error("Error creating user in Keycloak: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create user in Keycloak: " + e.getMessage(), e);
        }
    }

    private void setKeycloakUserPassword(String keycloakUserId, String password, Keycloak keycloak) {
        try {
            CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
            credentialRepresentation.setType(CredentialRepresentation.PASSWORD);
            credentialRepresentation.setValue(password);
            credentialRepresentation.setTemporary(false);
            
            keycloak.realm(keycloakRealm).users().get(keycloakUserId).resetPassword(credentialRepresentation);
            log.info("Password set for Keycloak user: {}", keycloakUserId);
            
        } catch (Exception e) {
            log.error("Error setting password for Keycloak user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to set password for Keycloak user: " + e.getMessage(), e);
        }
    }

    public void deleteKeycloakUser(String keycloakUserId) {
        try {
            Keycloak keycloak = getKeycloakAdminClient();
            keycloak.realm(keycloakRealm).users().get(keycloakUserId).remove();
            log.info("User deleted from Keycloak: {}", keycloakUserId);
        } catch (Exception e) {
            log.error("Error deleting user from Keycloak: {}", e.getMessage(), e);
        }
    }

    private Keycloak getKeycloakAdminClient() {
        KeycloakBuilder builder = KeycloakBuilder.builder()
                .serverUrl(keycloakServerUrl)
                .realm(keycloakAuthRealm)
                .clientId(keycloakClientId)
                .grantType(keycloakAdminGrantType);

        if ("password".equalsIgnoreCase(keycloakAdminGrantType)) {
            builder.username(keycloakAdminUsername)
                    .password(keycloakAdminPassword);
        }

        if (keycloakClientSecret != null && !keycloakClientSecret.isBlank()) {
            builder.clientSecret(keycloakClientSecret);
        }

        return builder.build();
    }
}
