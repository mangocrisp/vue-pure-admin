import "./reset.css";
import dayjs from "dayjs";
import roleForm from "../form/role.vue";
import tenantForm from "../form/tenant.vue";
import editForm from "../form/index.vue";
import { zxcvbn } from "@zxcvbn-ts/core";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import userAvatar from "@/assets/user.jpg";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import ReCropperPreview from "@/components/ReCropperPreview";
import type { RoleFormItemProps, TenantFormItemProps } from "../utils/types";
import {
  getKeyList,
  isAllEmpty,
  hideTextAtIndex,
  deviceDetection
} from "@pureadmin/utils";
import {
  // ElForm,
  // ElInput,
  // ElFormItem,
  // ElProgress,
  ElMessageBox
} from "element-plus";
import {
  type Ref,
  h,
  ref,
  toRaw,
  watch,
  computed,
  reactive,
  onMounted
} from "vue";
import SystemDeptApi from "@/api/system/dept";
import SystemUserApi from "@/api/system/user";
import { useSm2CryptoStore } from "@/store/modules/sm2-crypto";
import AdminFileApi from "@/api/admin/file";
import { blobToDataURI } from "@/utils";
import SystemRoleApi from "@/api/system/role";
import SystemTenantApi from "@/api/system/tenant";

export function useUser(tableRef: Ref, treeRef: Ref) {
  const form = reactive({
    // 左侧部门树的id
    deptId: undefined,
    username: undefined,
    phone: undefined,
    status: undefined
  });
  const formRef = ref();
  // const ruleFormRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  // 上传头像信息
  const avatarInfo = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const higherDeptOptions = ref();
  const treeData = ref([]);
  const treeLoading = ref(true);
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const sm2CryptoStore = useSm2CryptoStore();

  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户编号",
      prop: "id",
      width: 90
    },
    {
      label: "用户头像",
      prop: "avatar",
      cellRenderer: ({ row }) => (
        <el-image
          fit="cover"
          preview-teleported={true}
          src={row.avatar || userAvatar}
          preview-src-list={Array.of(row.avatar || userAvatar)}
          class="w-[24px] h-[24px] rounded-full align-middle"
        />
      ),
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickname",
      minWidth: 130
    },
    {
      label: "性别",
      prop: "gender",
      minWidth: 90,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.gender === "2" ? "danger" : null}
          effect="plain"
        >
          {row.gender === "1" ? "男" : "女"}
        </el-tag>
      )
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "h-[20px]!",
      "reset-margin",
      "text-gray-500!",
      "dark:text-white!",
      "dark:hover:text-primary!"
    ];
  });
  // 重置的新密码
  const pwdForm = reactive({
    newPwd: ""
  });
  // const pwdProgress = [
  //   { color: "#e74242", text: "非常弱" },
  //   { color: "#EFBD47", text: "弱" },
  //   { color: "#ffa500", text: "一般" },
  //   { color: "#1bbf1b", text: "强" },
  //   { color: "#008000", text: "非常强" }
  // ];
  // 当前密码强度（0-4）
  const curScore = ref();
  const roleOptions = ref([]);
  const tenantOptions = ref([]);

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.username
      }</strong>用户吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        await SystemUserApi.update({ id: row.id, status: row.status });
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: false
          }
        );
        message("已成功修改用户状态", {
          type: "success"
        });
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleUpdate(row) {
    console.log(row);
  }

  function handleDelete(row) {
    message(`您删除了用户编号为${row.id}的这条数据`, { type: "success" });
    onSearch();
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  function onbatchDel() {
    // 返回当前选中的行
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    // 接下来根据实际业务，通过选中行的某项数据，比如下面的id，调用接口进行批量删除
    message(`已删除用户编号为 ${getKeyList(curSelected, "id")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await SystemUserApi.page({
      ...{ pageNum: pagination.currentPage, pageSize: pagination.pageSize },
      ...toRaw(form)
    });
    dataList.value = data.records;
    pagination.total = data.total;
    convertUserAvatar();
    loading.value = false;
  }

  /**转换头像的任务列表，如果刷新太频繁了，就把还没进行的任务杀掉 */
  const convertTaskIdList = [];
  /**缓存已经下载过的用户的头像 */
  const userAvatarMap = new Map();

  function convertUserAvatar() {
    convertTaskIdList.forEach(taskId => clearTimeout(taskId));
    dataList.value
      .filter(user => user.avatar)
      .forEach(user => {
        if (userAvatarMap.has(user.id)) {
          return (user.avatar = userAvatarMap.get(user.id));
        }
        const taskId = setTimeout(() => {
          // 下载文件
          getFile(user.avatar).then(dataURI => {
            user.avatar = dataURI;
            userAvatarMap.set(user.id, dataURI);
          });
        }, 100);
        convertTaskIdList.push(taskId);
      });
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    form.deptId = undefined;
    treeRef.value.onTreeReset();
    onSearch();
  };

  function onTreeSelect({ id, selected }) {
    form.deptId = selected ? id : undefined;
    onSearch();
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  const userDeptMap = new Map();

  async function getUserDept(id: string) {
    if (!id) {
      return [];
    }
    if (userDeptMap.has(id)) {
      return userDeptMap.get(id);
    }
    const { data } = await SystemDeptApi.loadDeptUser(id);
    userDeptMap.set(id, data);
    return data;
  }

  const editUserDetail = ref<SystemUserType.User>(null);

  async function openDialog(title = "新增", row?: SystemUserType.User) {
    if (row?.id) {
      const { data: detail } = await SystemUserApi.detail(row?.id);
      editUserDetail.value = detail;
    }
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          higherDeptOptions: formatHigherDeptOptions(higherDeptOptions.value),
          deptId: row?.id
            ? ((await getUserDept(row.id))?.map(dept => dept.deptId) ?? [])
            : [],
          id: row?.id,
          email: editUserDetail.value?.email,
          gender: editUserDetail.value?.gender ?? "1",
          nickname: editUserDetail.value?.nickname,
          phone: editUserDetail.value?.phone,
          realName: editUserDetail.value?.realName,
          userType: editUserDetail.value?.userType ?? "00",
          username: editUserDetail.value?.username,
          status: editUserDetail.value?.status ?? 1
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      closeCallBack: () => {
        editUserDetail.value = null;
      },

      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props as SystemUserType.UserEditFormDTO;
        function chores() {
          message(
            `您${title}了用户名称为${curData.formInline.nickname}的这条数据`,
            {
              type: "success"
            }
          );
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            const { formInline: formInlineData } = curData;

            const saveData = {
              ...formInlineData,
              ...{
                password: formInlineData.password
                  ? await sm2CryptoStore.encrypt(formInlineData.password)
                  : undefined
              }
            };
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              const { data: savedUser } = await SystemUserApi.add(
                saveData as SystemUserType.UserAddDTO
              );
              saveData.id = savedUser.id;
              chores();
            } else {
              const { data: savedUser } = await SystemUserApi.update(
                saveData as SystemUserType.UserUpdateDTO
              );
              saveData.id = savedUser.id;
              // 实际开发先调用修改接口，再进行下面操作
              chores();
            }
            if (formInlineData.deptId && formInlineData.deptId.length > 0) {
              await SystemDeptApi.saveDeptUser(
                [].concat(formInlineData.deptId).map(deptId => ({
                  deptId,
                  userId: saveData.id
                }))
              );
              userDeptMap.delete(saveData.id);
            }
          }
        });
      }
    });
  }

  const cropRef = ref();

  /**
   * 获取文件
   * @param file 文件路径
   * @returns 文件
   */
  async function getFile(file: string) {
    return await AdminFileApi.fileDownload(file).then(
      async (res: Blob) => await blobToDataURI(res)
    );
  }

  /** 上传头像 */
  function handleUpload(row) {
    addDialog({
      title: "裁剪、上传头像",
      width: "40%",
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () =>
        h(ReCropperPreview, {
          ref: cropRef,
          imgSrc: row.avatar || userAvatar,
          onCropper: info => (avatarInfo.value = info)
        }),
      beforeSure: async done => {
        console.log("裁剪后的图片信息：", avatarInfo.value);

        if (avatarInfo.value) {
          const formData = new FormData();
          formData.append("file", avatarInfo.value.blob);
          const { data } = await AdminFileApi.fileUpload(formData);
          await SystemUserApi.updatePart({
            id: row.id,
            avatar: data[0]
          });
          setTimeout(() => {
            // 下载文件
            getFile(data[0]).then(dataURI => {
              // useUserStoreHook().SET_AVATAR(dataURI);
              // 更新列表用户头像
              dataList.value
                .filter(item => item.id === row.id)
                .forEach(item => {
                  item.avatar = dataURI;
                });
              // 缓存头像
              userAvatarMap.set(row.id, dataURI);
            });
            // 更新用户头像
            onSearch(); // 刷新表格数据
          }, 500);
        }

        done(); // 关闭弹框
      },
      closeCallBack: () => cropRef.value.hidePopover()
    });
  }

  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );

  /** 重置密码 */
  function handleReset(row) {
    // addDialog({
    //   title: `重置 ${row.username} 用户的密码`,
    //   width: "30%",
    //   draggable: true,
    //   closeOnClickModal: false,
    //   fullscreen: deviceDetection(),
    //   contentRenderer: () => (
    //     <>
    //       <ElForm ref={ruleFormRef} model={pwdForm}>
    //         <ElFormItem
    //           prop="newPwd"
    //           rules={[
    //             {
    //               required: true,
    //               message: "请输入新密码",
    //               trigger: "blur"
    //             }
    //           ]}
    //         >
    //           <ElInput
    //             clearable
    //             show-password
    //             type="password"
    //             v-model={pwdForm.newPwd}
    //             placeholder="请输入新密码"
    //           />
    //         </ElFormItem>
    //       </ElForm>
    //       <div class="my-4 flex">
    //         {pwdProgress.map(({ color, text }, idx) => (
    //           <div
    //             class="w-[19vw]"
    //             style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
    //           >
    //             <ElProgress
    //               striped
    //               striped-flow
    //               duration={curScore.value === idx ? 6 : 0}
    //               percentage={curScore.value >= idx ? 100 : 0}
    //               color={color}
    //               stroke-width={10}
    //               show-text={false}
    //             />
    //             <p
    //               class="text-center"
    //               style={{ color: curScore.value === idx ? color : "" }}
    //             >
    //               {text}
    //             </p>
    //           </div>
    //         ))}
    //       </div>
    //     </>
    //   ),
    //   closeCallBack: () => (pwdForm.newPwd = ""),
    //   beforeSure: done => {
    //     ruleFormRef.value.validate(valid => {
    //       if (valid) {
    //         // 表单规则校验通过
    //         message(`已成功重置 ${row.username} 用户的密码`, {
    //           type: "success"
    //         });
    //         console.log(pwdForm.newPwd);
    //         // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可
    //         done(); // 关闭弹框
    //         onSearch(); // 刷新表格数据
    //       }
    //     });
    //   }
    // });
    // 重置用户密码这种只能是用户自己去改密码，重置密码应该只能重置为一个系统默认的密码。
    ElMessageBox.confirm(
      `确认要<strong>重置</strong><strong style='color:var(--el-color-primary)'>${
        row.username
      }</strong>用户的密码吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    ).then(async () => {
      await SystemUserApi.resetPassword([row.id]);
      message(`已成功重置 ${row.username} 用户的密码`, {
        type: "success"
      });
      onSearch(); // 刷新表格数据
    });
  }

  /** 分配角色 */
  async function handleRole(row) {
    // 选中的角色列表
    const ids =
      (await SystemUserApi.userRoleList(row.id)).data.map(
        item => item.roleId
      ) ?? [];

    addDialog({
      title: `分配 ${row.username} 用户的角色`,
      props: {
        formInline: {
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          roleOptions: roleOptions.value ?? [],
          ids
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(roleForm),
      beforeSure: async (done, { options }) => {
        const curData = options.props.formInline as RoleFormItemProps;
        const { ids } = toRaw(curData);
        const saveData = ids.map(id => {
          return { userId: row.id, roleId: id as unknown as string };
        });
        await SystemUserApi.userRoleBatch(
          saveData && saveData.length > 0 ? saveData : [{ userId: row.id }]
        );
        message("绑定角色成功", {
          type: "success"
        });
        done(); // 关闭弹框
      }
    });
  }

  /** 分配租户 */
  async function handleTenant(row) {
    // 选中的租户列表
    const tenantIds =
      (await SystemTenantApi.loadUserHaveTenant(row.id)).data.map(
        item => item.tenantId
      ) ?? [];

    addDialog({
      title: `分配 ${row.username} 用户的租户`,
      props: {
        formInline: {
          username: row?.username ?? "",
          nickname: row?.nickname ?? "",
          tenantOptions: tenantOptions.value ?? [],
          tenantIds
        }
      },
      width: "400px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(tenantForm),
      beforeSure: async (done, { options }) => {
        const curData = options.props.formInline as TenantFormItemProps;
        const { tenantIds } = toRaw(curData);
        if (tenantIds && tenantIds.length > 0) {
          const saveData = tenantIds.map(tenantId => {
            return { userId: row.id, tenantId: tenantId as unknown as string };
          });
          console.log("saveData :>> ", saveData);
          await SystemTenantApi.loadUserSetTenant(saveData);
        }
        done(); // 关闭弹框
      }
    });
  }

  /**
   * 加载部门树
   */
  async function loadDeptTree() {
    treeLoading.value = true;
    // 归属部门
    const { data } = await SystemDeptApi.loadDeptList({ includeAll: true });
    const allId = getKeyList(data, "id");
    const deptData = data
      .filter(item => item.pid)
      .filter(item => allId.indexOf(item.pid) > -1)
      .map(item => ({ ...item, ...{ parentId: item.pid } }));
    higherDeptOptions.value = handleTree(deptData);
    treeData.value = handleTree(deptData);
    treeLoading.value = false;
  }

  /**
   * 加载部门列表
   * @param paramsSearch 是否是按查询参数搜索
   * @param pid 父级 id
   * @returns 部门列表
   */
  async function loadDeptList(
    paramsSearch = false,
    pid = "0",
    hasChildren = true
  ): Promise<SystemDeptType.DeptTree[]> {
    const { data } = await SystemDeptApi.loadDeptList(
      paramsSearch ? { ...form, includeAll: true } : { pid, includeAll: true }
    );
    return data.map(item => ({
      ...item,
      ...{ parentId: item.pid },
      children: [],
      hasChildren: hasChildren,
      __uniqueId: Date.now()
    }));
  }

  /** 懒加载的间隔时间 */
  const lazyLoadInterval = ref(50);

  /** 懒加载的缓存 */
  const lazyLoadChildrenStore = new Map<string, SystemDeptType.DeptTree[]>();

  /**
   * 懒加载数据
   * @param node 节点数据
   * @param resolve 加载数据
   */
  function lazyLoad(node, resolve) {
    console.log("lazyLoad", node);
    if (lazyLoadChildrenStore.has(node.id)) {
      resolve(lazyLoadChildrenStore.get(node.id));
      return;
    }
    setTimeout(async () => {
      const children = await loadDeptList(false, node.id);
      lazyLoadChildrenStore.set(node.id, children);
      resolve(children);
      lazyLoadInterval.value = 50;
    }, lazyLoadInterval.value);
    lazyLoadInterval.value += 50;
  }

  /**
   * 加载角色数据
   */
  async function loadRoleData() {
    // 角色列表
    roleOptions.value = (await SystemRoleApi.listFilterRole()).data;
  }

  async function loadTenantData() {
    // 租户列表
    tenantOptions.value = (await SystemTenantApi.list({})).data;
  }

  onMounted(async () => {
    onSearch();
    loadDeptTree();
    loadRoleData();
    loadTenantData();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    treeData,
    treeLoading,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    lazyLoad,
    resetForm,
    onbatchDel,
    openDialog,
    onTreeSelect,
    handleUpdate,
    handleDelete,
    handleUpload,
    handleReset,
    handleRole,
    handleTenant,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
