<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import OnlineDocApi from "@/api/online-doc/online-doc";
import { useUserStoreHook } from "@/store/modules/user";
import { AnyObject } from "@/hooks/types/util";
import { Uuid } from "ts-uuid";
import { isArray } from "@pureadmin/utils";
import {
  Plus,
  Search,
  User,
  OfficeBuilding,
  CirclePlusFilled,
  Position,
  FullScreen
} from "@element-plus/icons-vue";

defineOptions({
  name: "OnlineDocList"
});
const router = useRouter();

const form = reactive<OnlineDocType.OnlineDocQueryDTO>({
  /** 关键字搜索 */
  keyWords: undefined
});

const list = ref<OnlineDocType.OnlineDoc[]>([]);

const pageParam = reactive<
  OnlineDocType.OnlineDocQueryBody & BaseApi.SqlPageParams
>({
  onlineDocQueryDTO: form,
  pageNum: 1,
  pageSize: 10
});

const loading = ref(false);

const setLoading = (value: boolean) => (loading.value = value);

/** 条数（异步获取） */
const totalRef = ref<number>(10);

/** 查询参数是否有变动，如果没有变动过就不需要去重复的查询面面的总数 */
const queryFormChangedRef = ref<boolean>(true);

/** 新增、修改弹窗 */
const OnlineDocEdit = defineAsyncComponent(() => import("./form.vue"));

/** 新增、修改弹窗显隐 */
const dialogVisible = ref(false);

/** 新增、修改弹窗 Ref */
const OnlineDocEditRef = ref<InstanceType<typeof OnlineDocEdit> | null>();

/** 查询参数 from Ref */
const queryFormRef = ref(null);
/** 能否导入当前文档 */
const canImportThatDoc = ref(false);

const loadList = async () => {
  try {
    loading.value = true;
    const { data } = await OnlineDocApi.page(pageParam);
    list.value = data.records;
    totalRef.value = data.total;
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
};

const resetParams = () => {
  // 清空列表数组
  list.value.length = 0;
  // 重置分页参数
  pageParam.pageNum = 1;
  pageParam.pageSize = 10;
};

type resetFnType = ((...args: any) => any) | ((...args: any) => any)[];

// 重置分页后查询(注意这里没有重置form表单参数)
const reloadList = (resetFn?: resetFnType) => {
  // 重置form表单参数
  // 由外部传入方法, 可用于重置表单或者列表勾选项
  // 例子 reloadList(resetForm) 或多方法 reloadList([resetForm, clearSelectionRows])
  if (resetFn) {
    if (isArray(resetFn)) resetFn.forEach(fn => fn());
    else resetFn();
  }
  // 重置分页参数
  resetParams();
  // 查询列表
  loadList();
};

const onPageSizeChange = (size: number) => {
  pageParam.pageNum = 1;
  pageParam.pageSize = size;
  loadList();
};
const onCurrentChange = (current: number) => {
  pageParam.pageNum = current;
  loadList();
};

/**
 * 列表修改按钮点击事件
 * @param data 被选中的行数据
 */
const handleUpdate = async (data: OnlineDocType.OnlineDoc) => {
  dialogVisible.value = true;
  const { data: detail } = await OnlineDocApi.detail(data.id);
  OnlineDocEditRef.value?.initUpdateForm(detail);
};

/**
 * 列表删除事件
 * @param data 选中的行数据
 */
const handleDel = (data: OnlineDocType.OnlineDoc) => {
  ElMessageBox.confirm("确认删除？", "注意", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "error"
  }).then(async () => {
    setLoading(true);
    try {
      const { message } = await OnlineDocApi.remove(data.id);
      ElMessage.success(message);
      reloadList();
      totalFn();
    } catch (error) {
      console.error("error =>", error);
    } finally {
      setLoading(false);
    }
  });
};

/** 查询总数的方法 */
const totalFn = async () => {
  if (queryFormChangedRef.value) {
    const { data } = await OnlineDocApi.total(pageParam);
    totalRef.value = Number(data);
    queryFormChangedRef.value = false;
  }
};

/** 选中的行 */
const formChoosedRowRef = ref<OnlineDocType.OnlineDoc>(null);
/** 选中行的数据 */
const formChoosedRowDataRef = ref<AnyObject>();

const formTableRef = ref(null);

/**
 * 表单点击
 * @param row 表单数据
 */
const chooseFormData = async (row: OnlineDocType.OnlineDoc) => {
  formChoosedRowRef.value = row;
  const { data: detail } = await OnlineDocApi.detail(
    formChoosedRowRef.value.id
  );
  openInEditor(detail);
  // 只能是当前文档的创建人，或者说是管理员才能导入当前文档
  canImportThatDoc.value = row.createUser === userStore.id || row.isAdmin === 1;
};

/**
 * 导入当前表单
 */
const importCurrentForm = () => {
  dialogVisible.value = true;
  if (formChoosedRowRef.value?.name) {
    OnlineDocEditRef.value?.setChooseCurrentForm(formChoosedRowRef.value.name);
    OnlineDocEditRef.value?.searchFormName(formChoosedRowRef.value.name, () => {
      if (formChoosedRowRef.value?.name) {
        OnlineDocEditRef.value?.searchFormNameChangeHandle(
          formChoosedRowRef.value?.name
        );
      }
    });
  }
};

const editReload = (data: OnlineDocType.OnlineDoc) => {
  reloadList();
  totalFn();
  setTimeout(async () => {
    if (data) {
      const { data: detail } = await OnlineDocApi.detail(data.id);
      formChoosedRowRef.value = detail;
      openInEditor(detail);
    }
  }, 1000);
};

// ############# onlyoffice

const userStore = useUserStoreHook();

const onlyOfficeResourceUrl = ref("");
const onlyOfficeServerUrl = ref("");
const isCertificateTrusted = ref(false);

onlyOfficeResourceUrl.value = import.meta.env.VITE_ONLY_OFFICE_RESOURCE_URL;
onlyOfficeServerUrl.value = import.meta.env.VITE_ONLY_OFFICE_SERVER_URL;

/** 文件静态资源地址 */
const adminFileStatics = "/statics";
// const adminFileStatics = "/online-doc/v1/onlineDoc/statics?d=true&path=";

/** 固定配置 */
const constConfig = {
  documentType: "word",
  type: "desktop",
  document: {
    title: "",
    url: "",
    // 当前用户对于当前文档的操作权限
    permissions: {
      download: true, // 用户是否可以下载
      copy: true, // 是否可以复制
      chat: true, // 开启聊天
      comment: true, // 开启评论
      edit: true, // 开启编辑
      print: true // 开启打印
    },
    fileType: "docx", // 文件类型
    // onlyoffice用key做文件缓存索引，推荐每次都随机生成一下，不然总是读取缓存，后面应该是改成关联的文件的数据，例如表单的 id
    key: Uuid.create().toString().replace(/-/g, "")
  },
  editorConfig: {
    // 编辑器常规配置
    customization: {
      // 自动保存可以关闭，常规ctrl+s更好用
      // autosave: false
      // "compactToolbar": true,
      // "forcesave": true,
      toolbarNoTabs: true,
      plugins: false,
      help: false,
      // "compactHeader": true,
      // "hideRightMenu": true,
      logo: {
        // 自定义logo配置
        //   "image": "xxxx",
        //   "imageDark": "xxx",
        //   "url": "xxx",
        visible: false
      }
    },
    mode: "edit", // view为只能浏览  edit为编辑
    // 这个回调及其的重要
    callbackUrl: `${onlyOfficeResourceUrl.value}/online-doc/v1/onlineDoc/callback`,
    // 菜单显示语言
    lang: "zh-CN",
    // 当前操作用户信息
    user: {
      // name: 'superlu',
      // id: '103'
    }
  },
  events: {
    onRequestHistory,
    onRequestHistoryData,
    onRequestHistoryClose
  }
};

function onRequestHistory() {
  if (onlyOfficeEditor.value) {
    if (
      formChoosedRowDataRef.value &&
      formChoosedRowDataRef.value.refreshHistoryDTO
    ) {
      onlyOfficeEditor.value.refreshHistory(
        formChoosedRowDataRef.value.refreshHistoryDTO
      );
    } else {
      onlyOfficeEditor.value.refreshHistory({
        error: "暂无历史版本记录"
      });
    }
  }
}

function onRequestHistoryData(event) {
  const version = event.data;
  if (onlyOfficeEditor.value) {
    if (formChoosedRowDataRef.value) {
      const data = formChoosedRowDataRef.value.historyData.find(
        item => item.version === version
      );
      if (data) {
        console.log("onRequestHistoryData", data);
        onlyOfficeEditor.value.setHistoryData(data);
      }
    }
  }
}
/**
 * 关闭历史记录
 */
function onRequestHistoryClose() {
  if (formChoosedRowRef.value) {
    chooseFormData(formChoosedRowRef.value);
  }
}

const onlyOfficeEditor = ref(null);

const openInEditor = (detail?: OnlineDocType.OnlineDocVO) => {
  if (!detail) {
    if (onlyOfficeEditor.value) {
      onlyOfficeEditor.value.destroyEditor();
    }
    onlyOfficeEditor.value = new DocsAPI.DocEditor("onlyOfficeEditor", {});
    return;
  }

  if (detail.data) {
    formChoosedRowDataRef.value = JSON.parse(detail.data);
    if (formChoosedRowDataRef.value.historyData) {
      formChoosedRowDataRef.value.historyData.forEach(item => {
        item.url = `${onlyOfficeResourceUrl.value}${adminFileStatics}${item.url}`;
        if (item.previous) {
          item.previous.url = `${onlyOfficeResourceUrl.value}${adminFileStatics}${item.previous.url}`;
        }
        item.changesUrl = `${onlyOfficeResourceUrl.value}${adminFileStatics}${item.changesUrl}`;
      });
    }
  }

  const { data: workbookDataStr } = detail;
  if (workbookDataStr) {
    const item = JSON.parse(workbookDataStr);
    const config = { ...constConfig };
    // onlyoffice用key做文件缓存索引，推荐每次都随机生成一下，不然总是读取缓存，后面应该是改成关联的文件的数据，例如表单的 id
    config.documentType = item.documentType;
    config.document.title = item.title;
    config.document.url = `${onlyOfficeResourceUrl.value}${adminFileStatics}${item.url}`;
    console.log(config.document.url);
    config.document.fileType = item.fileType;
    // 因为有缓存的原因，每次的版本要改变，这里直接拿更新时间来做版本号
    config.document.key = `${detail.id}_${new Date(detail.updateTime).getTime()}`;
    config.editorConfig.user = {
      name: userStore.nickname,
      id: userStore.id,
      // image: userStore.avatar,
      group: userStore.deptIds?.[0]
    };

    // 并且把 mode 设置为 view
    config.editorConfig.mode = "view";
    // 如果还是没权限，就把权限设置为默认的全部 false
    config.document.permissions = {
      download: false,
      copy: false,
      chat: false,
      comment: false,
      edit: false,
      print: false
    };
    if (detail.createUser === userStore.id || detail.isAdmin === 1) {
      // 如果是创建人，就是文档的拥有者，是拥有全部权限的
      config.document.permissions = {
        download: true,
        copy: true,
        chat: true,
        comment: true,
        edit: true,
        print: true
      };
      config.editorConfig.mode = "edit";
    } else {
      // 不是当前创建人，就拿权限
      const { onlineDocPermitSet } = detail;
      if (onlineDocPermitSet && onlineDocPermitSet.length > 0) {
        config.editorConfig.mode = "edit";
        // 先拿到用户权限
        const userPermissions = onlineDocPermitSet
          .filter(item => item.userId === userStore.id)
          .filter(item => item.permissions);
        if (userPermissions && userPermissions.length > 0) {
          const { permissions } = userPermissions[0];
          if (permissions && typeof permissions === "string") {
            config.document.permissions = JSON.parse(permissions);
          }
        } else {
          // 如果没有指定到用户再去拿部门权限
          const deptPermissions = onlineDocPermitSet
            .filter(
              item => !item.userId && item.deptId === userStore.deptIds?.[0]
            )
            .filter(item => item.permissions);
          if (deptPermissions && deptPermissions.length > 0) {
            // 如果有部门权限，就直接拿
            const { permissions } = deptPermissions[0];
            if (permissions && typeof permissions === "string") {
              config.document.permissions = JSON.parse(permissions);
            }
          }
        }
      }
    }
    if (onlyOfficeEditor.value) {
      onlyOfficeEditor.value.destroyEditor();
    }
    onlyOfficeEditor.value = new DocsAPI.DocEditor("onlyOfficeEditor", config);
  }
};

/**
 * 手动打开证书
 */
const trustCertificate = () => {
  const newWindow = window.open(onlyOfficeServerUrl.value, "_blank");
  if (newWindow) {
    // 设置定时器检查窗口是否关闭
    const checkInterval = setInterval(async () => {
      if (newWindow.closed) {
        clearInterval(checkInterval);
        // 绑定页面回显事件
        // TODO 刷新当前页面
        const path = router.currentRoute.value.path;
        await nextTick();
        router.replace({ path: `/redirect${path}` });
      }
    }, 500);
  }
};

/**
 * 全屏显示
 */
const fullScreenEditor = () => {
  const onlyofficeView = document.getElementsByClassName("onlyofficeView")[0];
  if (onlyofficeView) {
    if (onlyofficeView.requestFullscreen) {
      onlyofficeView.requestFullscreen();
    } else if ((onlyofficeView as any).webkitRequestFullscreen) {
      // Safari
      (onlyofficeView as any).webkitRequestFullscreen();
    } else if ((onlyofficeView as any).msRequestFullscreen) {
      // IE11
      (onlyofficeView as any).msRequestFullscreen();
    }
  }
};

const fetchResourceWithSslCheck = () => {
  // 尝试发起请求
  fetch(`${onlyOfficeServerUrl.value}welcome/img/favicon.ico`, {
    // 忽略证书验证，仅用于测试，生产环境不建议使用
    mode: "no-cors",
    credentials: "include"
  })
    .then(response => {
      isCertificateTrusted.value = true;
      if (!response.ok) {
        // 如果请求失败，检查是否是证书相关问题
        if (response.status === 0) {
          // console.log('请求失败，可能是SSL证书不受信任。')
        } else {
          // console.log('请求失败，状态码：', response.status)
        }
      }
      // console.log('请求成功，SSL证书似乎被信任（或已忽略验证）')
      // 在这里可以处理响应数据，例如：
      // return response.text().then(data => console.log(data));
    })
    .catch(() => {
      // console.log('请求过程中发生错误：', error)
      ElMessageBox.confirm("文档插件访问失败，是否信任证书？", "提示", {
        confirmButtonText: "去信任",
        cancelButtonText: "取消",
        type: "warning"
      }).then(trustCertificate);
    });
};
/**
 * 加载外部 js
 * @param src js地址
 */
const loadExternalScript = src => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.head.appendChild(script);
  });
};
// ############### onlyoffice

/** 页面加载监听 */
onMounted(async () => {
  loadList();
  totalFn();
  fetchResourceWithSslCheck();
  // 必须放在 ssl 检查后面执行
  await loadExternalScript(
    `${onlyOfficeServerUrl.value}web-apps/apps/api/documents/api.js?time=${new Date().getTime()}`
  );
  setTimeout(() => {
    openInEditor();
  }, 10);
});
</script>

<template>
  <div class="main-view">
    <ElRow :gutter="20">
      <ElCol :span="4">
        <div class="search">
          <div class="import-plus">
            <span class="import-plus-title">表单列表</span>
            <ElButton type="primary" size="small" @click="dialogVisible = true">
              <el-icon><Plus /></el-icon>
            </ElButton>
          </div>

          <ElForm
            ref="queryFormRef"
            :model="form"
            class="query-form"
            inline
            @submit.prevent
          >
            <ElTooltip content="按关键字搜索: 文件名/创建人/部门">
              <ElFormItem class="query-form-item search-gtoup-item">
                <ElInput
                  v-model="form.keyWords"
                  placeholder="文件名/创建人/部门"
                  clearable
                >
                  <template #append>
                    <ElButton
                      type="primary"
                      native-type="submit"
                      @click="
                        reloadList();
                        totalFn();
                      "
                    >
                      <el-icon><Search /></el-icon>
                    </ElButton>
                  </template>
                </ElInput>
              </ElFormItem>
            </ElTooltip>
          </ElForm>
        </div>

        <div class="main">
          <ElTable
            ref="formTableRef"
            v-loading="loading"
            highlight-current-row
            row-key="id"
            :data="list"
            :show-header="false"
            max-height="75vh"
            cell-class-name="no-padding-table-cell"
            @row-click="chooseFormData"
          >
            <!-- 显示列 -->
            <el-table-column prop="name" label="表单名称">
              <template #default="{ row }">
                <ElTooltip :content="row.name" placement="right" :offset="25">
                  <template #content>
                    <p>
                      <el-icon><User /></el-icon>{{ row.createUserName }}
                    </p>
                    <p>
                      <el-icon><OfficeBuilding /></el-icon>{{ row.deptName }}
                    </p>
                  </template>
                  <div style="padding-top: 12px">
                    <ElTag
                      v-if="row.share === 1"
                      type="success"
                      class="share-tag-position"
                    >
                      共享
                    </ElTag>
                    <ElTag v-else type="warning" class="share-tag-position">
                      不共享
                    </ElTag>
                    <ElTag
                      v-show="row.createUser === userStore.id"
                      type="danger"
                      class="permissions-tag-position"
                    >
                      拥有者
                    </ElTag>
                    <ElTag
                      v-show="
                        row.createUser !== userStore.id && row.isAdmin === 1
                      "
                      type="primary"
                      class="permissions-tag-position"
                    >
                      管理员
                    </ElTag>
                    <span class="list-table-column-value ellipsis">{{
                      row.name
                    }}</span>
                  </div>
                </ElTooltip>
              </template>
            </el-table-column>
            <!-- 操作按钮 -->
            <el-table-column
              prop="sort"
              label="操作"
              fixed="right"
              align="center"
              width="20"
            >
              <template #default="{ row }">
                <el-dropdown placement="bottom">
                  <button
                    v-show="
                      row.createUser === userStore.id || row.isAdmin === 1
                    "
                    class="form-operat-button-group"
                  >
                    ...
                  </button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleUpdate(row)">
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-if="row.createUser === userStore.id"
                        @click="handleDel(row)"
                      >
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </ElTable>
          <el-pagination
            v-model:currentPage="pageParam.pageNum"
            class="justify-center"
            :page-size="pageParam.pageSize"
            :total="totalRef"
            :page-sizes="[12, 24, 36]"
            :background="true"
            layout="total, prev, pager, next"
            @size-change="onPageSizeChange"
            @current-change="onCurrentChange"
          />
        </div>
      </ElCol>
      <ElCol :span="20">
        <div class="main">
          <div class="search" style="padding-left: 0">
            <div class="form-data-list-action-bar">
              <ElTooltip v-if="formChoosedRowRef">
                <template #content>
                  <p>
                    创建人：{{ formChoosedRowRef.createUserName }}({{
                      formChoosedRowRef.deptName
                    }})
                  </p>
                  <p>创建时间：{{ formChoosedRowRef.createTime }}</p>
                  <p>最后修改人：{{ formChoosedRowRef.updateUserName }}</p>
                  <p>最后修改时间：{{ formChoosedRowRef.updateTime }}</p>
                </template>
                <span class="form-data-title">{{
                  formChoosedRowRef.name ?? "请选择左侧表单"
                }}</span>
              </ElTooltip>
              <ElButton
                v-show="canImportThatDoc"
                type="primary"
                @click="importCurrentForm"
              >
                <el-icon><CirclePlusFilled /></el-icon> 导入
              </ElButton>
              <ElTooltip
                content="内网环境的 ssl 证书一般是自定义的，所以需要先让浏览器信任该证书，信任证书之后重新打开这个菜单即可"
              >
                <ElButton
                  v-show="!isCertificateTrusted"
                  type="warning"
                  @click="trustCertificate"
                >
                  <el-icon><Position /></el-icon> 点击信任插件
                </ElButton>
              </ElTooltip>
              <ElButton
                v-show="isCertificateTrusted"
                type="primary"
                @click="fullScreenEditor"
              >
                <el-icon><FullScreen /></el-icon> 全屏显示
              </ElButton>
            </div>
          </div>
          <div class="onlyofficeView">
            <div id="onlyOfficeEditor" />
          </div>
        </div>
      </ElCol>
    </ElRow>
    <OnlineDocEdit
      ref="OnlineDocEditRef"
      v-model="dialogVisible"
      @reset-table="editReload"
    />
  </div>
</template>

<style lang="scss" scoped>
.el-col {
  border: 1px #aaa solid;
}

.text-success {
  color: #70b603;
  background-color: rgb(202 249 130 / 50.2%);
}

.text-warning {
  color: #f59a23;
  background-color: rgb(250 205 145 / 50.2%);
}

.share-tag-position {
  position: absolute;
  top: 5px;
  width: 40px;
  font-size: 11px;
  text-align: center;
}

.permissions-tag-position {
  position: absolute;
  top: 5px;
  left: 45px;
  width: 40px;
  font-size: 11px;
  text-align: center;
}

.main-view .search {
  margin-bottom: 0;
}

.main-view .main {
  padding: 0 20px 20px;
  border-radius: 4px;
}

.form-operat-button-group {
  font-size: 20px;
  font-weight: 800;
  color: rgb(64 158 255);
  writing-mode: vertical-rl;
}

.search-gtoup-item {
  width: 100%;
}

.import-plus {
  margin-bottom: 10px;
  border-left: 8px rgb(64 158 255) solid;

  .import-plus-title {
    margin-left: 5px;
    font-weight: 800;
  }

  button {
    float: right;
    padding: 5px !important;
  }
}

.form-data-list-action-bar {
  margin-bottom: 10px;
  border-left: 8px rgb(64 158 255) solid;

  .form-data-title {
    margin-right: 10px;
    margin-left: 5px;
    font-weight: 800;
  }
}

.onlyofficeView {
  height: 70vh;
}
</style>

<style lang="scss">
// 文字显示省略号
.query-form-item > label,
.ellipsis {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
  white-space: nowrap;
}

.no-padding-table-cell {
  border: 1px #eee solid;
  border-right: 0;
  border-left: 0;
}

.no-padding-table-cell .cell {
  padding: 0 !important;
}

// 表格的文字详情
.list-table-column-value {
  width: 100%;
  margin-top: 10px;
  margin-bottom: -10px;
}

// 查询列表的标题文字详情
.query-form-item > label {
  width: 120px;
}
</style>
