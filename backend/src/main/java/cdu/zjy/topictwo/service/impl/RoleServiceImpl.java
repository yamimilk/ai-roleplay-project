package cdu.zjy.topictwo.service.impl;

import cdu.zjy.topictwo.dto.AllRoleDTO;
import cdu.zjy.topictwo.mapper.RoleMapper;
import cdu.zjy.topictwo.model.Role;
import cdu.zjy.topictwo.service.RoleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public  class RoleServiceImpl implements RoleService {

//    @Autowired
    private final RoleMapper roleMapper;

    public RoleServiceImpl(RoleMapper roleMapper) {
        this.roleMapper = roleMapper;
    }

    @Override
    public Role getRoleById(String id) {
        return roleMapper.getRoleById(id);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleMapper.getAllRoles();
    }

    @Override
    public Integer getRoleCount() {
        return roleMapper.getRoleCount();
    }

    @Override
    public List<AllRoleDTO> getAllRolesName(){return  roleMapper.getAllRolesName();}
}
