interface EditFormDTO {
  isAddForm?: boolean;
  formInline: SystemTenantType.AddDTO | SystemTenantType.UpdateDTO;
}

export type { EditFormDTO };
