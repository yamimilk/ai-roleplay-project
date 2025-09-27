package cdu.zjy.topictwo.mapper;

import cdu.zjy.topictwo.dto.AllRoleDTO;
import cdu.zjy.topictwo.model.Role;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface RoleMapper {
    Role getRoleById(String roleId);
    List<Role> getAllRoles();
    int getRoleCount();
    Role addRole(Role role);
    List<AllRoleDTO> getAllRolesName();
    String getRoleVoice(String roleId);
}
