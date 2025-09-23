<script setup lang="ts">
import {
  Plus,
  Search,
  User,
  OfficeBuilding,
  CirclePlusFilled,
  Position,
  FullScreen,
  Document
} from "@element-plus/icons-vue";
import splitpane, { ContextProps } from "@/components/ReSplitPane";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import FontistoMoreVA from "~icons/fontisto/more-v-a";
import { reactive } from "vue";
import { useOnlineDoc } from "./utils";

defineOptions({
  name: "OnlineDocList"
});

const settingLR: ContextProps = reactive({
  minPercent: 20,
  defaultPercent: 20,
  split: "vertical"
});

const settingTB: ContextProps = reactive({
  minPercent: 20,
  defaultPercent: 40,
  split: "horizontal"
});

const {
  totalFn,
  trustCertificate,
  fullScreenEditor,
  isCertificateTrusted,
  OnlineDocEdit,
  OnlineDocEditRef,
  queryFormRef,
  onPageSizeChange,
  handleUpdate,
  onCurrentChange,
  handleDel,
  formTableRef,
  importCurrentForm,
  editReload,
  dialogVisible,
  form,
  reloadList,
  loading,
  list,
  chooseFormData,
  userStore,
  pageParam,
  totalRef,
  formChoosedRowRef,
  canImportThatDoc
} = useOnlineDoc();
</script>

<template>
  <el-card shadow="never">
    <div class="split-pane">
      <splitpane :splitSet="settingLR">
        <!-- #paneL 表示指定该组件为左侧面板 -->
        <template #paneL>
          <!-- 自定义左侧面板的内容 -->
          <el-scrollbar>
            <div class="list-pane">
              <div class="list-pane-operate">
                <span class="list-pane-operate-title">文档列表</span>
                <ElButton
                  type="primary"
                  size="small"
                  @click="dialogVisible = true"
                >
                  <el-icon><Plus /></el-icon>
                </ElButton>
              </div>
              <div class="list-pane-search">
                <ElForm
                  ref="queryFormRef"
                  :model="form"
                  class="query-form"
                  inline
                  @submit.prevent
                >
                  <ElFormItem style="width: 100%">
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
                </ElForm>
              </div>

              <ElTable
                ref="formTableRef"
                v-loading="loading"
                class="list-pane-table"
                highlight-current-row
                row-key="id"
                :data="list"
                :show-header="false"
                max-height="75vh"
                stripe
                @row-click="chooseFormData"
              >
                <!-- 显示列 -->
                <el-table-column prop="name" label="文档名称">
                  <template #default="{ row }">
                    <ElTooltip placement="right" :offset="80">
                      <template #content>
                        <p>
                          <el-icon><Document /></el-icon>{{ row.name }}
                        </p>
                        <p>
                          <el-icon><User /></el-icon>{{ row.createUserName }}
                        </p>
                        <p>
                          <el-icon><OfficeBuilding /></el-icon
                          >{{ row.deptName }}
                        </p>
                      </template>
                      <div class="list-pane-table-doc-name">
                        <div class="list-pane-table-doc-name-tag">
                          <ElTag
                            v-if="row.share === 1"
                            type="success"
                            class="mr-[5px]"
                            size="small"
                          >
                            共享
                          </ElTag>
                          <ElTag
                            v-else
                            type="warning"
                            class="mr-[5px]"
                            size="small"
                          >
                            不共享
                          </ElTag>
                          <ElTag
                            v-show="row.createUser === userStore.id"
                            type="danger"
                            class="mr-[5px]"
                            size="small"
                          >
                            拥有者
                          </ElTag>
                          <ElTag
                            v-show="
                              row.createUser !== userStore.id &&
                              row.isAdmin === 1
                            "
                            type="primary"
                            class="mr-[5px]"
                            size="small"
                          >
                            管理员
                          </ElTag>
                        </div>
                        <span class="ellipsis">{{ row.name }}</span>
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
                  width="60px"
                >
                  <template #default="{ row }">
                    <el-dropdown placement="bottom">
                      <el-button
                        v-show="
                          row.createUser === userStore.id || row.isAdmin === 1
                        "
                        class="ml-3! mt-[2px]!"
                        link
                        type="primary"
                        size="small"
                        :icon="useRenderIcon(FontistoMoreVA)"
                      />
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
          </el-scrollbar>
        </template>
        <!-- #paneR 表示指定该组件为右侧面板 -->
        <template #paneR>
          <el-scrollbar>
            <div class="doc-pane">
              <div class="doc-pane-info">
                <ElTooltip placement="bottom">
                  <template #content>
                    <div v-if="formChoosedRowRef">
                      <p>文档名称：{{ formChoosedRowRef.name }}</p>
                      <p>
                        创建人：{{ formChoosedRowRef.createUserName }}({{
                          formChoosedRowRef.deptName
                        }})
                      </p>
                      <p>创建时间：{{ formChoosedRowRef.createTime }}</p>
                      <p>最后修改人：{{ formChoosedRowRef.updateUserName }}</p>
                      <p>最后修改时间：{{ formChoosedRowRef.updateTime }}</p>
                    </div>
                    <div v-else>请选择左侧文档</div>
                  </template>
                  <div class="doc-pane-info-title ellipsis mr-[10px]">
                    <el-icon class="doc-pane-info-title-icon"
                      ><Document /></el-icon
                    ><span>{{
                      formChoosedRowRef?.name ?? "请选择左侧文档"
                    }}</span>
                  </div>
                </ElTooltip>
                <div class="doc-pane-info-btns">
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
          </el-scrollbar>
        </template>
      </splitpane>
    </div>

    <OnlineDocEdit
      ref="OnlineDocEditRef"
      v-model="dialogVisible"
      @reset-table="editReload"
    />
  </el-card>
</template>

<style lang="scss">
.el-scrollbar__view {
  width: calc(100% - 25px);
}
</style>
<style lang="scss" scoped>
@use "./style/index.scss";
</style>
