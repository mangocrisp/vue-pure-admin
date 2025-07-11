import type { Resolve } from "element-plus";

interface FormProps {
  formInline: {
    lazyLoad: (node, resolve: Resolve) => void;
  } & (SystemDeptType.DeptAddDTO | SystemDeptType.DeptUpdateDTO);
}

export type { FormProps };
