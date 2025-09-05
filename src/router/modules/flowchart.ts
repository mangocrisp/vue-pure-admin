import { $t } from "@/plugins/i18n";
import { flowchart } from "@/router/enums";

export default {
  path: "/flow-chart",
  redirect: "/flow-chart/index",
  meta: {
    icon: "ep/set-up",
    title: $t("menus.pureFlowChart"),
    rank: flowchart
  },
  children: [
    {
      path: "/flow-chart/index",
      name: "FlowChart",
      component: () => import("@/views/flow-chart/index.vue"),
      meta: {
        icon: "hugeicons:flow",
        title: $t("menus.pureFlowChart")
        // hiddenTag: false,
        // showLink: false
      }
    },
    {
      path: "/logic-flow/index",
      name: "LogicFlow",
      component: () => import("@/views/components/logic-flow/index.vue"),
      meta: {
        icon: "clarity:flow-chart-line",
        title: $t("menus.logicFlow")
      }
    }
  ]
} satisfies RouteConfigsTable;
