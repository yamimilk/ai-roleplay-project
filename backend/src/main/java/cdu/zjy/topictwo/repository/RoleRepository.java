package cdu.zjy.topictwo.repository;


import cdu.zjy.topictwo.model.Role;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Repository
public class RoleRepository {
    private final List<Role> roles;

    public RoleRepository() {
        ObjectMapper mapper = new ObjectMapper();
        try (InputStream is = getClass().getResourceAsStream("/roles.json")) {
            roles = mapper.readValue(is, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to load roles.json", e);
        }
    }

    public List<Role> findAll() {
        return roles;
    }

    public Optional<Role> findById(String id) {
        return roles.stream().filter(r -> r.getId().equals(id)).findFirst();
    }
}
