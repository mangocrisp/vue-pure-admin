<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { format as sqlFormatter } from "sql-formatter";

defineOptions({
  name: "CodeEditor"
});

// 定义从父组件接收的属性
const props = defineProps({
  options: {
    type: Object,
    default: () => ({
      theme: "dark"
    })
  },
  value: {
    type: String
  }
});

const language = ref("text");

const editorRef = ref(null);

const emits = defineEmits(["change"]);

let editor: monaco.editor.IStandaloneCodeEditor;
//初始化
const init = () => {
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
      ? (editor = monaco.editor.create(editorRef.value!, {
          value: props.value, //值
          // value: 'SELECT * FROM TABLE_NAME WHERE UPDATE_TIME > ?', //值
          //wordBasedSuggestions: true, // 基于单词的自动完成
          //autoIndex: true, // 控制是否开启自动索引。当开启时，编辑器会自动创建索引以加速搜索和语义高亮。
          fontSize: 14, // 字体大小
          language: language.value, //语言
          theme: props.options.theme, //主题
          foldingStrategy: "indentation",
          renderLineHighlight: "all", // 行亮
          selectOnLineNumbers: true, // 显示行号json
          readOnly: false, // 是否只读
          overviewRulerBorder: false, // 滚动是否有边框
          cursorSmoothCaretAnimation: "on", // 控制光标平滑动画的开启与关闭。当开启时，光标移动会有平滑的动画效果。
          formatOnPaste: true, //设置是否在粘贴文本时自动格式化代码
          mouseWheelZoom: true, //设置是否开启鼠标滚轮缩放功能
          folding: true, //控制是否开启代码折叠功能
          automaticLayout: true, // 控制编辑器是否自动调整布局以适应容器大小的变化
          minimap: {
            // 关闭代码缩略图
            enabled: false // 是否启用预览图
          },
          scrollBeyondLastLine: false, // 禁用额外滚动区
          scrollbar: {
            verticalScrollbarSize: 2, // 垂直滚动条宽度，默认px
            horizontalScrollbarSize: 2 // 水平滚动条高度
          },
          glyphMargin: true, //字形边缘
          wordWrap: "on", // 开启自动换行
          ...props.options
        }))
      : editor.setValue("");
    // 监听编辑器内容变化
    editor.onDidChangeModelContent(() => {
      const value = getValue();
      // 更新父组件的值
      emits("change", value);
    });

    /**
     * 添加右键格式化菜单
     */
    // 用于控制切换该菜单键的显示
    const shouldShowSqlRunnerAction = editor.createContextKey(
      "shouldShowSqlRunnerAction",
      true
    );
    // 前面已经定义了 editor
    // 添加 action
    editor.addAction({
      // id
      id: "code-format",
      // 该菜单键显示文本
      label: "Format (Manual)",
      // 控制该菜单键显示
      precondition: "shouldShowSqlRunnerAction",
      // 该菜单键位置
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      // 点击该菜单键后运行
      run: event => {
        // 格式化代码
        if (language.value === "sql") {
          editor.setValue(sqlFormatter(editor.getValue()));
          return;
        }
        editor.trigger("anyString", "editor.action.formatDocument", null); //自动格式化代码
        editor.setValue(editor.getValue()); //再次设置
      }
    });
    // 显示
    shouldShowSqlRunnerAction.set(true);
  });
};

//解决 Monaco Editor 无法正确加载其所需的 Web Worker
self.MonacoEnvironment = {
  getWorker(workerId, label) {
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
    return new editorWorker();
  }
};

// 切换语言
const changeLanguage = () => {
  monaco.editor.setModelLanguage(editor.getModel()!, language.value);
};

//获取编辑器的内容
const getValue = () => {
  return editor.getValue();
};

// 组件挂载后创建编辑器实例
onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  if (editor) {
    // 组件卸载前销毁编辑器实例
    editor.dispose();
  }
});

// 清除
const render = (val, l = "text") => {
  language.value = l;
  if (val) {
    if (language.value === "sql") {
      editor.setValue(sqlFormatter(val));
      return;
    }
  }
  changeLanguage();
  setTimeout(() => {
    editor.setValue(val);
    editor.trigger("anyString", "editor.action.formatDocument", null); //自动格式化代码
    editor.setValue(editor.getValue()); //再次设置
  }, 50);
};

// 暴露子组件的方法给父组件使用
defineExpose({
  render,
  getValue
});
</script>
<template>
  <div class="e-box">
    <div class="select">
      <select v-model="language" @change="changeLanguage">
        <option value="text">TEXT</option>
        <option value="json">JSON</option>
        <option value="xml">XML</option>
        <option value="yaml">YAML</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="java">JAVA</option>
        <option value="sql">SQL</option>
      </select>
    </div>
    <div id="monacoEditor" ref="editorRef" class="monaco-editor" />
  </div>
</template>
<style lang="scss" scoped>
.monaco-editor {
  width: 100%;
  height: 300px;
}

.select {
  margin-bottom: 10px;
  margin-left: 50px;

  select {
    border: 1px #ccc solid;
  }
}
</style>
