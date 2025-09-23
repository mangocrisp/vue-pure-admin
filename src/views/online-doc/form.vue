<script setup lang="ts">
import { type ElTreeV2 } from "element-plus";
import { DeptUserTreeNodeType } from "./utils/types";
import { Plus, Search } from "@element-plus/icons-vue";
import { useOnlineDocForm } from "./utils/form";

defineOptions({
  name: "OnlineDocEdit"
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

/**
 * 回调钩子用来控制弹窗显隐
 */
const emit = defineEmits(["update:modelValue", "resetTable"]);

const {
  visible,
  form,
  rules,
  formOptions,
  deptUserTreeQuery,
  deptUserTreeData,
  initUpdateForm,
  setChooseCurrentForm,
  searchFormName,
  searchFormNameChangeHandle,
  iniAddForm,
  getDeptUserTreeData,
  close,
  loading,
  onDeptUserTreeQueryChanged,
  deptUserTreeProps,
  deptUserTreeFilterMethod,
  getDeptUserTreeChildren,
  deptUserTreeCheckChange,
  userStore,
  deleteAllPermissions,
  addPermissions,
  deletePermissions,
  actionType,
  requestUpload,
  beforeUpload,
  rest,
  formRef,
  handleSubmit,
  deptUserTreeRef
} = useOnlineDocForm(props, emit);

/**
 * 暴露方法
 */
defineExpose({
  initUpdateForm,
  setChooseCurrentForm,
  searchFormName,
  searchFormNameChangeHandle
});

// 进来就初始化新增的 form
iniAddForm();

getDeptUserTreeData();
</script>

<template>
  <ElDialog
    v-model="visible"
    width="75vw"
    :title="`${form.name || '新建文件'} `"
    @close="close"
  >
    <template #header>
      <el-tag type="primary">
        {{ `${form.name ?? "新建文件"}` }}
      </el-tag>
    </template>
    <ElForm
      ref="formRef"
      v-loading="loading"
      :model="form"
      :rules="rules"
      class="edit-form"
    >
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElTooltip content="文档名称">
            <ElFormItem class="edit-form-item" label="文档名称" prop="name">
              <el-select
                v-model="form.name"
                filterable
                remote
                :reserve-keyword="false"
                default-first-option
                allow-create
                placeholder="搜索文档名或者新建文档名"
                value-key="name"
                remote-show-suffix
                :remote-method="searchFormName"
                :loading="loading"
                style="width: 100%"
                @change="searchFormNameChangeHandle"
              >
                <el-option
                  v-for="(item, i) in formOptions"
                  :key="i"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <el-alert title="注意" show-icon type="error" :closable="false">
          <template #default>
            选择已经创建的同文档名的文件会覆盖且会更新操作记录（无法还原），请谨慎操作！
          </template>
        </el-alert>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).deptName"
          :span="24"
        >
          <ElTooltip content="创建部门">
            <ElFormItem class="edit-form-item" label="创建部门">
              <ElInput
                v-model="(form as OnlineDocType.OnlineDocUpdateDTO).deptName"
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).createUserName"
          :span="12"
        >
          <ElTooltip content="创建人">
            <ElFormItem class="edit-form-item" label="创建人">
              <ElInput
                v-model="
                  (form as OnlineDocType.OnlineDocUpdateDTO).createUserName
                "
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).createTime"
          :span="12"
        >
          <ElTooltip content="创建时间">
            <ElFormItem class="edit-form-item" label="创建时间">
              <ElInput
                v-model="(form as OnlineDocType.OnlineDocUpdateDTO).createTime"
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).updateUserName"
          :span="12"
        >
          <ElTooltip content="最后修改人">
            <ElFormItem class="edit-form-item" label="最后修改人">
              <ElInput
                v-model="
                  (form as OnlineDocType.OnlineDocUpdateDTO).updateUserName
                "
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol
          v-show="(form as OnlineDocType.OnlineDocUpdateDTO).updateTime"
          :span="12"
        >
          <ElTooltip content="最后修改时间">
            <ElFormItem class="edit-form-item" label="最后修改时间">
              <ElInput
                v-model="(form as OnlineDocType.OnlineDocUpdateDTO).updateTime"
                readonly
                disabled
              />
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol :span="24">
          <ElTooltip content="文档是否共享">
            <ElFormItem
              class="edit-form-item"
              label="文档是否共享"
              prop="share"
            >
              <el-radio-group v-model="form.share">
                <el-radio border :value="1"> 是 </el-radio>
                <el-radio border :value="0"> 否 </el-radio>
              </el-radio-group>
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <ElCol v-if="form.share === 1" :span="24">
          <ElInput
            v-model="deptUserTreeQuery"
            placeholder="关键字搜索部门或者用户"
            clearable
            @keyup.enter="onDeptUserTreeQueryChanged"
          >
            <template #append>
              <ElButton type="primary" @click="onDeptUserTreeQueryChanged">
                <el-icon><Search /></el-icon>
              </ElButton>
            </template>
          </ElInput>
        </ElCol>
        <ElCol v-if="form.share === 1" :span="24">
          <el-auto-resizer :style="`height: 300px; border: 1px solid #eee`">
            <template #default="{ height, width }">
              <ElTreeV2
                ref="deptUserTreeRef"
                :width="width"
                :height="height"
                :data="deptUserTreeData"
                :props="deptUserTreeProps"
                show-checkbox
                highlight-current
                :expand-on-click-node="false"
                :filter-method="deptUserTreeFilterMethod"
                :indent="10"
                :item-size="30"
                @node-expand="getDeptUserTreeChildren"
                @check-change="deptUserTreeCheckChange"
              >
                <template #default="{ node, data }">
                  <el-tag
                    v-if="data.type === DeptUserTreeNodeType.DEPT"
                    type="primary"
                  >
                    部门
                  </el-tag>
                  <el-tag
                    v-if="data.type === DeptUserTreeNodeType.USER"
                    type="success"
                  >
                    用户
                  </el-tag>
                  <el-tag
                    v-if="data.type === DeptUserTreeNodeType.PLACEHOLDER"
                    type="info"
                  >
                    ...
                  </el-tag>
                  <ElTooltip :content="node.label">
                    <span
                      class="dept-user-tree-label ellipsis"
                      style="width: 40vw"
                      >{{ node.label }}</span
                    >
                  </ElTooltip>
                  <ElButton
                    v-if="
                      data.isAdmin &&
                      (form as OnlineDocType.OnlineDocUpdateDTO).createUser &&
                      (form as OnlineDocType.OnlineDocUpdateDTO).createUser !==
                        userStore.id
                    "
                    disabled
                    type="warning"
                    size="small"
                    plain
                  >
                    无权操作管理员
                  </ElButton>
                  <ElButton
                    v-show="data.hasChildren"
                    type="danger"
                    plain
                    size="small"
                    @click="deleteAllPermissions(node, data)"
                  >
                    删除全部权限
                  </ElButton>
                  <ElButton
                    v-show="
                      data.type !== DeptUserTreeNodeType.PLACEHOLDER &&
                      !data.permissions
                    "
                    type="warning"
                    plain
                    size="small"
                    @click="addPermissions(node, data)"
                  >
                    添加权限
                  </ElButton>
                  <ElButton
                    v-show="
                      data.type !== DeptUserTreeNodeType.PLACEHOLDER &&
                      data.permissions &&
                      (!data.isAdmin ||
                        data.isAdmin === 0 ||
                        !(form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser ||
                        (form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser === userStore.id)
                    "
                    type="danger"
                    plain
                    size="small"
                    @click="deletePermissions(node, data)"
                  >
                    删除权限
                  </ElButton>
                  <label
                    v-show="
                      data.type === DeptUserTreeNodeType.USER &&
                      data.permissions &&
                      (data.isAdmin === 1 ||
                        !(form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser ||
                        (form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser === userStore.id)
                    "
                    class="dept-user-tree-permissions-label"
                    ><span>管理员</span>
                    <ElSwitch
                      v-if="
                        (form as OnlineDocType.OnlineDocUpdateDTO).createUser
                      "
                      v-model="data.isAdmin"
                      size="small"
                      :disabled="
                        (form as OnlineDocType.OnlineDocUpdateDTO)
                          .createUser !== userStore.id
                      "
                      :active-value="1"
                      :inactive-value="0"
                    />
                    <ElSwitch
                      v-else
                      v-model="data.isAdmin"
                      size="small"
                      :active-value="1"
                      :inactive-value="0"
                    />
                  </label>
                  <el-popover
                    v-if="
                      data.type !== DeptUserTreeNodeType.PLACEHOLDER &&
                      data.permissions &&
                      (!data.isAdmin || data.isAdmin === 0)
                    "
                    title="文档操作权限"
                    placement="right"
                    trigger="hover"
                  >
                    <template #reference>
                      <el-tag class="dept-user-tree-label" type="warning">
                        权限
                      </el-tag>
                    </template>
                    <template #default>
                      <label class="dept-user-tree-permissions-label"
                        ><span>聊天</span>
                        <ElSwitch
                          v-model="data.permissions.chat"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>下载</span>
                        <ElSwitch
                          v-model="data.permissions.download"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>复制</span>
                        <ElSwitch
                          v-model="data.permissions.copy"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>评论</span>
                        <ElSwitch
                          v-model="data.permissions.comment"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>编辑</span>
                        <ElSwitch
                          v-model="data.permissions.edit"
                          size="small"
                        />
                      </label>
                      <label class="dept-user-tree-permissions-label"
                        ><span>打印</span>
                        <ElSwitch
                          v-model="data.permissions.print"
                          size="small"
                        />
                      </label>
                    </template>
                  </el-popover>
                </template>
              </ElTreeV2>
            </template>
          </el-auto-resizer>
        </ElCol>
        <ElCol v-if="actionType === 'add'" :span="24">
          <ElTooltip content="文档文件">
            <ElFormItem class="edit-form-item" label="文档文件" prop="file">
              <ElUpload
                action="#"
                :http-request="requestUpload"
                :show-file-list="false"
                :on-change="beforeUpload"
                drag
                style="display: inline-block"
              >
                <el-icon><Plus /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处或者 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    文件格式仅支持xls、xlsx文件格式，且暂不支持合并表头格式的文件上传
                    <!-- <br>
                    <a href="#" style="color: #409EFF;">点击下载导入示例模板</a> -->
                    <br />
                    <em style="color: #409eff">
                      {{ form.file?.name ?? "" }}
                    </em>
                  </div>
                </template>
              </ElUpload>
            </ElFormItem>
          </ElTooltip>
        </ElCol>
        <el-alert title="注意" show-icon type="warning" :closable="false">
          <template #default>
            1.
            请确保勾选的部门或者用户设置了正确的权限，如果不添加权限，默认对文档只有只读权限
            <br />2.
            如果是选择了整个部门所有的人，代表的是设置了整个部门的权限，取消全选部门，表示逐个设置部门下面的用户以及部门
            <br />3.
            如果同步设置了父级部门的权限和子级部门以及用户的权限，子级的优先级比父级高
            <br />4. 管理员权限拥有所有权限，只能给人员设置管理员权限
            创建文档的人即是文档拥有者，只能文档拥有者才能赋予和取消用户管理员权限
          </template>
        </el-alert>
      </ElRow>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="handleSubmit"
          >确定</el-button
        >
        <el-button @click="rest(formRef)">重置</el-button>
        <el-button :loading="loading" @click="visible = false">取消</el-button>
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.dept-user-tree-permissions-label {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}

.dept-user-tree-label,
.dept-user-tree-permissions-label > span {
  margin-right: 10px;
  margin-left: 10px;
}
</style>

<style lang="scss">
// 文字显示省略号
.edit-form-item > label,
.ellipsis {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
  white-space: nowrap;
}

// 编辑元素的标题
.edit-form-item > label,
.edit-form-item > div.el-form-item__label {
  width: 120px;
}

.edit-form-item > div.el-form-item__label {
  justify-content: start;
  color: #000;
}
</style>
