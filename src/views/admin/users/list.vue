<template>
  <Layout>
    <PageHeader title="Usuarios" pageTitle="Listar Usuarios" />
    <BCard>
      <BCardText>
        <div class="row g-2 align-items-center mb-3">
          <!-- Buscador -->
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="mdi mdi-magnify"></i>
              </span>
              <input
                type="text"
                v-model="search"
                @keyup.enter="buscar"
                class="form-control"
                placeholder="Buscar Usuarios"
              />
            </div>
          </div>

          <!-- Boton:  Nuevo Convenio -->
          <div class="col-12 col-md d-flex justify-content-md-end gap-2">
            <!-- Botón Nuevo Convenio -->
            <router-link
              :to="{ name: 'crear_usuario' }"
              class="btn btn-primary"
            >
              <i class="mdi mdi-plus"></i> Nuevo Usuario
            </router-link>
          </div>
        </div>

        <!-- Tabla -->
        <Loader :loading="loading" :transparent="false">
          <BTable
            striped
            hover
            :items="users"
            :fields="fields"
            bordered
            responsive
            show-empty
          >
            <template #cell(is_active)=data>
              {{ data.item.is_active ? "Si": "No" }}
            </template>
            <template #empty>
              <LottieAnimation :animationData="emptyStateData" />
            </template>
            <template #cell(actions)="data">
              <ul class="list-unstyled hstack gap-1 mb-0">
                <li
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  aria-label="Editar"
                >
                  <BPopover :delay="{ show: 0, hide: 0 }">
                    <template #target>
                      <router-link
                        :to="{
                          name: 'editar_usuario',
                          params: { id: data.item.id },
                        }"
                        class="btn btn-sm btn-soft-primary"
                      >
                        <i class="mdi mdi-pencil-outline"></i>
                      </router-link>
                    </template>
                    Editar
                  </BPopover>
                </li>
                <li
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  :aria-label="data.item.is_active ? 'Inactivar' : 'Activar'"
                >
                  <BPopover :delay="{ show: 0, hide: 0 }">
                    <template #target>
                      <button
                        class="btn btn-sm btn-soft-warning"
                        @click="
                          toggleStatus(
                            data.item.id,
                            data.item.status,
                            data.item.first_name
                          )
                        "
                      >
                        <i
                          :class="
                            data.item.is_active
                              ? 'mdi mdi-toggle-switch-off'
                              : 'mdi mdi-toggle-switch'
                          "
                        >
                        </i>
                      </button>
                    </template>
                    {{ data.item.is_active ? "Inactivar" : "Activar" }}
                  </BPopover>
                </li>
              </ul>
            </template>
          </BTable>
        </Loader>

        <!-- Paginación -->
        <BPagination
          v-if="users.length > 0"
          v-model="currentPage"
          :total-rows="totalItems"
          :per-page="perPage"
          aria-controls="student-table"
          pills
          align="end"
        />
      </BCardText>
    </BCard>
  </Layout>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import emptyStateData from "@/assets/lottie/empty-state-2.json";
import apiClient from "@/utils/apiClient";
import { LISTA_USUARIOS, ACTIVARINACTIVAR_USUARIO } from "@/constants/urls";
import { toastSuccess, toastError } from "@/utils/alert";

const route = useRoute();
const router = useRouter();

const users = ref([]);
const fields = [
  { key: "first_name", label: "Nombres" },
  { key: "last_name", label: "Apellidos" },
  { key: "email", label: "Correo" },
  { key: "role", label: "Rol" },
  { key: "is_active", label: "Activo" },
  { key: "actions", label: "Acciones" },
];
const loading = ref(true);
const currentPage = ref(Number(route.query.page) || 1);
const perPage = ref(10);
const totalItems = ref(0);
const search = ref(route.query.search || "");

const actualizarQuery = (reiniciarPagina = false) => {
  const nuevaPagina = reiniciarPagina ? 1 : currentPage.value;

  router.replace({
    query: {
      ...route.query,
      page: nuevaPagina !== 1 ? nuevaPagina : undefined,
      search: search.value || undefined,
    },
  });

  if (reiniciarPagina) {
    currentPage.value = 1;
  }
};

const getParams = () => {
  const params = {
    page: currentPage.value || undefined,
    search: search.value || undefined,
  };
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) delete params[key];
  });
  return params;
};

const getUsers = async () => {
  loading.value = true;
  try {
    actualizarQuery();
    const response = await apiClient.get(LISTA_USUARIOS, getParams());
    users.value = response.results;
    totalItems.value = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const buscar = () => {
  actualizarQuery(true);
  getUsers();
};

const toggleStatus = async (id, is_active, first_name) => {
  const action = is_active ? "Inactivar" : "Activar";
  const url = ACTIVARINACTIVAR_USUARIO(id);
  Swal.fire({
    title: `¿Estas seguro de ${action} el usuario ${first_name}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await apiClient.post(url);
        toastSuccess("Operación realizada.");
        getUsers();
      } catch (error) {
        toastError("Error desconocido intenta más tarde");
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });
};

onMounted(() => {
  getUsers();
});

watch(currentPage, () => {
  getUsers();
});

watch(
  () => route.query,
  (query) => {
    const nuevaPagina = Number(query.page) || 1;
    if (currentPage.value !== nuevaPagina) {
      currentPage.value = nuevaPagina;
    }

    const nuevasearch = query.search || "";
    if (search.value !== nuevasearch) {
      search.value = nuevasearch;
      getUsers();
    }
  }
);

watch(search, (newValue) => {
  if (!newValue) {
    getUsers();
    actualizarQuery(true);
  }
});
</script>

<style>
</style>
