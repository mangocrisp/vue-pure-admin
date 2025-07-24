import SystemUserApi from "@/api/system/user";
import { addDialog } from "@/components/ReDialog";
import { useEncrypt } from "@/hooks";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { deviceDetection, isAllEmpty } from "@pureadmin/utils";
import { zxcvbn } from "@zxcvbn-ts/core";
import { ElForm, ElFormItem, ElInput, ElProgress } from "element-plus";
import { reactive, ref, watch } from "vue";

export function useAccount() {
  const ruleFormRef = ref();
  // 重置的新密码
  const pwdForm = reactive({
    oldPwd: "",
    newPwd: "",
    confirmPwd: ""
  });
  // 当前密码强度（0-4）
  const curScore = ref();
  const pwdProgress = [
    { color: "#e74242", text: "非常弱" },
    { color: "#EFBD47", text: "弱" },
    { color: "#ffa500", text: "一般" },
    { color: "#1bbf1b", text: "强" },
    { color: "#008000", text: "非常强" }
  ];
  watch(
    pwdForm,
    ({ newPwd }) =>
      (curScore.value = isAllEmpty(newPwd) ? -1 : zxcvbn(newPwd).score)
  );
  /** 重置密码 */
  function handleResetPassword() {
    addDialog({
      title: `重置密码`,
      width: "30%",
      draggable: true,
      closeOnClickModal: false,
      fullscreen: deviceDetection(),
      contentRenderer: () => (
        <>
          <ElForm ref={ruleFormRef} model={pwdForm}>
            <ElFormItem
              prop="oldPwd"
              rules={[
                {
                  required: true,
                  message: "请输入旧密码",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                placeholder="请输入旧密码"
                show-password
                type="password"
                v-model={pwdForm.oldPwd}
                clearable
              ></ElInput>
            </ElFormItem>
            <ElFormItem
              prop="newPwd"
              rules={[
                {
                  required: true,
                  message: "请输入新密码",
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                clearable
                show-password
                type="password"
                v-model={pwdForm.newPwd}
                placeholder="请输入新密码"
              />
            </ElFormItem>
            <ElFormItem
              prop="confirmPwd"
              rules={[
                {
                  required: true,
                  message: "再次输入新密码",
                  trigger: "blur"
                },
                {
                  validator: (rule, value, callback) => {
                    // 检查确认密码是否与密码一致
                    if (value !== pwdForm.newPwd) {
                      callback(new Error("两次输入的密码不一致"));
                    } else {
                      callback();
                    }
                  },
                  trigger: "blur"
                }
              ]}
            >
              <ElInput
                show-password
                type="password"
                placeholder="再次输入新密码"
                v-model={pwdForm.confirmPwd}
                clearable
              ></ElInput>
            </ElFormItem>
          </ElForm>
          <div class="my-4 flex">
            {pwdProgress.map(({ color, text }, idx) => (
              <div
                class="w-[19vw]"
                style={{ marginLeft: idx !== 0 ? "4px" : 0 }}
              >
                <ElProgress
                  striped
                  striped-flow
                  duration={curScore.value === idx ? 6 : 0}
                  percentage={curScore.value >= idx ? 100 : 0}
                  color={color}
                  stroke-width={10}
                  show-text={false}
                />
                <p
                  class="text-center"
                  style={{ color: curScore.value === idx ? color : "" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
      closeCallBack: () => (pwdForm.newPwd = ""),
      beforeSure: done => {
        ruleFormRef.value.validate(async valid => {
          if (valid) {
            console.log(pwdForm.newPwd);
            await SystemUserApi.editPassword({
              old: await useEncrypt().encrypt(pwdForm.oldPwd),
              now: await useEncrypt().encrypt(pwdForm.newPwd)
            });
            // 表单规则校验通过
            message(`已成功重置密码`, {
              type: "success",
              onClose: () => useUserStoreHook().clearLoginStatus(false)
            });
            // 根据实际业务使用pwdForm.newPwd和row里的某些字段去调用重置用户密码接口即可
            done(); // 关闭弹框
          }
        });
      }
    });
  }

  return {
    handleResetPassword
  };
}
