import { $t } from "@/plugins/i18n";
import { formCreate } from "@/router/enums";

export default {
  path: "/form-create",
  redirect: "/form-creator/index",
  meta: {
    icon: "vaadin:form",
    title: $t("menus.formCreate"),
    rank: formCreate
  },
  children: [
    {
      path: "/form-designer/index",
      name: "FormDesigner",
      component: () =>
        import("@/views/components/form-create/form-designer/index.vue"),
      meta: {
        icon: "streamline-ultimate:responsive-design-hand",
        title: $t("menus.formDesigner")
      }
    },
    {
      path: "/form-creator/index",
      name: "FormCreator",
      component: () =>
        import("@/views/components/form-create/form-creator/index.vue"),
      meta: {
        icon: "fluent:form-new-20-filled",
        title: $t("menus.formCreator")
      }
    }
  ]
} satisfies RouteConfigsTable;
