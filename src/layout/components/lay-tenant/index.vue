<script setup lang="ts">
import SystemTenantApi from "@/api/system/tenant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { emitter } from "@/utils/mitt";
import { onMounted, ref, toRaw } from "vue";
import router from "@/router";

const userTenant = ref<SystemTenantType.Domain[]>([]);
const onChooseTenant = (tenant: SystemTenantType.Domain) => {
  SystemTenantApi.changeCurrent(tenant.tenantId).then(async () => {
    emitter.emit("closeChooseTenantPanel");
    await router.push({ path: "/" });
    location.reload();
  });
};

const loadUserTenant = () => {
  SystemTenantApi.currentList().then(res => {
    userTenant.value = res.data;
  });
};

onMounted(() => {
  loadUserTenant();
});
</script>

<template>
  <div>
    <el-card
      v-for="item in userTenant"
      :key="item.id"
      v-ripple
      class="mb-5 w-[210px] select-none cursor-pointer text-center"
      shadow="hover"
      @click="onChooseTenant(item)"
    >
      <component
        :is="
          useRenderIcon(
            toRaw(item.icon ?? 'ant-design:cloud-server-outlined'),
            {
              width: '180px',
              height: '180px'
            }
          )
        "
      />
      <span>{{ item.tenantName }}</span>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.text-center {
  text-align: center;
}
</style>
