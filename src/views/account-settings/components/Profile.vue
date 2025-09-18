<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { formUpload } from "@/api/mock";
import { message } from "@/utils/message";
import { type UserInfo, getMine } from "@/api/user";
import type { FormInstance, FormRules } from "element-plus";
import ReCropperPreview from "@/components/ReCropperPreview";
import {
  createFormData,
  deviceDetection,
  storageLocal
} from "@pureadmin/utils";
import uploadLine from "~icons/ri/upload-line";
import SystemUserApi from "@/api/system/user";
import staticAvatar from "@/assets/user.jpg";
import AdminFileApi from "@/api/admin/file";
import { blobToDataURI } from "@/utils";
import { useUserStoreHook } from "@/store/modules/user";
import { userKey } from "@/utils/auth";
import { useSystemDictParamsStoreHook } from "@/store/modules/system-dict-params";

defineOptions({
  name: "Profile"
});

const imgSrc = ref("");
const cropperBlob = ref();
const cropRef = ref();
const uploadRef = ref();
const isShow = ref(false);
const userInfoFormRef = ref<FormInstance>();

const userInfos = reactive({
  id: undefined,
  avatar: undefined,
  nickname: undefined,
  email: undefined,
  phone: undefined,
  gender: undefined,
  realName: undefined
});

const rules = reactive<FormRules<UserInfo>>({
  nickname: [{ required: true, message: "昵称必填", trigger: "blur" }]
});

const genderOption =
  useSystemDictParamsStoreHook().dictOptions("system-gender");

function queryEmail(queryString, callback) {
  const emailList = [
    { value: "@qq.com" },
    { value: "@126.com" },
    { value: "@163.com" }
  ];
  let results = [];
  let queryList = [];
  emailList.map(item =>
    queryList.push({ value: queryString.split("@")[0] + item.value })
  );
  results = queryString
    ? queryList.filter(
        item =>
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    : queryList;
  callback(results);
}

const onChange = uploadFile => {
  const reader = new FileReader();
  reader.onload = e => {
    imgSrc.value = e.target.result as string;
    isShow.value = true;
  };
  reader.readAsDataURL(uploadFile.raw);
};

const handleClose = () => {
  cropRef.value.hidePopover();
  uploadRef.value.clearFiles();
  isShow.value = false;
};

const onCropper = ({ blob }) => (cropperBlob.value = blob);

const handleSubmitImage = async () => {
  // const formData = createFormData({
  //   files: new File([cropperBlob.value], "avatar")
  // });
  // formUpload(formData)
  //   .then(({ success, data }) => {
  //     if (success) {
  //       message("更新头像成功", { type: "success" });
  //       handleClose();
  //     } else {
  //       message("更新头像失败");
  //     }
  //   })
  //   .catch(error => {
  //     message(`提交异常 ${error}`, { type: "error" });
  //   });
  if (cropperBlob.value) {
    const formData = new FormData();
    formData.append("file", cropperBlob.value);
    const { data } = await AdminFileApi.fileUpload(formData);
    await SystemUserApi.patchMyInfo({
      avatar: data[0]
    });
    useUserStoreHook().SET_AVATAR(data[0]);
    const cache = storageLocal().getItem(userKey) as object;
    storageLocal().setItem(userKey, {
      ...cache,
      ...{
        avatar: data[0]
      }
    });
    useUserStoreHook().setAvatarBase64();
    userInfos.avatar = imgSrc.value;
    message("更新头像成功", { type: "success" });
    handleClose();
  }
};

// 更新信息
const onSubmit = async (formEl: FormInstance) => {
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log(userInfos);
      await SystemUserApi.patchMyInfo({
        nickname: userInfos.nickname,
        gender: userInfos.gender
      });
      useUserStoreHook().SET_NICKNAME(userInfos.nickname);
      const cache = storageLocal().getItem(userKey) as object;
      storageLocal().setItem(userKey, {
        ...cache,
        ...{
          nickname: userInfos.nickname
        }
      });
      message("更新信息成功", { type: "success" });
    } else {
      console.log("error submit!", fields);
    }
  });
};

async function loadMyInfo() {
  const { data: myInfo } = await SystemUserApi.myInfo();
  setTimeout(async () => {
    if (!myInfo.avatar) {
      userInfos.avatar = staticAvatar;
      return;
    }
    AdminFileApi.fileDownload(myInfo.avatar)
      .then((res: Blob) => {
        blobToDataURI(res)
          .then(dataURI => (userInfos.avatar = dataURI))
          .catch(() => (userInfos.avatar = staticAvatar));
      })
      .catch(() => (userInfos.avatar = staticAvatar));
  });
  Object.assign(userInfos, myInfo);
}

onMounted(() => {
  loadMyInfo();
});
</script>

<template>
  <div
    :class="[
      'min-w-[180px]',
      deviceDetection() ? 'max-w-[100%]' : 'max-w-[70%]'
    ]"
  >
    <h3 class="my-8!">个人信息</h3>
    <el-form
      ref="userInfoFormRef"
      label-position="top"
      :rules="rules"
      :model="userInfos"
    >
      <el-form-item label="头像">
        <el-avatar :size="80" :src="userInfos.avatar" />
        <el-upload
          ref="uploadRef"
          accept="image/*"
          action="#"
          :limit="1"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onChange"
        >
          <el-button plain class="ml-4!">
            <IconifyIconOffline :icon="uploadLine" />
            <span class="ml-2">更新头像</span>
          </el-button>
        </el-upload>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8" :xs="24" :sm="8">
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="userInfos.nickname" placeholder="请输入昵称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8" :xs="24" :sm="8">
          <el-form-item label="性别" prop="nickname">
            <el-select
              v-model="userInfos.gender"
              placeholder="请选择"
              default-first-option
              value-key="gender"
            >
              <el-option
                v-for="(item, key) in genderOption"
                :key="key"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8" :xs="24" :sm="8">
          <el-form-item label="联系电话">
            <el-input v-model="userInfos.phone" disabled readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8" :xs="24" :sm="8">
          <el-form-item label="邮箱" prop="email">
            <el-autocomplete
              v-model="userInfos.email"
              :fetch-suggestions="queryEmail"
              :trigger-on-focus="false"
              readonly
              disabled
              class="w-full"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-button type="primary" @click="onSubmit(userInfoFormRef)">
        更新信息
      </el-button>
    </el-form>
    <el-dialog
      v-model="isShow"
      width="40%"
      title="编辑头像"
      destroy-on-close
      :closeOnClickModal="false"
      :before-close="handleClose"
      :fullscreen="deviceDetection()"
    >
      <ReCropperPreview ref="cropRef" :imgSrc="imgSrc" @cropper="onCropper" />
      <template #footer>
        <div class="dialog-footer">
          <el-button bg text @click="handleClose">取消</el-button>
          <el-button bg text type="primary" @click="handleSubmitImage">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
