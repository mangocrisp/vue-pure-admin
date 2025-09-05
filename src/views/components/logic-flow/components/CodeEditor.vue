<script lang="ts">
export default {
  name: "CodeEditor"
};
</script>
<script lang="ts" setup>
import { nextTick, ref, onBeforeUnmount } from "vue";
import * as monaco from "monaco-editor";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

let editor: monaco.editor.IStandaloneCodeEditor;

const language = ref("json");

const containerRef = ref(null);

//
// MonacoEditor start
//
onBeforeUnmount(() => {
  editor.dispose();
});

const editorInit = () => {
  nextTick(() => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true
    });
    !editor
      ? (editor = monaco.editor.create(containerRef.value!, {
          value: "", // 编辑器初始显示文字
          language: "json", // 语言支持自行查阅demo
          automaticLayout: true, // 自适应布局
          //theme: 'vs-dark', // 官方自带三种主题 vs, hc-black, or vs-dark
          foldingStrategy: "indentation",
          renderLineHighlight: "all", // 行亮
          selectOnLineNumbers: true, // 显示行号json
          overviewRulerBorder: false // 不要滚动条的边框
        }))
      : editor.setValue("");
    // console.log(editor)
    // 监听值的变化
    editor.onDidChangeModelContent((val: any) => {
      // text.value = editor.getValue()
    });
  });
};

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (["typescript", "javascript"].includes(label)) {
      return new tsWorker();
    }
    return new EditorWorker();
  }
};
// @ts-ignore
//切换语言
const changeLanguage = () => {
  monaco.editor.setModelLanguage(editor.getModel()!, language.value);
};

editorInit();

// 清除
const render = val => {
  // 因为 readOnly 状态下不能进行格式化,这里先改成可写
  editor.updateOptions({ readOnly: false });
  // 数据越长,加载越久
  let timeOut = val.length > 5000 ? (val.length / 500 / 10) * 500 : 500;
  editor.setValue(val);
  editor.trigger("anyString", "editor.action.formatDocument", null); //自动格式化代码
  editor.setValue(editor.getValue()); //再次设置
  // 然后这里要一个异步的去设置回只读,因为格式化的过程需要时间,如果马上设置成只读就不能格式化
  setTimeout(() => {
    editor.updateOptions({ readOnly: true });
  }, timeOut);
};
// 暴露子组件的方法给父组件使用
defineExpose({
  render
});
</script>
<template>
  <div class="e-box">
    <div class="select">
      <el-select v-model="language" @change="changeLanguage">
        <el-option value="json">json</el-option>
        <el-option value="html">html</el-option>
        <el-option value="css">css</el-option>
        <el-option value="javascript">javascript</el-option>
        <el-option value="typescript">typescript</el-option>
      </el-select>
    </div>
    <div id="container" ref="containerRef" />
  </div>
</template>
<style scoped lang="scss">
.e-box {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 10px;

  .select {
    padding: 10px 0;
  }

  #container {
    height: 100%;
    border: 1px solid #ccc;
  }
}
</style>
