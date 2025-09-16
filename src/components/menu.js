export const menuItems = [
  {
    id: 1,
    label: "menuitems.menu.text",
    isTitle: true,
  },
  {
    id: 2,
    label: "menuitems.dashboards.text",
    icon: "bx-home-circle",
    subItems: [
      {
        id: 3,
        label: "menuitems.dashboards.list.default",
        link: "/",
        parentId: 2,
      },
    ],
  },
  {
    id: 4,
    isLayout: true,
  },
  {
    id: 5,
    label: "menuitems.pages.text",
    isTitle: true,
  },
  {
    id: 6,
    label: "menuitems.admin.text",
    icon: "bx-share-alt",
    subItems: [
      {
        id: 7,
        label: "menuitems.admin.list.users.text",
        parentId: 6,
        subItems: [
          {
            id: 8,
            label: "menuitems.admin.list.users.create",
            link: "/usuarios/crear",
            parentId: 7,
          },
          {
            id: 9,
            label: "menuitems.admin.list.users.list",
            link: "/usuarios",
            parentId: 7,
          },
        ],
      },
      {
        id: 36,
        label: "menuitems.admin.list.role.text",
        parentId: 6,
        subItems: [
          {
            id: 37,
            label: "menuitems.admin.list.role.create",
            link: "/roles/crear",
            parentId: 36,
          },
          {
            id: 38,
            label: "menuitems.admin.list.role.list",
            link: "/roles",
            parentId: 36,
          },
        ],
      },
    ],
  },
  {
    id: 10,
    label: "menuitems.convenios.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 11,
        label: "menuitems.convenios.list.list",
        link: "/convenios/",
        parentId: 10,
      },
      {
        id: 12,
        label: "menuitems.convenios.list.create",
        link: "/convenios/crear",
        parentId: 10,
      },
    ],
  },
  {
    id: 13,
    label: "menuitems.documentos.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 14,
        label: "menuitems.documentos.list.create",
        link: "/documentos/crear",
        parentId: 13,
      },
      {
        id: 15,
        label: "menuitems.documentos.list.list",
        link: "/documentos/",
        parentId: 13,
      },
    ],
  },
  {
    id: 16,
    label: "menuitems.empresas.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 17,
        label: "menuitems.empresas.list.create",
        link: "/empresas/registrar",
        parentId: 16,
      },
      {
        id: 18,
        label: "menuitems.empresas.list.list",
        link: "/empresas/",
        parentId: 16,
      },
    ],
  },
  {
    id: 19,
    label: "menuitems.practica.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 20,
        label: "menuitems.practica.list.create",
        link: "/practica/crear",
        parentId: 19,
      },
      {
        id: 21,
        label: "menuitems.practica.list.list",
        link: "/practica",
        parentId: 19,
      },
    ],
  },
  {
    id: 22,
    label: "menuitems.ofertapractica.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 23,
        label: "menuitems.ofertapractica.list.create",
        link: "/ofertapractica/crear",
        parentId: 22,
      },
      {
        id: 24,
        label: "menuitems.ofertapractica.list.list",
        link: "/ofertapractica",
        parentId: 22,
      },
    ],
  },
  {
    id: 25,
    label: "menuitems.estudiante.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 26,
        label: "menuitems.estudiante.list.create",
        link: "/estudiantes/registrar",
        parentId: 25,
      },
      {
        id: 27,
        label: "menuitems.estudiante.list.list",
        link: "/estudiantes/",
        parentId: 25,
      },
    ],
  },
  {
    id: 28,
    label: "menuitems.docente.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 29,
        label: "menuitems.docente.list.create",
        link: "/docentes/registrar",
        parentId: 28,
      },
      {
        id: 30,
        label: "menuitems.docente.list.list",
        link: "/docentes/",
        parentId: 28,
      },
    ],
  },
  {
    id: 31,
    label: "menuitems.programa.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 32,
        label: "menuitems.programa.list.create",
        link: "/programas/registrar",
        parentId: 31,
      },
      {
        id: 33,
        label: "menuitems.programa.list.list",
        link: "/programas/",
        parentId: 31,
      },
    ],
  },
  {
    id: 34,
    label: "menuitems.sustentacion.text",
    icon: "bx-user-circle",
    subItems: [
      {
        id: 35,
        label: "menuitems.sustentacion.list.create",
        link: "/sustentaciones/registrar",
        parentId: 34,
      },
      {
        id: 36,
        label: "menuitems.sustentacion.list.list",
        link: "/sustentaciones/",
        parentId: 34,
      },
    ],
  },
];
