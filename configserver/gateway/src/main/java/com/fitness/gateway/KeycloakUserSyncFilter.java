package com.fitness.gateway;

import com.fitness.gateway.user.RegisterRequest;
import com.fitness.gateway.user.UserService;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Slf4j
@RequiredArgsConstructor
@Order(1)
public class KeycloakUserSyncFilter implements WebFilter {
    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-ID");

        // If no Authorization header is present, pass through (let SecurityConfig handle it)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return chain.filter(exchange);
        }

        RegisterRequest registerRequest = getUserDetails(authHeader);

        // Resolve userId from JWT sub if header not provided
        if (userId == null && registerRequest != null) {
            userId = registerRequest.getKeyclockId();
        }

        if (userId != null && registerRequest != null) {
            final String finalUserId = userId;
            final RegisterRequest finalRegisterRequest = registerRequest;

            return userService.validateUser(finalUserId)
                    .flatMap(exists -> {
                        if (!exists) {
                            log.info("User {} not found in DB, auto-registering", finalUserId);
                            return userService.registerUser(finalRegisterRequest)
                                    .doOnSuccess(u -> log.info("Auto-registered user: {}", u.getEmail()))
                                    .doOnError(e -> log.error("Failed to auto-register user {}: {}", finalUserId, e.getMessage()))
                                    .onErrorResume(e -> Mono.empty()); // don't block the request on register failure
                        }
                        return Mono.empty();
                    })
                    .then(Mono.defer(() -> {
                        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                .header("X-User-ID", finalUserId)
                                .build();
                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    }));
        }

        return chain.filter(exchange);
    }

    private RegisterRequest getUserDetails(String token) {
        try {
            String tokenWithoutBearer = token.replace("Bearer ", "").trim();
            SignedJWT signedJWT = SignedJWT.parse(tokenWithoutBearer);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail(claims.getStringClaim("email"));
            registerRequest.setKeyclockId(claims.getStringClaim("sub"));
            registerRequest.setPassword("123456");
            registerRequest.setFirstName(claims.getStringClaim("given_name"));
            registerRequest.setLastName(claims.getStringClaim("family_name"));
            return registerRequest;
        } catch (Exception e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
            return null;
        }
    }
}