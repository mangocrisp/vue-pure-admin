import { $t } from "@/plugins/i18n";
import { template } from "@/router/enums";

export default {
  path: "/template",
  redirect: "/template/index",
  meta: {
    icon: "ri/bar-chart-horizontal-line",
    title: $t("menus.pureTmplate"),
    rank: template
  },
  children: [
    {
      path: "/template/index",
      name: "Template",
      component: () => import("@/views/vueTemplate/index.vue"),
      meta: {
        title: $t("menus.pureTmplate")
      }
    }
  ]
} satisfies RouteConfigsTable;
