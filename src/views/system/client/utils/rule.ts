import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  clientId: [{ required: true, message: "客户端ID为必填项", trigger: "blur" }],
  clientName: [
    { required: true, message: "客户端名称为必填项", trigger: "blur" }
  ],
  clientSecret: [
    { required: true, message: "客户端密钥为必填项", trigger: "blur" }
  ],
  scope: [{ required: true, message: "域为必填项", trigger: "blur" }],
  authorizedGrantTypes: [
    { required: true, message: "授权方式为必填项", trigger: "blur" }
  ],
  webServerRedirectUri: [
    { required: true, message: "认证回调地址为必填项", trigger: "blur" }
  ],
  accessTokenValidity: [
    { required: true, message: "认证令牌时效为必填项", trigger: "blur" }
  ],
  refreshTokenValidity: [
    { required: true, message: "刷新令牌时效为必填项", trigger: "blur" }
  ]
});
