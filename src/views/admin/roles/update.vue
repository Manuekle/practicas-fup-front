<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import DualPermissionSelector from "@/components/widgets/dualPermission.vue";
import Loader from "@/components/widgets/loader";
import Skeleton from "@/components/widgets/skeleton";

import { ref, computed, onMounted } from "vue";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";
import { useRoute } from "vue-router";

import router from "@/router/index";
import apiClient from "@/utils/apiClient";
import { ACTUALIZAR_ROL, OBTENER_ROL, PERMISOS } from "@/constants/urls";
import { toastError, toastSuccess } from "@/utils/alert";
import { PERMISSIONS_TRANSLATE } from "@/constants/permissions";

const route = useRoute();
const loading = ref(false);
const loadingPermissions = ref(false);
const loadingRole = ref(false);
const form = ref({
  name: null,
  permissions: [],
});
const permissionsPage = ref(1);
const allPermissions = ref([]);

const reglas = computed(() => ({
  name: {
    required: helpers.withMessage("El nombre es obligatorio", required),
  },
  permissions: {
    required: helpers.withMessage("Selecciona los permisos", required),
  },
}));
const roleId = route.params.id;

// Inicializar Vuelidate
const v$ = useVuelidate(reglas, form);

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = ["name", "permissions", "message", "detail"];

  if (data && typeof data === "object") {
    for (const campo of posiblesCampos) {
      const valor = data[campo];

      if (typeof valor === "string") {
        return valor;
      }

      if (Array.isArray(valor) && valor.length > 0) {
        return valor.join(", ");
      }

      if (typeof valor === "object" && valor !== null) {
        const nestedString = Object.values(valor).find(
          (v) => typeof v === "string"
        );
        if (nestedString) return nestedString;
      }
    }
  }

  return "Ocurrió un error inesperado.";
};

const updateRole = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;
  loading.value = true;
  try {
    const url = ACTUALIZAR_ROL(roleId);
    await apiClient.put(url, {
      ...form.value,
    });
    toastSuccess("Rol registrad correctamente");
    router.push({ name: "lista_roles" });
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(getErrorMessage(error));
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  } finally {
    loading.value = false;
  }
};

const loadPermissions = (permissions) => {
  for (let permission of permissions) {
    allPermissions.value.push({
      value: permission.id,
      label: PERMISSIONS_TRANSLATE[permission.codename] || permission.name,
    });
  }
};

const getPermissions = async () => {
  loadingPermissions.value = true;
  try {
    const response = await apiClient.get(PERMISOS, {
      page: permissionsPage.value,
    });
    if (response.next) {
      permissionsPage.value++;
      await getPermissions();
    }
    loadPermissions(response.results);
  } catch (error) {
    toastError("Error al cargar los permisos");
    router.push({ name: "lista_roles" });
  } finally {
    loadingPermissions.value = false;
  }
};

const getRole = async () => {
  loadingRole.value = true;
  try {
    const url = OBTENER_ROL(roleId);
    const response = await apiClient.get(url);
    form.value = response;
  } catch (error) {
    toastError("Error al obtener el rol");
    router.push({ name: "lista_roles" });
  } finally {
    loadingRole.value = false;
  }
};

onMounted(async () => {
  await getRole();
  getPermissions();
});
</script>

<template>
  <Layout>
    <PageHeader title="Registrar rol" pageTitle="Roles"></PageHeader>
    <BCard>
      <Loader :loading="loadingRole">
        <BForm class="p-2" @submit.prevent="updateRole">
          <BRow>
            <BCol sm="12" md="12">
              <BFormGroup
                class="mb-3"
                id="input-name"
                label="Nombre *"
                label-for="name"
              >
                <BFormInput
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="ingrese el nombre del rol"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.name.$error }"
                  @blur="v$.name.$touch()"
                ></BFormInput>
                <div
                  v-for="(item, index) in v$.name.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>
            </BCol>
            <BCol sm="12" md="12">
              <BFormGroup
                class="mb-3"
                id="input-phone"
                label="Asigna los permisos *"
                label-for="phone"
              >
                <div class="row" v-if="loadingPermissions">
                  <div class="col-md-6">
                    <skeleton />
                    <skeleton />
                    <skeleton />
                    <skeleton />
                    <skeleton />
                  </div>
                </div>
                <DualPermissionSelector
                  v-else
                  v-model="form.permissions"
                  :options="allPermissions"
                />
              </BFormGroup>
              <div
                v-for="(item, index) in v$.name.$errors"
                :key="index"
                class="invalid-feedback"
              >
                <span v-if="item.$message">{{ item.$message }}</span>
              </div>
            </BCol>
          </BRow>
          <BButton
            type="submit"
            :disabled="loading || v$.$invalid"
            variant="primary"
          >
            <BSpinner v-if="loading" small />
            <span v-else>Guardar</span>
          </BButton>
        </BForm>
      </Loader>
    </BCard>
  </Layout>
</template>

<style>
</style>