interface FormProps {
  formInline: {
    /** 用于判断是`新增`还是`修改` */
    title: string;
    higherDeptOptions: Record<string, unknown>[];
    deptId?: string[];
  } & (SystemUserType.UserAddDTO | SystemUserType.UserUpdateDTO);
}

interface RoleFormItemProps {
  username: string;
  nickname: string;
  /** 角色列表 */
  roleOptions: any[];
  /** 选中的角色列表 */
  ids: Record<string, unknown>[];
}

interface RoleFormProps {
  formInline: RoleFormItemProps;
}

interface TenantFormItemProps {
  username: string;
  nickname: string;
  /** 租户列表 */
  tenantOptions: any[];
  /** 选中的租户列表 */
  tenantIds: Record<string, unknown>[];
}

interface TenantFormProps {
  formInline: TenantFormItemProps;
}

export type {
  FormProps,
  RoleFormItemProps,
  TenantFormItemProps,
  TenantFormProps,
  RoleFormProps
};
