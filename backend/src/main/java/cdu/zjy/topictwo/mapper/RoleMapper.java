package cdu.zjy.topictwo.mapper;

import cdu.zjy.topictwo.model.Role;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface RoleMapper {
    Role getRoleById(String id);

    List<Role> getAllRoles();
}
