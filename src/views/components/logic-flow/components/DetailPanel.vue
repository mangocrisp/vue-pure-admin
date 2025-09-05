<script lang="ts">
export default {
  name: "DetailPanel"
};
</script>
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { inject, Ref, ref, reactive, watch, nextTick, onMounted } from "vue";
import { Uuid } from "ts-uuid";
import { on } from "events";
import { set } from "nprogress";

export interface Props {
  nodeData?: LogicFlowTypes.EditData;
}
const props = withDefaults(defineProps<Props>(), {
  nodeData: undefined
});

/**
 * 是否打开节点详情抽屉
 */
const drawerDetail = inject<Ref<boolean>>("drawerDetail", ref(true));

/**
 * 角色列表
 */
const roleChoseList = inject<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "roleChoseList",
  ref([])
);
/**
 * 组件列表
 */
const componentsChoseList = inject<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "componentsChoseList",
  ref([])
);
/**
 * 部门列表
 */
const deptChoseList = inject<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "deptChoseList",
  ref([])
);
/**
 * 表单绑定列表
 */
const formBindChoseList = inject<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "formBindChoseList",
  ref([])
);
/**
 * 用户列表，这里只能提供一些默认用户，比如超级管理员，具体可以是哪些用户，都应该是让用户自己去输入，然后确认
 */
const userChoseList = inject<Ref<LogicFlowTypes.SelectOptionItem[]>>(
  "userChoseList",
  ref([])
);
/**
 * 表单
 */
const form = ref<LogicFlowTypes.EditData>(props.nodeData);

onMounted(() => {
  nextTick(() => {
    generatSelectOption(form.value.properties);
  });
});
/**
 * 监听 props
 */
watch(props, val => {
  form.value = val.nodeData;
  nextTick(() => {
    generatSelectOption(form.value.properties);
  });
});

/**
 * 因为节点的属性是动态的,所以,这里需要根据业务属性生成 select option
 * @param properties 业务属性
 */
const generatSelectOption = (properties: LogicFlowTypes.BusinessProperties) => {
  if (properties.roles) {
    roleChoseList.value.length = 0;
    roleChoseList.value = properties.roles.map(item => {
      return {
        key: item.id,
        label: item.name,
        value: { id: item.id, name: item.name }
      };
    });
  }
  if (properties.userIdList) {
    userChoseList.value.length = 0;
    userChoseList.value = properties.userIdList.map(item => {
      return {
        key: item.id,
        label: item.name,
        value: { id: item.id, name: item.name }
      };
    });
  }
  if (properties.deptIdList) {
    deptChoseList.value.length = 0;
    deptChoseList.value = properties.deptIdList.map(item => {
      return {
        key: item.id,
        label: item.name,
        value: { id: item.id, name: item.name }
      };
    });
  }
};

/**
 * 定义钩子
 */
const emit = defineEmits<{
  /**当数据发生改变时触发 */
  (e: "change", value: LogicFlowTypes.EditData): void;
  /**远程调用方法 */
  (
    e: "remoteMethod",
    value: {
      forWhat: string;
      value: any;
    }
  ): void;
}>();

/**
 * 远程角色查询方法
 * @param value 搜索值
 */
const remoteRole = (value: any) => {
  emit("remoteMethod", { forWhat: "role", value });
};

/**
 * 远程部门查询方法
 * @param value 搜索值
 */
const remoteDept = (value: any) => {
  emit("remoteMethod", { forWhat: "dept", value });
};

/**
 * 远程用户查询方法
 * @param value 搜索值
 */
const remoteUser = (value: any) => {
  emit("remoteMethod", { forWhat: "user", value });
};
/**
 * 提交
 * @param formEl 表单对象
 */
const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    {
      if (valid) {
        emit("change", form.value);
        drawerDetail.value = false;
      } else {
        console.log("error submit!");
      }
    }
  });
};
const formRef = ref<FormInstance>();

/**
 * 判断条件
 */
const conditionOptions = ref<LogicFlowTypes.SelectOptionItem[]>([
  {
    key: "SpEL",
    label: "SpEL 表达式",
    value: "SpEL"
  },
  {
    key: "topic",
    label: "主题(spring boot bean name)",
    value: "topic"
  }
]);

/**
 * 删除表单项
 * @param index 字段索引
 */
const removeFormItem = (index: number) => {
  form.value.properties.fields?.splice(index, 1);
};
/**
 * 添加表单项
 */
const addFormItem = () => {
  let len = form.value.properties.fields
    ? Object.keys(form.value.properties.fields).length
    : 0;
  form.value.properties.fields = (
    form.value.properties.fields ? form.value.properties.fields : []
  ).concat([
    {
      key: Uuid.create().toString().replace(/-/g, ""),
      name: `field${len + 1}`,
      title: `字段${len + 1}`,
      type: "STRING",
      value: "",
      sort: len,
      readonly: false,
      disabled: false
    }
  ]);
  nextTick(() => {
    setTimeout(() => {
      dynamicFormFieldBox.value.scrollTop =
        dynamicFormFieldBox.value.scrollHeight;
    }, 0);
  });
};
/**
 * 字段排序
 */
const fieldSort = () => {
  form.value.properties.fields?.sort((f1, f2) => {
    return (f1?.sort ?? 0) - (f2?.sort ?? 0);
  });
};
/**
 * 重围表单
 * @param formEl 表单对象
 */
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
/** 动态表单字段盒子 */
const dynamicFormFieldBox = ref();
/**
 * 检验动态表单字段
 * @param rule 规则
 * @param prop 表单项
 * @param callback 回调
 */
const validateDynamicField = (
  rule: any,
  prop: LogicFlowTypes.BusinessField,
  callback: any
) => {
  // console.log(prop)
  if (prop.name === "") {
    callback(new Error("字段名不能为空"));
  } else if (prop.title === "") {
    callback(new Error("字段标题不能为空"));
  } else {
    callback();
  }
};
/**
 * 选择输入框的类型
 * STRING: 字符串
 * NUMBER: 数字
 * BOOLEAN: 布尔 (0,1)
 * DATE_TIME: 时间
 * TEXT: 长文本
 * DICT: 字典
 * FILE: 文件
 * @param type 字段类型
 */
const chooseInputType = (type: string) => {
  return (
    {
      STRING: "text",
      TEXT: "textarea",
      NUMBER: "number",
      BOOLEAN: "number",
      DATE_TIME: "datetime-local",
      DICT: "text",
      FILE: "file"
    }[type] ?? "text"
  );
};
</script>
<template>
  <el-form
    id="logic-flow-dynamic-form"
    ref="formRef"
    :model="form"
    label-width="100px"
    :disabled="form.readonly"
  >
    <el-form-item v-show="!form.readonly">
      <el-button type="primary" @click="onSubmit(formRef)">提交</el-button>
      <el-button type="warning" @click="resetForm(formRef)">重置</el-button>
      <el-button @click="drawerDetail = false">取消</el-button>
    </el-form-item>
    <el-form-item label="节点类型">
      <el-input v-model="form.type" disabled readonly />
    </el-form-item>
    <el-form-item label="id">
      <el-input v-model="form.id" readonly />
    </el-form-item>
    <el-form-item
      label="标题"
      prop="text"
      :rules="{
        required: true,
        message: '标题不能为空',
        trigger: 'blur'
      }"
    >
      <el-input v-model="form.text" type="textarea" />
    </el-form-item>

    <el-form-item
      v-if="
        ['custom-node-user'].indexOf(form.type) > -1 && !form.properties.isCC
      "
      label="是否会签"
      prop="properties.isCountersign"
    >
      <el-tooltip
        content="选择是：所有的用户都处理了之后，才能继续"
        placement="bottom"
      >
        <el-switch
          v-model="form.properties.isCountersign"
          size="large"
          active-text="是"
          inactive-text="否"
          @change="
            form.properties.roles = [];
            form.properties.deptIdList = [];
          "
        />
      </el-tooltip>
    </el-form-item>

    <el-form-item
      v-if="
        ['custom-node-user'].indexOf(form.type) > -1 &&
        !form.properties.isCountersign
      "
      label="是否抄送"
      prop="properties.isCC"
    >
      <el-tooltip
        content="抄送只发送待办给抄送人,无需处理直接下一个节点"
        placement="bottom"
      >
        <el-switch
          v-model="form.properties.isCC"
          size="large"
          active-text="是"
          inactive-text="否"
          @change="
            form.properties.roles = [];
            form.properties.deptIdList = [];
          "
        />
      </el-tooltip>
    </el-form-item>
    <el-form-item
      v-if="
        ['custom-node-user'].indexOf(form.type) > -1 &&
        !form.properties.isCountersign &&
        !form.properties.isCC
      "
      label="处理角色"
      prop="properties.roles"
    >
      <!-- :rules="{
        required: true,
        message: '处理角色不能为空',
        trigger: 'blur'
      }" -->
      <el-select-v2
        v-model="form.properties.roles"
        style="width: 240px"
        multiple
        placeholder="可以处理的角色"
        filterable
        remote
        :remote-method="remoteRole"
        clearable
        :options="roleChoseList"
        value-key="value"
      />
    </el-form-item>
    <el-form-item
      v-if="
        ['custom-node-user'].indexOf(form.type) > -1 &&
        !form.properties.isCountersign &&
        !form.properties.isCC
      "
      label="处理部门"
      prop="properties.deptIdList"
    >
      <el-select-v2
        v-model="form.properties.deptIdList"
        style="width: 240px"
        multiple
        filterable
        placeholder="可以处理的部门"
        remote
        :remote-method="remoteDept"
        clearable
        :options="deptChoseList"
        value-key="value"
      />
    </el-form-item>
    <el-form-item
      v-if="['custom-node-user'].indexOf(form.type) > -1"
      label="处理人"
      prop="properties.userIdList"
    >
      <el-alert
        type="warning"
        description="输入用户登录名，然后选择输入的用户，可以自行指定用户。注意，用户名一定要是系统里面存在的用户，如果随便输入一个不存在的用户，这个任务将不能进行下去！！！"
        :closable="false"
      />
      <el-select-v2
        v-model="form.properties.userIdList"
        style="width: 240px"
        multiple
        filterable
        placeholder="指定处理的用户"
        remote
        :remote-method="remoteUser"
        clearable
        :options="userChoseList"
        value-key="value"
      />
    </el-form-item>
    <el-form-item
      v-if="['custom-node-user', 'custom-node-end'].indexOf(form.type) > -1"
      label="是否自动处理"
      prop="properties.autoExecute"
    >
      <!-- 如果不自动处理,那自动处理的条件和他对应的比如表达式和主题都要清空 -->
      <el-switch
        v-model="form.properties.autoExecute"
        @change="
          (val: boolean) =>
            !val
              ? (form.properties.condition =
                  form.properties.expression =
                  form.properties.topic =
                    undefined)
              : {}
        "
      />
    </el-form-item>
    <!-- 这里,当节点是用户节点或者系统节点的时候,或者是边就创建,如果是节点的话,就要判断,是否自动处理如果是 true 才显示 -->
    <el-form-item
      v-if="
        (['custom-node-user', 'custom-node-end'].indexOf(form.type) > -1 &&
          form.properties.autoExecute) ||
        form.type.startsWith('custom-edge') ||
        ['custom-node-service'].indexOf(form.type) > -1
      "
      label="处理方式"
      prop="properties.condition"
      :rules="{
        required: true,
        message: '处理方式不能为空',
        trigger: 'blur'
      }"
    >
      <el-select
        v-model="form.properties.condition"
        placeholder="选择如何去处理或判断"
        clearable
        @clear="form.properties.expression = form.properties.topic = undefined"
        @change="form.properties.expression = form.properties.topic = undefined"
      >
        <el-option
          v-for="item in conditionOptions"
          :key="item.key"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <!-- SpEL 表达式 -->
    <el-form-item
      v-if="
        (['custom-node-user', 'custom-node-service', 'custom-node-end'].indexOf(
          form.type
        ) > -1 ||
          form.type.startsWith('custom-edge')) &&
        form.properties.condition === 'SpEL'
      "
      label="SpEL 表达式"
      prop="properties.expression"
      :rules="{
        required: true,
        message: '表达式不能为空',
        trigger: 'blur'
      }"
    >
      <el-alert type="success" :closable="false">
        <template #default>
          注意：自动处理生成的结果会使用 auto_result
          作为字段名加入节点或者连线的表单，所以添加表单字段时注意不要重名<br />
          <a href="http://itmyhome.com/spring/expressions.html" target="_blank"
            >SpEL 表达式使用说明,这个一般是给后端开发人员使用的</a
          >，这里如果想要使用流程中的一些属性，可以使用如下语法：#{node/edge}_{节点/连线id}_{表单/属性字段名}_$$historyId$$
          <br />使用示例：#node_550770f1526742ceba05e33f63fbc0e4_auto_result_$$historyId$$
        </template>
      </el-alert>
      <el-input v-model="form.properties.expression" type="textarea" />
    </el-form-item>
    <!-- topic 主题名 -->
    <el-form-item
      v-if="
        (['custom-node-user', 'custom-node-service', 'custom-node-end'].indexOf(
          form.type
        ) > -1 ||
          form.type.startsWith('custom-edge')) &&
        form.properties.condition === 'topic'
      "
      label="主题"
      prop="properties.topic"
      :rules="{
        required: true,
        message: '主题不能为空',
        trigger: 'blur'
      }"
    >
      <el-alert type="success" :closable="false">
        <template #default>
          注意：自动处理生成的结果会使用 auto_result
          作为字段名加入节点或者连线的表单，所以添加表单字段时注意不要重名<br />
          如果选择使用主题，这里其实是让 java 后端的某个 spring bean
          去处理业务，至于要怎么处理是后端写的，由业务而定；<br />
          多个主题，用英文逗号“,”隔开，并且，执行的时候会按顺序执行;多个主题，只要有一个返回
          false，就会被视为整体结果为 false
        </template>
      </el-alert>
      <el-input
        v-model="form.properties.topic"
        :maxlength="50"
        placeholder="请确保后端有订阅了这个主题的服务"
        show-word-limit
      />
    </el-form-item>
    <!-- 只有是结束节点才判断节点的正确性 -->
    <el-form-item
      v-if="form.type === 'custom-node-end'"
      label="是否正确节点"
      prop="properties.success"
    >
      <el-switch v-model="form.properties.success" />
    </el-form-item>
    <!-- 只有是结束节点才判断节点的正确性 -->
    <el-form-item label="是否激活" prop="properties.isActivated">
      <!-- 注意,这里不应该可以直接设置激活状态,仅供测试用 -->
      <el-switch v-model="form.properties.isActivated" />
      <el-alert
        type="warning"
        description="注意,这里不应该可以直接设置激活状态,仅供测试用"
        :closable="false"
      />
    </el-form-item>

    <el-form-item
      v-if="['custom-node-start', 'custom-node-user'].indexOf(form.type) > -1"
      label="绑定表单"
      prop="properties.formBind"
    >
      <el-select
        v-model="form.properties.formBind"
        placeholder="绑定表单"
        style="width: 240px"
        clearable
        filterable
      >
        <el-option
          v-for="item in formBindChoseList"
          :key="item.key"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="['custom-node-start', 'custom-node-user'].indexOf(form.type) > -1"
      label="表单字段"
      ><el-button @click="addFormItem()">添加字段</el-button>
    </el-form-item>
    <div
      v-if="['custom-node-start', 'custom-node-user'].indexOf(form.type) > -1"
      ref="dynamicFormFieldBox"
      class="dynamic-form-field-box"
    >
      <el-form-item
        v-for="(field, index) in form.properties.fields"
        :key="field.key"
        :label="field.title"
        :prop="`properties.fields[${index}]`"
        :rules="{
          required: true,
          validator: validateDynamicField
        }"
      >
        <el-select
          v-model="field.type"
          collapse-tags
          collapse-tags-tooltip
          placeholder="字段类型"
          class="form-inline-group"
          @change="
            field.value = field.type === 'DICT' ? '[CODE][VALUE]' : undefined
          "
        >
          <el-option label="字符串" value="STRING" />
          <el-option label="长文本" value="TEXT" />
          <el-option label="数字" value="NUMBER" />
          <el-option label="布尔" value="BOOLEAN" />
          <el-option label="日期" value="DATE_TIME" />
          <el-option label="字典" value="DICT" />
          <el-option label="文件" value="FILE" />
        </el-select>
        <el-input
          v-model="field.title"
          class="form-inline-group form-inline-group-input"
          clearable
          placeholder="显示标题"
        />
        <el-input
          v-model="field.name"
          class="form-inline-group form-inline-group-input"
          clearable
          placeholder="字段名"
        />
        <el-button
          v-show="!form.readonly"
          class="mt-2"
          type="danger"
          size="small"
          @click.prevent="removeFormItem(index)"
          ><Icon icon="ep:delete" class="mr-5px" />删除</el-button
        >
        <el-input
          v-model="field.sort"
          class="form-inline-group"
          clearable
          :type="'number'"
          placeholder="排序"
          @blur="fieldSort"
        />
        <el-switch
          v-model="field.readonly"
          size="large"
          class="mb-2 form-inline-group form-inline-group-switch"
          inline-prompt
          active-text="只读"
          inactive-text="读写"
        />
        <el-switch
          v-model="field.disabled"
          size="large"
          class="mb-2 form-inline-group form-inline-group-switch"
          inline-prompt
          active-text="禁用"
          inactive-text="可用"
        />
        <el-switch
          v-model="field.hidden"
          size="large"
          class="mb-2 form-inline-group form-inline-group-switch"
          inline-prompt
          active-text="隐藏"
          inactive-text="显示"
        />
        <el-switch
          v-model="field.required"
          size="large"
          class="mb-2 form-inline-group form-inline-group-switch"
          inline-prompt
          active-text="非空"
          inactive-text="可空"
        />
        <el-select
          v-model="field.components"
          collapse-tags
          collapse-tags-tooltip
          clearable
          placeholder="绑定组件"
          class="form-inline-group"
        >
          <el-option
            v-for="item in componentsChoseList"
            :key="item.key"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-if="field.type === 'FILE'"
          v-model="field.accept"
          class="form-inline-group form-inline-group-input"
          clearable
          placeholder="类型"
        />
        <el-switch
          v-if="field.type === 'FILE'"
          v-model="field.multiple"
          size="large"
          class="mb-2 form-inline-group form-inline-group-switch"
          inline-prompt
          active-text="多"
          inactive-text="单"
        />
        <el-input
          v-model="field.placeholder"
          clearable
          placeholder="设置占位提示"
        />
        <el-alert
          type="success"
          :description="`key:${field.key}`"
          :closable="false"
        />
        <el-alert
          v-if="field.type === 'DICT'"
          type="success"
          description="字典的格式为: [字典code][字典默认选项]"
          :closable="false"
        />
        <el-alert v-if="field.type === 'FILE'" type="success" :closable="false">
          <template #default>
            点击查看[<a
              href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept"
              target="_blank"
              >文件类型</a
            >]，这里要注意，如果是文件类型，这里不能设置默认值，只能展示看看选择的时候的效果
          </template>
        </el-alert>
        <el-switch
          v-if="field.type === 'BOOLEAN'"
          v-model="field.value"
          size="large"
          active-text="true"
          inactive-text="false"
        />
        <el-date-picker
          v-else-if="field.type === 'DATE_TIME'"
          v-model="field.value"
          type="datetime"
          :placeholder="field.placeholder || '注意,这里的值只能是默认值'"
        />
        <el-input
          v-else-if="field.type === 'FILE'"
          v-model="field.value"
          :type="chooseInputType(field.type)"
          :accept="field.accept ?? ''"
          :multiple="field.multiple ?? false"
        />
        <el-input
          v-else
          v-model="field.value"
          :type="chooseInputType(field.type)"
          :placeholder="field.placeholder || '注意,这里的值只能是默认值'"
        />
      </el-form-item>
    </div>
    <el-form-item label="备注说明" prop="properties.documentation">
      <el-input v-model="form.properties.documentation" type="textarea" />
    </el-form-item>
    <el-form-item v-show="!form.readonly">
      <el-button type="primary" @click="onSubmit(formRef)">提交</el-button>
      <el-button type="warning" @click="resetForm(formRef)">重置</el-button>
      <el-button @click="drawerDetail = false">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<style lang="scss" scoped>
#logic-flow-dynamic-form {
  $inline-input-width: 110px;

  .dynamic-form-field-box {
    max-height: 500px;
    overflow-y: auto;
  }

  .form-inline-group {
    width: $inline-input-width;
    margin: 0 3px -3px 0;
  }

  .form-inline-group.form-inline-group-switch {
    --el-switch-on-color: #ff4949;
    --el-switch-off-color: #13ce66;

    width: calc($inline-input-width / 2);
    margin: 0 5px;
  }

  .form-inline-group.form-inline-group-input {
    width: 190px;
  }
}
</style>
