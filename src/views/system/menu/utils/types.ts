interface Meta extends CustomizeRouteMeta {
  icon?: string;
  extraIcon?: string;
  menuType?: number;
}

interface FormPropsItem {
  higherMenuOptions: Record<string, unknown>[];
  menuType: number;
  parentId: string | string[];
  meta: Meta;
  menuData: SystemMenuType.MenuAddDTO | SystemMenuType.MenuUpdateDTO;
  permData:
    | SystemPermissionType.PermissionAddDTO
    | SystemPermissionType.PermissionUpdateDTO;
}

interface FormProps {
  formInline: FormPropsItem;
}

export type { FormPropsItem, FormProps };
