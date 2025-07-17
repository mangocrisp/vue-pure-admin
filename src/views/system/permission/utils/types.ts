interface PermissionEditFormDTO {
  formInline: {
    higherMenuOptions: Record<string, unknown>[];
  } & (
    | SystemPermissionType.PermissionAddDTO
    | SystemPermissionType.PermissionUpdateDTO
  );
}

export type { PermissionEditFormDTO };
