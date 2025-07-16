/**
 * 用户管理
 */
declare namespace SystemUserType {
  export interface User extends DefaultParams {
    id: string;
    avatar: string;
    loginIp: string;
    email: string;
    gender: string;
    nickname: string;
    password?: string;
    phone: string;
    realName: string;
    userType: string;
    username: string;
    status: NumStatus;
  }

  /** 新增对象*/
  export interface UserAddDTO {
    id?: string;
    email?: string;
    gender?: string;
    nickname: string;
    password: string;
    phone: string;
    realName?: string;
    userType?: string;
    username: string;
    status: NumStatus;
  }

  /** 修改对象*/
  export interface UserUpdateDTO {
    id: string;
    avatar?: string;
    email?: string;
    gender?: string;
    nickname?: string;
    password?: string;
    phone?: string;
    realName?: string;
    userType?: string;
    username?: string;
    status?: NumStatus;
  }

  export interface MyInfo {
    avatar?: string;
    email?: string;
    id?: string;
    nickname?: string;
    roles?: string[];
    status?: number;
    userType?: string;
    username?: string;
  }

  export interface UserRole {
    userId: string;
    roleId: string;
  }

  export interface UserAvatarDTO {
    id: string;
    avatar: string;
  }

  export interface MoreInfo {
    avatar: string;
    email: string;
    gender: string;
    id: string;
    nickname: string;
    phone: string;
    realName: string;
    status: number;
    userType: string;
    username: string;
  }

  /** 查询体 DTO */
  export interface UserQueryDto {
    deptId: string;
    username: string;
    phone: string;
    status: NumStatus;
  }

  /** 查询体 */
  export interface UserQueryBody {
    queryDto: UserQueryDto;
  }

  /** 新增修改表单属性 */
  export interface UserEditFormDTO {
    formInline: { deptId?: string[] } & (UserAddDTO | UserUpdateDTO);
  }
}
