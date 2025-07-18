interface EditFormDTO {
  isAddForm?: boolean;
  formInline: SystemClientType.AddDTO | SystemClientType.UpdateDTO;
}

export type { EditFormDTO };
