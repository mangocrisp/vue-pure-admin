<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref, toRefs } from "vue";
import LogicFlow, { EdgeData, NodeData } from "@logicflow/core";
import {
  Menu,
  MiniMap,
  SelectionSelect,
  DndPanel,
  InsertNodeInPolyline,
  Snapshot,
  Group,
  lfJson2Xml,
  lfXml2Json,
  BpmnAdapter
} from "@logicflow/extension";
import { Uuid } from "ts-uuid";
import CodeEditor from "./components/CodeEditor.vue";
import DetailPanel from "./components/DetailPanel.vue";
import {
  ElLoading,
  ElMessage,
  ElMessageBox,
  UploadFile,
  UploadFiles,
  UploadProgressEvent
} from "element-plus";
// 自定义的点
import {
  CustomNodeStart,
  CustomNodUser,
  CustomNodService,
  CustomNodeJudgment,
  CustomNodeEnd
} from "./components/custom-node";
// 自定义的边
import {
  CustomLineEdge,
  CustomBezierEdge,
  CustomPolylineEdge
} from "./components/custom-edge";
// 自定义分组
import CustomGroup from "./components/custom-group";
// 样式
import "@logicflow/core/dist/style/index.css";
import "@logicflow/extension/lib/style/index.css";

import demoData from "./demo-data/demo.json";
import demoGroupData from "./demo-data/demo-group.json";
import demoBigData from "./demo-data/demo-big.json";
import {
  configDndPanelItems,
  configDndPanelReadonlyItems
} from "./components/custom-commmon";
import { alignment, nodeAling, beautify } from "./components/formatter";

const props = defineProps({
  hideDemo: {
    type: Boolean,
    default: false
  }
});

const demoVisible = computed({
  get() {
    return !props.hideDemo;
  },
  set(val: boolean) {}
});

/**
 * 边类型
 */
type edgeTypeOptionItem = {
  key: string;
  label?: string;
  value: string;
};
/**
 * 示例类型
 */
type flowDemoOptionsItem = {
  key: string;
  label?: string;
  value: object;
};
const state = reactive({
  // 画布上的数据
  graphData: JSON.stringify({})
});
const { graphData } = toRefs(state);
/**
 * LogicFlow 对象
 */
let lf: LogicFlow;
/**
 * 容器
 */
const containerRef = ref(null);
/**
 * 是否打开数据抽屉
 */
const drawerDataView = ref<boolean>(false);

/**
 * id 生成器
 */
const idGenerator = () => {
  return Uuid.create().toString().replace(/-/g, "");
};

/**
 * 编辑的数据
 */
const editData = ref<LogicFlowTypes.EditData>({
  id: idGenerator(),
  properties: {},
  text: null,
  type: "none"
});
/**
 * 是否打开节点详情抽屉
 */
const drawerDetail = ref<boolean>(false);
/**
 * 代码编码器
 */
const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null);
/**
 * 节点详情面板
 */
const detailPanelRef = ref<InstanceType<typeof DetailPanel> | null>(null);
/**
 * 框选开启状态
 */
const selectionSelectStatus = ref<boolean>(false);
/**
 * 提示状态
 */
const tipsVisible = ref(false);
/**
 * 是否可以美化
 */
const enableFormatter = ref(true);

/**
 * 线的类型
 */
const edgeTypeOptions = ref<edgeTypeOptionItem[]>([
  {
    key: "custom-edge-polyline",
    label: "折线",
    value: "custom-edge-polyline"
  },
  {
    key: "custom-edge-bezier",
    label: "曲线",
    value: "custom-edge-bezier"
  },
  {
    key: "custom-edge-line",
    label: "直线",
    value: "custom-edge-line"
  }
]);
/**
 * 线的类型 custom-edge-polyline(折线),custom-edge-bezier(曲线),custom-edge-line(直线)
 */
const edgeTypeRef = ref<string>("custom-edge-line");
/**
 * 示例流程
 */
const flowDemoOptions = ref<flowDemoOptionsItem[]>([
  {
    key: "simple-flow",
    label: "简单流程",
    value: demoData
  },
  {
    key: "group-flow",
    label: "分组流程",
    value: demoGroupData
  },
  {
    key: "flow-big",
    label: "复杂流程",
    value: demoBigData
  }
]);
/**
 * 示例流程的引用
 */
const flowDemoRef = ref<object>();
/**
 * 只读模式选择
 */
const readonlyTypeRef = ref<boolean>(false);
/**
 * 数据格式选择
 */
const flowDataTypeBPMNRef = ref<boolean>(false);
/**
 * 查看数据
 */
const showData = () => {
  drawerDataView.value = true;
  const loadingInstance = ElLoading.service({});
  setTimeout(() => {
    const val = JSON.stringify(lf.getGraphData());
    graphData.value = val;
    codeEditorRef.value?.render(val);
    loadingInstance.close();
  }, 500);
};
/**
 * 撤销(上一步)
 */
const undo = () => {
  lf.undo();
};
/**
 * 重做(下一步)
 */
const redo = () => {
  lf.redo();
};
/**
 * 直接输入 JSON 数据查看效果
 */
const inputJSONData = () => {
  ElMessageBox.prompt("请输入 JSON 数据", "输入 JSON 内容显示流程图", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    inputPattern: /[^,:{}\\[\]0-9.\-+Eaeflnr-u \n\r\t]/,
    inputErrorMessage: "JSON 数据格式不正确",
    inputType: "textarea"
  })
    .then(({ value }) => {
      render(JSON.parse(value));
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Input canceled"
      });
    });
};
/**
 * 一键美化
 */
const beautification = () => {
  beautify(lf);
};
/**
 * 导入 json/xml 文件
 * @param response  响应对象
 * @param uploadFile  上传的文件
 * @param uploadFiles  上传的文件列表
 */
const importJSONXMLFile = (
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  console.log(uploadFile);
  const fileReader = new FileReader();
  fileReader.onload = async e => {
    try {
      let result = e.target?.result ?? "";
      if (uploadFile.name.toLocaleLowerCase().endsWith(".json")) {
        render(JSON.parse(result + ""));
      }
      if (uploadFile.name.toLocaleLowerCase().endsWith(".xml")) {
        const jsonData = lfXml2Json(result);
        console.log(jsonData);
        render(jsonData);
      }
    } catch (err) {
      console.log(`load JSON document from file error: ${err}`);
      alert("填充失败，请重新选择文件或手动输入。");
    }
  };
  if (uploadFile.raw) {
    fileReader.readAsText(uploadFile.raw!);
  }
};
/**
 * 清空数据
 */
const clearData = () => {
  lf.clearData();
};
/**
 * 缩放
 * @param size 缩放的比例,比1大就是放大,比1小比0大就是缩小,不能是负数,也可以是 bool 值:true就是放大,false就是缩小
 */
const zoom = (size: boolean | number) => {
  lf.zoom(size);
};
/**
 * 导出图片
 */
const getSnapshot = () => {
  lf.getSnapshot();
};
/**
 * 导出 xml
 */
const exportXmlData = () => {
  // console.log(lf.getGraphData())
  const xml = lfJson2Xml(lf.getGraphData());
  //console.log(xml)
  // const jsonData = lfXml2Json(xml)
  // console.log(jsonData)
  // render(lf.getGraphData())
  const blob = new Blob([xml], { type: "text/xml, application/xml" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.hidden = true;
  a.href = url;
  a.download = "log-flow-" + idGenerator() + ".xml";
  document.body.appendChild(a);
  a.click();

  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    a.remove();
  }, 5);
};
/**
 * 还原
 */
const resetZoom = () => {
  lf.resetZoom();
  lf.focusOn({
    coordinate: {
      x: 0,
      y: 0
    }
  });
};
/**
 * 设置元素的 zIndex
 * @param id 节点 id
 * @param zIndex 置顶或者置底
 */
const setElementZIndex = (id: string, zIndex: number | "top" | "bottom") => {
  lf.setElementZIndex(id, zIndex);
};
/**
 * 开启框选功能,注意,框选功能和拖动画布功能是冲突的,所以,如果要框选就不能拖动
 */
const toggleSelectionSelect = () => {
  if ((selectionSelectStatus.value = !selectionSelectStatus.value)) {
    lf.updateEditConfig({
      stopZoomGraph: true
    });
    lf.extension.selectionSelect.openSelectionSelect();
  } else {
    lf.updateEditConfig({
      stopZoomGraph: false
    });
    lf.extension.selectionSelect.closeSelectionSelect();
  }
};
/**
 * 渲染画布
 * @param data 数据
 */
const render = (data: object) => {
  // 加载数据
  lf.render(data);
};
/**
 * 编辑查看节点数据
 * @param data 节点数据
 */
const editNode = (data: NodeData) => {
  editData.value = {
    id: data.id,
    properties: data.properties,
    text: data.text?.value ?? "",
    type: data.type,
    x: data.x,
    y: data.y,
    readonly: readonlyTypeRef.value
  };
  console.log(data, editData.value);
  drawerDetail.value = true;
};
/**
 * 编辑查看线数据
 * @param data 线数据
 */
const editEdge = (data: EdgeData) => {
  editData.value = {
    id: data.id,
    properties: data.properties,
    text: data.text?.value ?? "",
    type: data.type,
    readonly: readonlyTypeRef.value
  };
  console.log(data, editData.value);
  drawerDetail.value = true;
};
/**
 * 这里提供控制抽屉的开关
 */
provide("drawerDetail", drawerDetail);
/**
 * 提交更新数据
 * @param data 修改后的数据
 */
const updateEdit = (data: LogicFlowTypes.EditData) => {
  if (data?.id) {
    // 这里的判断有点鸡贼了
    if (data.type?.startsWith("custom-node")) {
      const nodeModel = lf.getNodeModelById(data.id);
      // 更新节点文本
      nodeModel.updateText(data.text ?? "");
      // 更新图层顺序
      if (data.zIndex) {
        nodeModel.setZIndex(data.zIndex);
      }
      // 更新 properties
      nodeModel.setProperties(data.properties);
    }
    if (data.type?.startsWith("custom-edge")) {
      const edgeModel = lf.getEdgeModelById(data.id);
      // 更新边文本
      edgeModel.updateText(data.text ?? "");
      // 更新图层顺序
      if (data.zIndex) {
        edgeModel.setZIndex(data.zIndex);
      }
      // 更新 properties
      edgeModel.setProperties(data.properties);
    }
  }
};
/**
 * 关闭前的回调，会暂停 Drawer 的关闭
 * @param done done 用于关闭 Drawer
 */
const handleCloseDetail = (done: () => void) => {
  if (!readonlyTypeRef.value) {
    ElMessageBox.confirm("确定信息是否已经保存?")
      .then(() => {
        done();
      })
      .catch(() => {
        // catch error
      });
  } else {
    done();
  }
};
/**
 * 自定义快捷键
 */
const customShortcuts = () => {
  return [
    {
      keys: ["backspace", "del"],
      callback: () => {
        const elements = lf.getSelectElements(true);
        lf.clearSelectElements();
        elements.edges.forEach(edge => lf.deleteEdge(edge.id!));
        elements.nodes.forEach(node => lf.deleteNode(node.id!));
      }
    },
    // 重做
    {
      keys: ["ctrl + shift + z", "cmd + shift + z"],
      callback: () => redo
    },
    // 保存
    {
      keys: ["ctrl + shift + s", "cmd + shift + s"],
      callback: () => saveData()
    }
  ];
};
/**
 * 注册自定义的按钮
 */
const registerCustomNodes = () => {
  // 开始任务
  lf.register(CustomNodeStart);
  // 用户任务
  lf.register(CustomNodUser);
  // 服务任务
  lf.register(CustomNodService);
  // 判断
  lf.register(CustomNodeJudgment);
  // 结束
  lf.register(CustomNodeEnd);
};
/**
 * 自定义菜单
 */
const customMenu = (): object => {
  return {
    nodeMenu: [
      {
        text: "属性",
        callback: editNode
      },
      {
        text: "编辑文本",
        callback: (node: any) => lf.editText(node.id)
      },
      {
        text: "复制",
        callback: (node: any) => lf.cloneNode(node.id)
      },
      {
        text: "置顶",
        callback: (node: any) => setElementZIndex(`${node.id}`, "top")
      },
      {
        text: "删除",
        callback: (node: any) => lf.deleteNode(node.id)
      }
    ],
    // 线菜单
    edgeMenu: [
      {
        text: "属性",
        callback: editEdge
      },
      {
        text: "删除",
        callback: (edge: any) => lf.deleteEdge(edge.id)
      }
    ],
    // 画布菜单
    graphMenu: [
      {
        text: "查看数据",
        callback: showData
      },
      {
        text: "撤销",
        callback: undo
      },
      {
        text: "重做",
        callback: redo
      },
      {
        text: "清空数据",
        callback: clearData
      }
    ]
  };
};
/**
 * 自定义选区菜单
 */
const customSelectionMenu = (): Array<object> => {
  return [
    {
      text: "删除",
      callback: (data: any) =>
        data?.nodes?.forEach(node => lf.deleteNode(node.id))
    }
  ];
};
/**
 * 美化框选区菜单
 */
const formatterSelectionMenu = (): Array<object> => {
  return [
    {
      text: "删除",
      callback: (data: any) =>
        data?.nodes?.forEach(node => lf.deleteNode(node.id))
    },
    {
      text: "水平顶部对齐",
      callback: (data: any) => alignment(nodeAling.HT, data, lf)
    },
    {
      text: "水平居中对齐",
      callback: (data: any) => alignment(nodeAling.HC, data, lf)
    },
    {
      text: "水平底部对齐",
      callback: (data: any) => alignment(nodeAling.HB, data, lf)
    },
    {
      text: "水平等距对齐",
      callback: (data: any) => alignment(nodeAling.HA, data, lf)
    },
    {
      text: "垂直左对齐",
      callback: (data: any) => alignment(nodeAling.VL, data, lf)
    },
    {
      text: "垂直居中对齐",
      callback: (data: any) => alignment(nodeAling.VC, data, lf)
    },
    {
      text: "垂直右对齐",
      callback: (data: any) => alignment(nodeAling.VR, data, lf)
    },
    {
      text: "垂直等距对齐",
      callback: (data: any) => alignment(nodeAling.VA, data, lf)
    }
  ];
};
/**
 * 只读菜单
 */
const customReadonlyMenu = (): object => {
  return {
    nodeMenu: [
      {
        text: "属性",
        callback: editNode
      }
    ],
    // 线菜单
    edgeMenu: [
      {
        text: "属性",
        callback: editEdge
      }
    ],
    // 画布菜单
    graphMenu: [
      {
        text: "查看数据",
        callback: showData
      }
    ]
  };
};
/**
 * 设置边的类型, 也就是设置在节点直接由用户手动绘制的连线类型。
 * @param type 设置边的类型，内置支持的边类型有 line(直线)、polyline(折线)、bezier(贝塞尔曲线)，默认为折线，用户可以自定义 type 名切换到用户自定义的边
 */
const setDefaultEdgeType = (type: string) => {
  lf.setDefaultEdgeType(type);
  if (type === "custom-edge-line") {
    enableFormatter.value = true;
    lf.extension.menu.setMenuByType({
      type: "lf:defaultSelectionMenu",
      menu: formatterSelectionMenu()
    });
  } else {
    enableFormatter.value = false;
    lf.extension.menu.setMenuByType({
      type: "lf:defaultSelectionMenu",
      menu: customSelectionMenu()
    });
  }
};

/**
 * 设置只读
 * @param readonly 是否只读
 */
const setReadonly = (readonly: boolean) => {
  lf.updateEditConfig({
    isSilentMode: readonly
  });
  readonlyTypeRef.value = readonly;
  // 菜单插件
  lf.extension.menu.setMenuConfig(
    readonly ? customReadonlyMenu() : customMenu()
  );
  // 拖拽面板
  lf.extension.dndPanel.setPatternItems(
    readonly ? configDndPanelReadonlyItems(lf) : configDndPanelItems(lf)
  );
  readonlyTypeRef.value = readonly;
};

/**
 * 检查开始节点
 */
const checkStartNode = (data: any) => {
  if (data.type === "custom-node-start") {
    if (
      lf
        .getGraphData()
        ?.nodes?.filter(node => node.type === "custom-node-start").length > 1
    ) {
      lf.deleteNode(data.id);
    }
  }
};

/**
 * 事件绑定
 */
const bindEvent = () => {
  // 节点缩放
  // lf.on('node:resize', ({ oldNodeSize, newNodeSize }) => {})
  // 鼠标移动到线里面
  // lf.on('edge:mouseenter', ({ data }) => {
  //   lf.openEdgeAnimation(data.id)
  // })
  // // 鼠标从线上离开
  // lf.on('edge:mouseleave', ({ data }) => {
  //   if (!data.properties.isActivated) {
  //     lf.closeEdgeAnimation(data.id)
  //   }
  // })
  // 节点双击
  lf.on("node:dbclick", ({ data }) => editNode(data));
  // 外部拖入节点添加时触发
  lf.on("node:dnd-add", ({ data }) => {
    checkStartNode(data);
  });
  // 节点添加
  lf.on("node:add", ({ data }) => {
    checkStartNode(data);
  });
};
/**
 * 初始化 LogicFLow
 * @param useBPMN 是否使用 BPMN 数据格式
 */
const iniLogicFlow = (useBPMN = false, data = {}) => {
  // 如果要使用 BPMN 数据格式就需要使用 BpmnAdapter 插件
  const plugins = useBPMN
    ? [
        Menu,
        MiniMap,
        SelectionSelect,
        DndPanel,
        InsertNodeInPolyline,
        Snapshot,
        Group,
        BpmnAdapter
      ]
    : [
        Menu,
        MiniMap,
        SelectionSelect,
        DndPanel,
        InsertNodeInPolyline,
        Snapshot,
        Group
      ];
  lf = new LogicFlow({
    container: containerRef.value!,
    // 是否启用节点辅助对齐线
    snapline: true,
    // 是否开启局部渲染功能
    partial: true,
    // 禁止鼠标滚动移动画布
    //stopScrollGraph: true,
    // 禁止缩放画布
    // stopZoomGraph: true,
    // 禁止拖动画布
    //stopMoveGraph: true,
    // 是否允许拖动边的端点来调整连线
    adjustEdgeStartAndEnd: true,
    // 允许节点文本可以拖拽
    nodeTextDraggable: true,
    // 允许边文本可以拖拽
    edgeTextDraggable: true,
    // 线的类型 custom-edge-polyline(折线),custom-edge-bezier(曲线),custom-edge-line(直线)
    edgeType: edgeTypeRef.value,
    // 选按键, 可选 meta(cmd)、shift、alt。 支持组合键点击元素实现多选
    multipleSelectKey: "shift",
    grid: {
      type: "mesh",
      size: 10,
      config: {
        color: "#ddd",
        thickness: 1
      }
    },
    // 快捷键配置
    keyboard: {
      enabled: true,
      // 自定义快捷键
      shortcuts: customShortcuts()
    },
    // 允许节点文本可以编辑
    nodeTextEdit: true,
    // 动画
    animation: true,
    // 自定义创建节点、连线时生成 id 规则
    idGenerator: idGenerator,
    // 节点拖动靠近画布边缘时是否自动扩充画布, 默认 true。 注意，如果出现拖动节点到某个位置画布就不停滚动的问题，是因为初始化画布的时候宽高有问题。如果画布宽高不定，建议关闭 autoExpand
    autoExpand: true,
    // 元素重合的堆叠模式，默认为连线在下、节点在上，选中元素在最上面。可以设置为 1，表示自增模式（作图工具场景常用）
    // overlapMode: 1,
    // 注册组件
    plugins: plugins
  });
  registerCustomNodes();
  // 注册自定义的边
  lf.register(CustomLineEdge);
  lf.register(CustomPolylineEdge);
  lf.register(CustomBezierEdge);
  // 注册自定义分组
  lf.register(CustomGroup);
  render(data);
  // 菜单插件
  lf.extension.menu.setMenuConfig(customMenu());
  lf.extension.menu.setMenuByType({
    type: "lf:defaultSelectionMenu",
    menu: formatterSelectionMenu()
  });
  resetZoom();
  // 显示小地图
  lf.extension.miniMap.show();
  // 拖拽面板
  lf.extension.dndPanel.setPatternItems(configDndPanelItems(lf));
  bindEvent();
};

// 初始化
onMounted(() => {
  iniLogicFlow();
});
// 暴露子组件的方法给父组件使用
defineExpose({
  iniLogicFlow,
  render,
  setReadonly
});

/**
 * 定义钩子
 */
const emit = defineEmits<{
  /**当数据发生改变时触发 */
  (e: "save", value: string): void;
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
 * 远程方法调用
 * @param forWhat 什么方法
 * @param value 数据
 */
const remoteMethod = ({ forWhat, value }) => {
  emit("remoteMethod", { forWhat, value });
};

/**
 * 保存数据
 */
const saveData = () => {
  if (!readonlyTypeRef.value) {
    emit("save", JSON.stringify(lf.getGraphData()));
  }
};
</script>
<template>
  <div id="flow-box">
    <el-button-group class="tool-bar">
      <el-popover
        :visible="tipsVisible"
        placement="bottom"
        :width="280"
        class="tipe-operate"
        popper-style="z-index: 2005"
      >
        <p>
          <label>复制节点:[cmd + c 或 ctrl + c]</label>
          <br />
          <label>粘贴节点:[cmd + v 或 ctrl + v]</label>
          <br />
          <label>撤销操作:[cmd + z 或 ctrl + z]</label>
          <br />
          <label>回退操作:[cmd + y 或 ctrl + y]</label>
          <br />
          <label>保存数据:[cmd + shift + s 或 ctrl + shift + s]</label>
          <br />
          <label>删除操作:[del 或 backspace]</label>
          <br />
          <label>按住 ctrl 键滚动鼠标滚轮可以缩放画布</label>
          <br />
          <label>按住 shift 可以多选</label>
          <br />
          <label>一键美化和对齐功能仅直线模式可用</label>
        </p>
        <template #reference>
          <el-button
            v-show="!readonlyTypeRef"
            @click="tipsVisible = !tipsVisible"
            >操作提示</el-button
          >
        </template>
      </el-popover>
      <el-button
        v-show="!readonlyTypeRef"
        :type="selectionSelectStatus ? 'warning' : 'default'"
        @click="toggleSelectionSelect()"
        >{{ selectionSelectStatus ? "取消框选" : "框选" }}</el-button
      >
      <el-button @click="zoom(true)">放大</el-button>
      <el-button @click="zoom(false)">缩小</el-button>
      <el-button @click="resetZoom()">定位还原</el-button>
      <el-button v-show="!readonlyTypeRef" @click="undo()">撤销</el-button>
      <el-button v-show="!readonlyTypeRef" @click="redo()">重做</el-button>
      <el-button v-show="!readonlyTypeRef" @click="inputJSONData()"
        >输入(JSON)数据</el-button
      >
      <el-button
        v-show="!readonlyTypeRef"
        :disabled="!enableFormatter"
        @click="beautification()"
        >一键美化</el-button
      >
      <el-button @click="getSnapshot()">下载图片</el-button>
      <el-button @click="exportXmlData()">导出xml</el-button>
      <el-button @click="showData()">查看数据</el-button>
      <el-button v-show="!readonlyTypeRef" @click="saveData()"
        >保存数据(ctrl+shift+s)</el-button
      >
    </el-button-group>
    <el-upload
      v-show="!readonlyTypeRef && !flowDataTypeBPMNRef"
      class="button-upload"
      accept="application/json, text/xml, application/xml"
      :auto-upload="false"
      :limit="3"
      :show-file-list="false"
      @change="importJSONXMLFile"
    >
      <el-button type="primary">导入JSON/XML文件(暂不支持 xml)</el-button>
    </el-upload>
    <el-select
      v-show="!readonlyTypeRef"
      v-model="edgeTypeRef"
      class="edge-type-selector"
      placeholder="select"
      @change="setDefaultEdgeType"
    >
      <el-option
        v-for="item in edgeTypeOptions"
        :key="item.key"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      v-show="demoVisible"
      v-model="flowDemoRef"
      class="demo-flow-selector"
      placeholder="选择示例流程"
      @change="render"
    >
      <el-option
        v-for="item in flowDemoOptions"
        :key="item.key"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-switch
      v-show="demoVisible"
      v-model="readonlyTypeRef"
      class="readonly-type-switch"
      active-text="只读"
      inactive-text="读写"
      @change="(val: boolean) => setReadonly(val)"
    />

    <el-switch
      v-show="!readonlyTypeRef"
      v-model="flowDataTypeBPMNRef"
      class="flow-data-type-switch"
      active-text="BPMN(可以导入/出 xml)"
      inactive-text="JSON(不能使用 xml 入/出)"
      disabled
      @change="(val: boolean) => iniLogicFlow(val)"
    />
    <div ref="containerRef" class="flow-container" />
    <el-drawer
      v-model="drawerDataView"
      title="查看数据"
      :with-header="true"
      :show-close="false"
      :size="'50%'"
      :z-index="2008"
    >
      <CodeEditor ref="codeEditorRef" />
    </el-drawer>
    <el-drawer
      v-model="drawerDetail"
      :close-on-click-modal="readonlyTypeRef"
      :title="`查看/修改节点[${editData.text}]属性`"
      :with-header="true"
      :show-close="true"
      :size="'40%'"
      :z-index="2008"
      :before-close="handleCloseDetail"
    >
      <DetailPanel
        ref="detailPanelRef"
        :node-data="editData"
        @change="updateEdit"
        @remoteMethod="remoteMethod"
      />
    </el-drawer>
  </div>
</template>
<style lang="scss">
@use "./assets/style/logic-flow-global";
</style>
<style lang="scss" scoped>
@use "./assets/style/logic-flow";
</style>
