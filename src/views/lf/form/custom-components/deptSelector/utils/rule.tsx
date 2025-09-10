import SystemDeptApi from "@/api/system/dept";
import { defineAsyncComponent } from "vue";

export const useFormCostumComponentsDeptSelector = () => {
  const LfFormDeptSelector = defineAsyncComponent(
    () => import("@/views/lf/form/custom-components/deptSelector/index.vue")
  );
  /** 待办信息拖拽规则 */
  const LfFormDeptSelectorRule = {
    menu: "business",
    icon: "icon-select",
    label: "部门选择器",
    name: "LfFormDeptSelector",
    intput: false,
    //组件可以配置的事件
    event: ["click"],
    rule() {
      //组件的渲染规则
      return {
        //组件的名称, 与上一步是对应
        type: "LfFormDeptSelector",
        field: "deptUser",
        title: "选择部门",
        info: "可以部门用户一起选，得到的是对应数组",
        props: {
          expandOnClickNode: false,
          checkOnClickNode: false,
          checkStrictly: false,
          height: "400px",
          includeUser: false,
          // 这里设置的方法只能是在拖拽到设计器里面的时候能显示，但是预览的时候或者到了流程进行中的时候还需要手动添加，因为保存到数据库无法把方法也保存了呀
          api: {
            deptUserTree: SystemDeptApi.deptUserTree,
            deptUserTreeByCondition: SystemDeptApi.deptUserTreeByCondition
          }
        }
      };
    },
    props() {
      //组件右侧的配置项,与组件中的 props 对应
      return [
        { type: "switch", field: "includeUser", title: "包含用户" },
        { type: "input", field: "height", title: "高度" },
        {
          type: "number",
          field: "indent",
          value: 30,
          title: "相邻级节点间的水平缩进"
        },
        {
          type: "number",
          field: "itemSize",
          value: 30,
          title: "自定义树节点的高度"
        },
        {
          type: "input",
          field: "icon",
          title: "自定义树节点图标组件"
        }
      ];
    }
  };
  return {
    LfFormDeptSelector,
    LfFormDeptSelectorRule
  };
};
