interface EditFormDTO {
  isAddForm?: boolean;
  formInline: SystemParamsType.ParamsAddDTO | SystemParamsType.ParamsUpdateDTO;
}

export type { EditFormDTO };
