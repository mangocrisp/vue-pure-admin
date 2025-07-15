import type { OptionsType } from "@/components/ReSegmented";

const menuTypeOptions: Array<OptionsType> = [
  {
    label: "菜单",
    value: 0
  },
  {
    label: "iframe",
    value: 1
  },
  {
    label: "外链",
    value: 2
  },
  {
    label: "按钮",
    value: 3
  }
];

const outLinkOptionOptions: Array<OptionsType> = [
  {
    label: "是",
    tip: "外链菜单将打开一个新窗口",
    value: true
  },
  {
    label: "否",
    tip: "外链菜单将打开当前页面",
    value: false
  }
];

const menuStatusOptions: Array<OptionsType> = [
  {
    label: "启用",
    tip: "启用后，该菜单将显示在菜单栏",
    value: true
  },
  {
    label: "禁用",
    tip: "禁用后，该菜单将不会显示在菜单栏",
    value: false
  }
];

const showLinkOptions: Array<OptionsType> = [
  {
    label: "显示",
    tip: "会在菜单中显示",
    value: false
  },
  {
    label: "隐藏",
    tip: "不会在菜单中显示",
    value: true
  }
];

const fixedTagOptions: Array<OptionsType> = [
  {
    label: "固定",
    tip: "当前菜单名称固定显示在标签页且不可关闭",
    value: true
  },
  {
    label: "不固定",
    tip: "当前菜单名称不固定显示在标签页且可关闭",
    value: false
  }
];

const keepAliveOptions: Array<OptionsType> = [
  {
    label: "缓存",
    tip: "会保存该页面的整体状态，刷新后会清空状态",
    value: true
  },
  {
    label: "不缓存",
    tip: "不会保存该页面的整体状态",
    value: false
  }
];

const hiddenTagOptions: Array<OptionsType> = [
  {
    label: "允许",
    tip: "当前菜单名称或自定义信息允许添加到标签页",
    value: false
  },
  {
    label: "禁止",
    tip: "当前菜单名称或自定义信息禁止添加到标签页",
    value: true
  }
];

const showParentOptions: Array<OptionsType> = [
  {
    label: "显示",
    tip: "会显示父级菜单",
    value: true
  },
  {
    label: "隐藏",
    tip: "不会显示父级菜单",
    value: false
  }
];

const frameLoadingOptions: Array<OptionsType> = [
  {
    label: "开启",
    tip: "有首次加载动画",
    value: true
  },
  {
    label: "关闭",
    tip: "无首次加载动画",
    value: false
  }
];

export {
  menuTypeOptions,
  showLinkOptions,
  fixedTagOptions,
  keepAliveOptions,
  hiddenTagOptions,
  showParentOptions,
  frameLoadingOptions,
  menuStatusOptions,
  outLinkOptionOptions
};
