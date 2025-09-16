import { PERMISSIONS } from "@/constants/permissions"
import { useAuthStore } from "@/state/pinia";
export default [
  {
    path: "/",
    name: "default",
    meta: { title: "Dashboard", authRequired: true },
    component: () => import("../views/dashboards/default"),
  },
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: () => import("../views/utility/403"),
    meta: {
      title: "Sin Permisos",
      authRequired: true
    }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/account/login"),
    meta: {
      title: "Login",
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // If the user is already logged in
        // if (store.getters["auth/loggedIn"]) {
        if (auth.loggedIn) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/registrarse",
    name: "Register",
    component: () => import("../views/account/register"),
    meta: {
      title: "Crear cuenta",
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // If the user is already logged in
        // if (store.getters["auth/loggedIn"]) {
        if (auth.loggedIn) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/recuperar-contrasena",
    name: "Forgot password",
    component: () => import("../views/account/forgot-password"),
    meta: {
      title: "Recuperar contraseña",
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // If the user is already logged in
        // if (store.getters["auth/loggedIn"]) {
        if (auth.loggedIn) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/usuarios/contrasena/restablecer/confirmar/:uid/:token",
    name: "reset_password_confirm",
    component: () => import("../views/account/confirm-reset-password.vue"),
    meta: {
      title: "Confirmar cambio de contraseña",
      beforeResolve(routeTo, routeFrom, next) {
        const auth = useAuthStore();
        // If the user is already logged in
        // if (store.getters["auth/loggedIn"]) {
        if (auth.loggedIn) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/logout",
    name: "logout",
    component: () => import("../views/account/logout"),
    meta: {
      title: "Logout",
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        // const auth = useAuthStore();

        const authRequiredOnPreviousRoute = routeFrom.matched.some((route) =>
          route.push("/login")
        );
        // Navigate back to previous page, or home as a fallback
        next(
          authRequiredOnPreviousRoute ? { name: "default" } : { ...routeFrom }
        );
      },
    },
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  // {
  //   path: "*",
  //   redirect: "404",
  // },

  {
    path: "/usuarios/cambiar-contrasena",
    name: "password_change",
    meta: { title: "Cambiar contraseña", authRequired: true },
    component: () => import("../views/account/cambiar-contrasena.vue"),
  },

  // --------------------------- RUTAS DE CONVENIO --------------------------- 
  {
    path: "/convenios/",
    name: "convenios_lista",
    meta: {
      title: "Lista de convenios",
      authRequired: true,
      requiredPermission: PERMISSIONS.VER_CONVENIO
    },
    component: () => import("../views/convenios/convenios/list.vue"),
  },
  {
    path: "/convenios/:id",
    name: "convenios_detalle",
    meta: {
      title: "Detalle de convenio",
      authRequired: true,
      requiredPermission: PERMISSIONS.VER_CONVENIO
    },
    component: () => import("../views/convenios/convenios/detalle.vue"),
  },
  {
    path: "/convenios/crear",
    name: "convenios_crear",
    meta: {
      title: "Crear convenio",
      authRequired: true,
      requiredPermission: PERMISSIONS.AGREGAR_CONVENIO
    },
    component: () => import("../views/convenios/convenios/crear.vue"),
  },
  {
    path: "/convenios/:id/editar",
    name: "convenios_editar",
    meta: {
      title: "Editar convenio",
      authRequired: true,
      requiredPermission: PERMISSIONS.EDITAR_CONVENIO
    },
    component: () => import("../views/convenios/convenios/editar.vue"),
  },
  // --------------------------- RUTAS DE PRACTICAS --------------------------- 
  {
    path: "/practica/",
    name: "practica_list",
    component: () => import("../views/practica/practica/list.vue"),
  },
  {
    path: "/practica/crear",
    name: "practica_crear",
    meta: { 
      title: "Crear practica",
      authRequired: true, 
      requiredPermission: PERMISSIONS.AGREGAR_PRACTICA
    },
    component: () => import("../views/practica/practica/crear.vue"),
  },
  {
    path: "/practica/:id",
    name: "practica_detalle",
    component: () => import("../views/practica/practica/detalle.vue"),
  },
  {
    path: "/practica/:id/editar",
    name: "practica_editar",
    component: () => import("../views/practica/practica/editar.vue"),
  },
  {
    path: "/practica/:id/seguimiento",
    name: "practica_seguimiento",
    component: () => import("../views/practica/practica/seguimiento.vue"),
  },



  // --------------------------- RUTAS DE DOCUMENTOS DE CONVENIO --------------------------- 


  {
    path: "/documentos/crear",
    name: "crear_documento",
    meta: {
      title: "Crear documento",
      authRequired: true,
      requiredPermission: PERMISSIONS.CREAR_DOCUMENTO_DE_CONVENIO
    },
    component: () => import("../views/convenios/documentos/crear.vue"),
  },
  {
    path: "/documentos/",
    name: "listar_documento",
    meta: {
      title: "Lista de documentos",
      authRequired: true,
      requiredPermission: PERMISSIONS.VER_DOCUMENTO_DE_CONVENIO
    },
    component: () => import("../views/convenios/documentos/list.vue"),
  },
  {
    path: "/documentos/:id/editar",
    name: "editar_documento",
    meta: {
      title: "Editar documento",
      authRequired: true,
      requiredPermission: PERMISSIONS.EDITAR_DOCUMENTO_DE_CONVENIO
    },
    component: () => import("../views/convenios/documentos/edit.vue"),
  },

  // --------------------------- RUTAS DE EMPRESA --------------------------- 

  {
    path: "/empresas/registrar",
    name: "registrar_empresas",
    meta: {
      title: "Registrar empresa",
      authRequired: true,
      requiredPermission: PERMISSIONS.AGREGAR_EMPRESA
    },
    component: () => import("../views/empresas/crear.vue"),
  },
  {
    path: "/empresas/",
    name: "lista_empresas",
    meta: {
      title: "Lista de empresas",
      authRequired: true,
      requiredPermission: PERMISSIONS.VER_EMPRESA
    },
    component: () => import("../views/empresas/lista.vue"),
  },
  {
    path: "/empresas/:id/editar",
    name: "editar_empresa",
    meta: {
      title: "Editar empresa",
      authRequired: true,
      requiredPermission: PERMISSIONS.EDITAR_EMPRESA
    },
    component: () => import("../views/empresas/editar.vue"),
  },

  // --------------------------- RUTAS DE ESTUDIANTE --------------------------- 
  {
    path: "/estudiantes/registrar",
    name: "registrar_estudiantes",
    meta: {
      title: "Registrar estudiante",
      authRequired: true,
      requiredPermission: PERMISSIONS.AGREGAR_ESTUDIANTE
    },
    component: () => import("../views/estudiantes/crear.vue"),
  },
  {
    path: "/estudiantes/",
    name: "lista_estudiantes",
    meta: {
      title: "Lista de estudiantes",
      authRequired: true,
      requiredPermission: PERMISSIONS.VER_ESTUDIANTE
    },
    component: () => import("../views/estudiantes/lista.vue"),
  },
  {
    path: "/estudiantes/:id/editar",
    name: "editar_estudiante",
    meta: {
      title: "Actualizar estudiante",
      authRequired: true,
      requiredPermission: PERMISSIONS.EDITAR_ESTUDIANTE
    },
    component: () => import("../views/estudiantes/editar.vue"),
  },

  // --------------------------- RUTAS DE DOCENTE --------------------------- 

  {
    path: "/docentes/registrar",
    name: "registrar_docentes",
    meta: {
      title: "Registrar docente",
      authRequired: true,
      requiredPermission: PERMISSIONS.AGREGAR_DOCENTE
    },
    component: () => import("../views/docentes/crear.vue"),
  },
  {
    path: "/docentes/",
    name: "lista_docentes",
    meta: {
      title: "Lista de docentes",
      authRequired: true,
      requiredPermission: PERMISSIONS.VER_DOCENTE
    },
    component: () => import("../views/docentes/lista.vue"),
  },
  {
    path: "/docentes/:id/editar",
    name: "editar_docente",
    meta: { 
      title: "Actualizar docente", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.EDITAR_DOCENTE 
    },
    component: () => import("../views/docentes/editar.vue"),
  },

  // --------------------------- RUTAS DE PROGRAMA --------------------------- 
  {
    path: "/programas/",
    name: "lista_programas",
    meta: { 
      title: "Lista de programas", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_PROGRAMA
    },
    component: () => import("../views/programas/lista.vue"),
  },
  {
    path: "/programas/registrar",
    name: "registrar_programa",
    meta: { 
      title: "Registrar programa", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.AGREGAR_PROGRAMA
    },
    component: () => import("../views/programas/crear.vue"),
  },
  {
    path: "/programas/:id/editar",
    name: "editar_programa",
    meta: { 
      title: "Actualizar programa", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.EDITAR_PROGRAMA
    },
    component: () => import("../views/programas/editar.vue"),
  },

  // --------------------------- RUTAS DE SUSTENTACIONES --------------------------- 
  {
    path: "/sustentaciones/",
    name: "lista_sustentaciones",
    meta: { 
      title: "Lista de sustentaciones", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_SUSTENTACION
    },
    component: () => import("../views/sustentaciones/lista.vue"),
  },
  {
    path: "/sustentaciones/registrar",
    name: "registrar_sustentacion",
    meta: { 
      title: "Registrar sustentación", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.AGREGAR_SUSTENTACION
    },
    component: () => import("../views/sustentaciones/crear.vue"),
  },
  {
    path: "/sustentaciones/:id/editar",
    name: "editar_sustentacion",
    meta: { 
      title: "Actualizar sustentación", 
      authRequired: true,
      requiredPermission: PERMISSIONS.EDITAR_SUSTENTACION
    },
    component: () => import("../views/sustentaciones/editar.vue"),
  },
  {
    path: "/sustentaciones/:id/detalle",
    name: "detalle_sustentacion",
    meta: { 
      title: "Detalle sustentación", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_SUSTENTACION
    },
    component: () => import("../views/sustentaciones/detalle.vue"),
  },

  // --------------------------- RUTAS DE OFERTA PRACTICA --------------------------- 

  {
    path: "/ofertapractica",
    name: "ofertapractica_list" ,
  meta: { title: "Lista de oferta practica", authRequired: true },
    component: () => import("../views/ofertapractica/ofertapractica/lista.vue"),
  },
  {
    path: "/ofertapractica/crear",
    name: "oferta_practica_crear",
    meta: { 
      title: "Crear oferta practica", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.AGREGAR_OFERTA_PRACTICA
    },
    component: () => import("../views/ofertapractica/ofertapractica/crear.vue"),
  },
  {
    path: "/ofertapractica/:id",
    name: "oferta_practica_detalle",
    meta: { 
      title: "Detalle oferta practica",
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_OFERTA_PRACTICA
    },
    component: () => import("../views/ofertapractica/ofertapractica/detalle.vue"),
  },
  {
    path: "/ofertapractica/:id/editar",
    name: "ofertapractica_editar",
    meta: { 
      title: "Editar oferta practica", 
      authRequired: true, 
      requiredPermission: PERMISSIONS.EDITAR_OFERTA_PRACTICA
    },
    component: () => import("../views/ofertapractica/ofertapractica/editar.vue"),
  },
  {
    path: "/ofertapractica/:id/detalle",
    name: "ofertapractica_detalle",
    meta: { title: "Detalle oferta practica", authRequired: true },
    component: () => import("../views/ofertapractica/ofertapractica/detalle.vue"),
    props: true
  },
  
  // Urls de usuarios
  {
    path: "/usuarios",
    name: "lista_usuarios",
    meta: { 
      title: "Lista de usuarios",
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_OFERTA_PRACTICA
    },
    component: () => import("../views/admin/users/list.vue"),
  },
  {
    path: "/usuarios/crear",
    name: "crear_usuario",
    meta: { 
      title: "Crear usuario",
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_OFERTA_PRACTICA
    },
    component: () => import("../views/admin/users/create.vue"),
  },
  {
    path: "/usuarios/:id/editar",
    name: "editar_usuario",
    meta: { 
      title: "Editar usuario",
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_OFERTA_PRACTICA
    },
    component: () => import("../views/admin/users/update.vue"),
  },

  // Urls de roles
  {
    path: "/roles",
    name: "lista_roles",
    meta: { 
      title: "Lista de roles",
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_OFERTA_PRACTICA
    },
    component: () => import("../views/admin/roles/list.vue"),
  },
  {
    path: "/roles/crear",
    name: "crear_role",
    meta: { 
      title: "Crear rol",
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_OFERTA_PRACTICA
    },
    component: () => import("../views/admin/roles/create.vue"),
  },
  {
    path: "/roles/:id/editar",
    name: "editar_role",
    meta: { 
      title: "Editar rol",
      authRequired: true, 
      requiredPermission: PERMISSIONS.VER_OFERTA_PRACTICA
    },
    component: () => import("../views/admin/roles/update.vue"),
  },

];

