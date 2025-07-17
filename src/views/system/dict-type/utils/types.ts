interface DictTtypeEditFormDTO {
  formInline:
    | SystemDictTypeType.DictTypeAddDTO
    | SystemDictTypeType.DictTypeUpdateDTO;
}

export type { DictTtypeEditFormDTO };
