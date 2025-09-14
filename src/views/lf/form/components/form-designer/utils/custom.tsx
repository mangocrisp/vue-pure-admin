import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { deviceDetection } from "@pureadmin/utils";
import { ElMessageBox } from "element-plus";
import { defineAsyncComponent, h, ref } from "vue";
import { useFormCostumComponents } from "@/views/lf/form/components/form-designer/utils/costumComponents";
import formCreate from "@form-create/element-ui";
import SystemDeptApi from "@/api/system/dept";
import type { LfFormTodoInfoModelValue } from "@/views/lf/form/custom-components/todoInfo/utils/types";
import {
  flowInfoDataSource,
  type flowInfoDataType,
  type logicFlowFormEditType
} from "./types";
import { NodesType } from "@/views/components/logic-flow/types/types";

// 加载自定义组件
const { loadCostumComponents } = useFormCostumComponents(null);
loadCostumComponents();

export const useLfCustomFrom = () => {
  /**
   * 因为定义了一些自定义的表单组件，这些组件里面的规则需要动态的修改，比如一些调用后端数据的方法，需要动态的设置进去
   * @param rule 表单规则
   */
  const logicFlowFormRuleEnhance = (rule: string, readonly = false): any => {
    if (!rule) {
      return [];
    }
    const ruleJSON = formCreate.parseJson(rule);
    if (readonly) {
      return ruleJSON.filter(item => {
        return item.type === "LfFormTodoInfo";
      });
    }
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
    return ruleJSON;
  };

  /**动态表单创建渲染器 */
  const LfFormRender = defineAsyncComponent(
    () => import("@/views/lf/received/components/form-render/index.vue")
  );
  const LfFormRenderRef = ref<InstanceType<typeof LfFormRender> | null>(null);

  /**
   * 生成流程相关信息
   * @returns 生成流程信息
   */
  const generateFlowInfoDf = (
    flowInfoData?: flowInfoDataType
  ): LfFormTodoInfoModelValue => {
    if (!flowInfoData) {
      // 如果没有流程信息数据，则返回一个空的流程信息数据
      return {
        basic: {
          children: []
        },
        records: [],
        infoMap: flowInfoData.infoMap ?? new Map()
      };
    }
    if (flowInfoData.source === flowInfoDataSource.processInitiate) {
      // 如果是开始流程的，流程信息因为还没填写，这里只返回流程图设计给填写的人看，让他知道流程的走向
      // 流程开始
      return {
        flowChart: {
          flowData: flowInfoData.flowData
        },
        basic: {},
        records: [],
        infoMap: flowInfoData.infoMap ?? new Map()
      };
    }
    if (flowInfoData.source === flowInfoDataSource.process) {
      // 运行中的流程
      const basic = { children: [] };
      const records = [];
      flowInfoData.historyData.forEach(history => {
        const { data, nodeType, action, time, id, userName } = history;
        if (
          nodeType === NodesType.judgment ||
          nodeType === NodesType.group ||
          nodeType === NodesType.service
        ) {
          // 如果是判断节点、分组、和服务节点，则不显示历史记录，因为它没有数据
          return;
        }
        if (data) {
          const { fields } = JSON.parse(data);
          const record = {
            timestamp: time,
            title: action,
            description: "",
            operator: userName ?? "",
            detail: {
              title: "节点信息",
              name: id,
              basic: {
                children: []
              }
            }
          };
          if (fields && fields.length > 0) {
            const children = fields.map(field => ({
              label: field.title,
              value: field.value
            }));
            if (nodeType === NodesType.start) {
              // 找到开始节点，可以得到这个节点的信息
              basic.children = children;
            }
            record.detail.basic.children = children;
          }
          records.push(record);
        }
      });
      return {
        flowChart: {
          flowData: flowInfoData.flowData
        },
        basic,
        records,
        infoMap: flowInfoData.infoMap ?? new Map()
      };
    }
    // 不知道来源的也返回一个空的流程信息数据
    return {
      basic: {
        children: []
      },
      records: [],
      infoMap: flowInfoData.infoMap ?? new Map()
    };
  };

  /**
   * 编辑动态表单
   * @param config 配置
   */
  const logicFlowFormEdit = (config: logicFlowFormEditType) => {
    const ruleJSON = logicFlowFormRuleEnhance(config.rule, config.readonly);
    const optionsJSON = formCreate.parseJson(config.options);
    const flowInfo =
      config.generateFlowInfo?.(config.flowInfoData) ??
      generateFlowInfoDf(config.flowInfoData);
    const modelValue = config.readonly
      ? { flowInfo: flowInfo }
      : {
          ...(config.formData ?? {}),
          ...{ flowInfo: flowInfo }
        };
    addDialog({
      title: config.title ?? "流程表单编辑",
      props: {
        isAddForm: config.isAddForm ?? true,
        rule: ruleJSON,
        options: {
          ...optionsJSON,
          ...{ submitBtn: false, resetBtn: false }
        },
        modelValue
      },
      width: "60%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      resetForm: config.readonly
        ? undefined
        : () => LfFormRenderRef.value.resetForm(),
      contentRenderer: () =>
        h(LfFormRender, { ref: LfFormRenderRef, formData: null }),
      beforeSure: (done, {}) => {
        const ApiRef = LfFormRenderRef.value.getApiRef();
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
            console.log(formData);
            config.onSubmit?.(formData).then(result => {
              if (result) {
                chores();
              }
            });
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

  /**动态表单创建渲染器 */
  const FormCreateCreator = defineAsyncComponent(
    () => import("@/views/components/form-create/form-creator/index.vue")
  );
  const FormCreateCreatorRef = ref<InstanceType<
    typeof FormCreateCreator
  > | null>(null);
  /**
   * 预览动态表单
   * @param rule 规则
   * @param options 配置选项
   */
  const logicFlowFormPreview = (rule: string, options: string) => {
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
  return {
    FormCreateCreator,
    FormCreateCreatorRef,
    logicFlowFormRuleEnhance,
    logicFlowFormPreview,
    logicFlowFormEdit
  };
};
