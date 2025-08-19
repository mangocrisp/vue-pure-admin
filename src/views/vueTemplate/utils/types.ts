interface EditFormDTO {
  isAddForm?: boolean;
  formInline: VueTemplateType.AddDTO | VueTemplateType.UpdateDTO;
}

export type { EditFormDTO };
