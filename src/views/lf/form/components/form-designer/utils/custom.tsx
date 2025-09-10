import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { deviceDetection } from "@pureadmin/utils";
import { ElMessageBox } from "element-plus";
import { defineAsyncComponent, h, ref } from "vue";
import { useFormCostumComponents } from "@/views/lf/form/components/form-designer/utils/costumComponents";
import formCreate from "@form-create/element-ui";
import SystemDeptApi from "@/api/system/dept";

// 加载自定义组件
const { loadCostumComponents } = useFormCostumComponents(null);
loadCostumComponents();

/**动态表单创建渲染器 */
const FormCreateCreator = defineAsyncComponent(
  () => import("@/views/components/form-create/form-creator/index.vue")
);
const FormCreateCreatorRef = ref<InstanceType<typeof FormCreateCreator> | null>(
  null
);

/**
 * 因为定义了一些自定义的表单组件，这些组件里面的规则需要动态的修改，比如一些调用后端数据的方法，需要动态的设置进去
 * @param rule 表单规则
 */
export const logicFlowFormRuleEnhance = (rule: string): any => {
  if (!rule) {
    return [];
  }
  const ruleJSON = formCreate.parseJson(rule);
  if (ruleJSON && ruleJSON.length > 0) {
    ruleJSON.forEach(item => {
      // 针对不同类型的自定义组件，可以在这里做一些自定义的处理，比如这个部门用户选择组件，需要设置 api 接口去获取数据
      if (item.type === "LfFormDeptSelector") {
        // 用户部门选择器
        item.props["api"] = {
          deptUserTree: SystemDeptApi.deptUserTree,
          deptUserTreeByCondition: SystemDeptApi.deptUserTreeByCondition
        };
      }
    });
  }
  console.log(ruleJSON);
  return ruleJSON;
};

/**
 * 预览动态表单
 * @param rule 规则
 * @param options 配置选项
 */
export const logicFlowFormPreview = (rule: string, options: string) => {
  const ruleJSON = logicFlowFormRuleEnhance(rule);
  const optionsJSON = formCreate.parseJson(options);
  console.log(ruleJSON);
  console.log(optionsJSON);
  addDialog({
    title: `表单预览`,
    props: {
      isAddForm: false,
      rule: ruleJSON,
      options: {
        ...optionsJSON,
        ...{ submitBtn: false, resetBtn: false }
      },
      modelValue: {}
    },
    width: "50%",
    draggable: true,
    fullscreen: deviceDetection(),
    fullscreenIcon: true,
    closeOnClickModal: false,
    resetForm: () => FormCreateCreatorRef.value.resetForm(),
    contentRenderer: () =>
      h(FormCreateCreator, { ref: FormCreateCreatorRef, formData: null }),
    beforeSure: (done, {}) => {
      const ApiRef = FormCreateCreatorRef.value.getApiRef();
      function chores() {
        message(`操作成功`, {
          type: "success"
        });
        done(); // 关闭弹框
        //onSearch(); // 刷新表格数据
      }
      ApiRef.validate((valid, fail) => {
        if (valid === true) {
          // 实际开发先调用新增接口，再进行下面操作
          const formData = ApiRef.formData();
          ElMessageBox.alert(formData, "表单提交结果");
          console.log(formData);
          chores();
        } else {
          console.log("表单验证未通过", fail);
        }
      })
        .then(() => {
          //推荐
          console.log("Promise resolved: 表单验证通过");
        })
        .catch(() => {
          console.log("Promise rejected: 表单验证未通过");
        });
    }
  });
};
