interface EditFormDTO {
  isAddForm?: boolean;
  formInline: LfFormType.AddDTO | LfFormType.UpdateDTO;
}

export type { EditFormDTO };
