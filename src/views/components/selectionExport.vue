<script lang="tsx" setup>
import { onMounted, reactive, ref, unref } from "vue";
import { ElCheckbox, ElMessage } from "element-plus";
import { useToggle } from "@/hooks/web/useToggle";
import { useStateRef } from "@/hooks/tool/useStateRef";

import type { FunctionalComponent } from "vue";
import type {
  CheckboxValueType,
  Column,
  FormInstance,
  FormRules
} from "element-plus";
import { message } from "@/utils/message";

defineOptions({
  name: "SelectionExport"
});

type SelectionCellProps = {
  key: string;
  value: boolean;
  intermediate?: boolean;
  onChange: (value: CheckboxValueType) => void;
};

interface FormType {
  fileName: string;
  exportTemplateField: SelectionExportExcelType[];
  maxSize: number;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    defaultCheckedKeys?: string[];
    defaultExportFileName?: string;
    maxSize?: number;
  }>(),
  {
    title: "导出数据",
    defaultCheckedKeys: () => [],
    defaultExportFileName: "",
    maxSize: 1000
  }
);

const emit = defineEmits<{
  (e: "confirm", form: FormType): void;
}>();

const visible = defineModel({ type: Boolean, default: false });

const selectionFieldsRef = ref<SelectionExportExcelType[]>([]);

const [loading, toggleLoading] = useToggle();
const [dataLoading, toggleDataLoading] = useToggle();

const [list, setList, resetList] = useStateRef<SelectionExportExcelType[]>(
  () => []
);
const [cacheList, setCacheList] = useStateRef<SelectionExportExcelType[]>(
  () => []
);
const [selections, setSelections, resetSelections] = useStateRef<
  SelectionExportExcelType[]
>(() => []);

const [query, , resetQuery] = useStateRef(() => ({ name: "" }));

const [form, setForm] = useStateRef<FormType>(() => ({
  fileName: props.defaultExportFileName,
  exportTemplateField: [],
  maxSize: 1000
}));

const rules = reactive<FormRules>({
  fileName: [
    {
      required: true,
      message: "文件名不能为空"
    },
    {
      pattern: /^(?!.*[\\/:*?"<>|]).*$/,
      message: "请输入正确的文件名",
      trigger: ["blur", "change"]
    }
  ]
});

const formRef = ref<FormInstance | null>();

const columns: Column<any>[] = [
  {
    key: "key",
    dataKey: "name",
    title: "可选字段",
    width: 610
  }
];

// 自定义字段 用于表格选择状态
const checkedField = "myCheckedField";
const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
  key
}) => {
  return (
    <ElCheckbox
      key={key}
      onChange={onChange}
      modelValue={value}
      indeterminate={intermediate}
    />
  );
};

const cloneSelectionRow = row => {
  row[checkedField] = false;
  selections.value.splice(selections.value.indexOf(row), 1);
};

const setDefaultSelections = list => {
  if (!list.length) return;
  const defaultSelections = cacheList.value.filter(row =>
    list.includes(row.key)
  );
  defaultSelections.map(item => (item[checkedField] = true));
  setSelections(defaultSelections);
};

columns.unshift({
  key: "selection",
  width: 50,
  cellRenderer: ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => {
      if (value) {
        selections.value.push(rowData);
      } else {
        cloneSelectionRow(rowData);
      }
      rowData[checkedField] = value;
    };

    return (
      <SelectionCell
        key={rowData.key}
        value={rowData[checkedField]}
        onChange={onChange}
      />
    );
  },

  headerCellRenderer: () => {
    const _list = unref(cacheList);
    const _selections = unref(selections);

    const onChange = (value: CheckboxValueType) => {
      list.value.map(item => (item[checkedField] = value));
      if (value) {
        setSelections(list.value);
      } else {
        resetSelections();
      }
    };

    // 使用 Set 去重并比较长度
    const uniqueOriginal = new Set(_list);
    const uniqueSelected = new Set(_selections);

    const allSelected =
      uniqueOriginal.size > 0 && uniqueOriginal.size === uniqueSelected.size;
    const containsChecked = uniqueSelected.size > 0;

    return (
      <SelectionCell
        key="header-selectioin"
        value={allSelected}
        intermediate={containsChecked && !allSelected}
        onChange={onChange}
      />
    );
  }
});

const init = (data: SelectionExportExcelType[]) => {
  if (selectionFieldsRef.value.length == 0) {
    selectionFieldsRef.value = data;
    load();
  }
};

const getSelectionFields = () => {
  return selectionFieldsRef.value;
};

const load = () => {
  toggleDataLoading(true);
  try {
    setList(selectionFieldsRef.value);
    setCacheList(selectionFieldsRef.value);
    setDefaultSelections(props.defaultCheckedKeys);
  } finally {
    toggleDataLoading(false);
  }
};

const filter = () => {
  resetList();
  if (!query.value.name) {
    setList(cacheList.value);
    return;
  }
  setList(
    cacheList.value.filter(item => item.name?.includes(query.value.name))
  );
};

const resetFilter = () => {
  resetQuery();
  filter();
};

const handleSubmit = async () => {
  if (
    !form.value.exportTemplateField ||
    form.value.exportTemplateField.length === 0
  ) {
    message("请至少勾选一个字段导出!", { type: "warning" });
    return;
  }
  await formRef.value?.validate();

  // 把序号放数组第一位
  const isIndex = selections.value.findIndex(
    obj => obj.format === "isAddIndex"
  );
  if (isIndex !== -1) {
    const [index] = selections.value.splice(isIndex, 1);
    selections.value.unshift(index);
  }

  setForm({
    exportTemplateField: selections.value.map(obj => {
      return Object.keys(obj)
        .filter(key => key !== checkedField) // 过滤掉要移除的字段
        .reduce((newObj, key) => {
          newObj[key] = obj[key];
          return newObj;
        }, {});
    }) as SelectionExportExcelType[]
  });

  emit("confirm", form.value);
};

const pass = () => {
  toggleLoading(false);
  visible.value = false;
};

onMounted(load);

defineExpose({
  getSelectionFields,
  init,
  pass
});
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="700px"
    :close-on-click-modal="false"
    draggable
    overflow
  >
    <el-form inline :model="query" @submit.prevent>
      <el-form-item label="字段名">
        <el-input v-model="query.name" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" @click="filter">
          查询
        </el-button>
        <el-button @click="resetFilter"> 重置 </el-button>
        <el-popover placement="bottom" :width="1000" trigger="click">
          <template #reference>
            <el-button> 查看已选择 </el-button>
          </template>
          <div v-if="selections.length === 0" class="text-center">数据为空</div>
          <div class="h-400px overflow-auto flex flex-wrap gap-2">
            <el-tag
              v-for="tag in selections"
              :key="tag.key"
              closable
              @close="cloneSelectionRow(tag)"
            >
              {{ tag.name }}
            </el-tag>
          </div>
        </el-popover>
      </el-form-item>
    </el-form>

    <div v-loading="dataLoading" class="data-table-container">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2
            :columns="columns"
            :data="list"
            :width="width"
            :height="height"
            fixed
          />
        </template>
      </el-auto-resizer>
    </div>

    <el-form
      ref="formRef"
      class="mt-3"
      inline
      :rules="rules"
      :model="form"
      @submit.prevent
    >
      <el-form-item prop="fileName" label="文件名：">
        <el-input
          v-model="form.fileName"
          class="!w-350px"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <br />
      <el-form-item prop="fileName" label=" 数据行：">
        <el-input
          v-model="form.maxSize"
          class="!w-350px"
          type="number"
          max="1000"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
    </el-form>
    <el-collapse>
      <el-collapse-item title="导出说明">
        <el-alert title="提示" type="warning" :closable="false" show-icon>
          <template #default>
            <ol>
              <li>
                <strong
                  >1.
                  可以只导出选择的数据行，如果不选择导出的数据行，默认导出按条件查询的结果最多{{
                    maxSize
                  }}条</strong
                >
              </li>
              <li>
                <strong>2. 可以只导出选择的字段</strong>
              </li>
            </ol>
          </template>
        </el-alert>
      </el-collapse-item>
    </el-collapse>
    <template #footer>
      <span class="dialog-footer">
        <el-button :loading="loading" @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit"
          >确定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.data-table-container {
  height: 400px;
}
</style>
