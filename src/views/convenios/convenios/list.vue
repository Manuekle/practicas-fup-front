<template>
  <Layout>
    <PageHeader title="Convenios" pageTitle="Listar Convenio" />
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
                placeholder="Buscar convenios..."
              />
            </div>
          </div>

          <!-- Botones: Filtro y Nuevo Convenio -->
          <div class="col-12 col-md d-flex justify-content-md-end gap-2">
            <!-- Botón Filtro -->
            <button
              class="btn btn-outline-secondary"
              @click="show = true"
              aria-label="Filtrar"
            >
              <i class="mdi mdi-filter-variant"></i>
            </button>

            <!-- Botón Nuevo Convenio -->
            <router-link
              :to="{ name: 'convenios_crear' }"
              class="btn btn-primary"
              v-if="hasPerm(PERMISSIONS.AGREGAR_CONVENIO)"
            >
              <i class="mdi mdi-plus"></i> Nuevo Convenio
            </router-link>
          </div>
        </div>

        <!-- Tabla -->
        <Loader :loading="loading" :transparent="false">
          <BTable
            striped
            hover
            :items="convenios"
            :fields="fields"
            bordered
            responsive
            show-empty
          >
            <template #empty>
              <LottieAnimation :animationData="emptyStateData" />
            </template>
            <template #cell(actions)="data">
              <ul class="list-unstyled hstack gap-1 mb-0">
                <li
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  aria-label="Ver"
                  v-if="hasPerm(PERMISSIONS.VER_CONVENIO)"
                >
                  <BPopover :delay="{ show: 0, hide: 0 }">
                    <template #target>
                      <router-link
                        :to="{
                          name: 'convenios_detalle',
                          params: { id: data.item.id },
                        }"
                        class="btn btn-sm btn-soft-primary"
                      >
                        <i class="mdi mdi-eye-outline"></i>
                      </router-link>
                    </template>
                    Ver
                  </BPopover>
                </li>
                <li
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  aria-label="Editar"
                  v-if="hasPerm(PERMISSIONS.EDITAR_CONVENIO)"
                >
                  <BPopover :delay="{ show: 0, hide: 0 }">
                    <template #target>
                      <router-link
                        :to="{
                          name: 'convenios_editar',
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
                  :aria-label="
                    data.item.status == 'ACTIVO' ? 'Inactivar' : 'Activar'
                  "
                  v-if="hasPerm(PERMISSIONS.CAMBIAR_ESTADO_CONVENIO)"
                >
                  <BPopover :delay="{ show: 0, hide: 0 }">
                    <template #target>
                      <button
                        class="btn btn-sm btn-soft-warning"
                        @click="
                          toggleStatus(
                            data.item.id,
                            data.item.status,
                            data.item.name
                          )
                        "
                      >
                        <i
                          :class="
                            data.item.status == 'ACTIVO'
                              ? 'mdi mdi-toggle-switch-off'
                              : 'mdi mdi-toggle-switch'
                          "
                        >
                        </i>
                      </button>
                    </template>
                    {{ data.item.status == "ACTIVO" ? "Inactivar" : "Activar" }}
                  </BPopover>
                </li>
              </ul>
            </template>
          </BTable>
        </Loader>

        <!-- Paginación -->
        <BPagination
          v-if="convenios.length > 0"
          v-model="currentPage"
          :total-rows="totalItems"
          :per-page="perPage"
          aria-controls="agreement-table"
          pills
          align="end"
        />
      </BCardText>
    </BCard>
    <!-- Offcanvas filters -->
    <BOffcanvas v-model="show" :placement="placement" title="Filtrar Convenios">
      <div class="mb-3">
        <label class="form-label">Estado</label>
        <select v-model="filters.status" class="form-select">
          <option value="">Todos</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="VENCIDO">Vencido</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Tipo de convenio</label>
        <select v-model="filters.agreement_type" class="form-select">
          <option value="">Todos</option>
          <option value="MACRO">Macro</option>
          <option value="ESPECÍFICO">Específico</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Estado de documentación</label>
        <select v-model="filters.documentation_status" class="form-select">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="INCOMPLETA">Incompleta</option>
          <option value="COMPLETA">Completa</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Alcance</label>
        <select v-model="filters.scope" class="form-select">
          <option value="">Todos</option>
          <option value="NACIONAL">Nacional</option>
          <option value="INTERNACIONAL">Internacional</option>
        </select>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" @click="resetfilters">Limpiar</button>
        <button class="btn btn-primary" @click="aplicarfilters">Aplicar</button>
      </div>
    </BOffcanvas>
  </Layout>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { isAxiosError } from "axios";

import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import emptyStateData from "@/assets/lottie/empty-state-2.json";
import apiClient from "@/utils/apiClient";
import {
  LISTA_CONVENIO_URL,
  ACTUALIZAR_ESTADO_CONVENIO,
} from "@/constants/urls";
import { usePermissions } from "@/composables/userPermissions";
import { PERMISSIONS } from "@/constants/permissions";
import { toastSuccess, toastError } from "@/utils/alert";

const { hasPerm } = usePermissions();
const route = useRoute();
const router = useRouter();

const convenios = ref([]);
const fields = [
  { key: "name", label: "Nombre" },
  { key: "status", label: "Estado" },
  { key: "agreement_type", label: "Tipo de convenio" },
  { key: "scope", label: "Alcance" },
  { key: "initial_date", label: "Fecha de inicio" },
  { key: "end_date", label: "Fecha de finalización" },
  { key: "documentation_status", label: "Estado documentación" },
  { key: "actions", label: "Acciones" },
];
const loading = ref(true);
const show = ref(false);
const placement = "end";
const currentPage = ref(Number(route.query.page) || 1);
const perPage = ref(10);
const totalItems = ref(0);
const search = ref(route.query.search || "");
const filters = ref({
  status: "",
  agreement_type: "",
  documentation_status: "",
  scope: "",
});

const actualizarQuery = (reiniciarPagina = false) => {
  const nuevaPagina = reiniciarPagina ? 1 : currentPage.value;

  router.replace({
    query: {
      ...route.query,
      page: nuevaPagina !== 1 ? nuevaPagina : undefined,
      search: search.value || undefined,
      status: filters.value.status || undefined,
      agreement_type: filters.value.agreement_type || undefined,
      documentation_status: filters.value.documentation_status || undefined,
      scope: filters.value.scope || undefined,
    },
  });

  if (reiniciarPagina) {
    currentPage.value = 1;
  }
};

const aplicarfilters = () => {
  show.value = false;
  actualizarQuery(true);
  obtenerConvenios();
};

const resetfilters = () => {
  filters.value = {
    status: "",
    agreement_type: "",
    documentation_status: "",
    scope: "",
  };
  aplicarfilters();
};

const getParams = () => {
  const params = {
    page: currentPage.value || undefined,
    search: search.value || undefined,
    status: filters.value.status || undefined,
    agreement_type: filters.value.agreement_type || undefined,
    documentation_status: filters.value.documentation_status || undefined,
    scope: filters.value.scope || undefined,
  };
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) delete params[key];
  });
  return params;
};

const obtenerConvenios = async () => {
  loading.value = true;
  try {
    actualizarQuery();
    const response = await apiClient.get(LISTA_CONVENIO_URL, getParams());
    convenios.value = response.results;
    totalItems.value = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const buscar = () => {
  actualizarQuery(true);
  obtenerConvenios();
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = ["message"];

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

const toggleStatus = async (id, status, agreement) => {
  const action = status == "ACTIVO" ? "Inactivar" : "Activar";
  const url = ACTUALIZAR_ESTADO_CONVENIO(id);
  Swal.fire({
    title: `¿Estas seguro de ${action} el convenio ${agreement}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await apiClient.post(url);
        toastSuccess("Operación realizada.");
        obtenerConvenios();
      } catch (error) {
        if (isAxiosError(error)) {
          toastError(getErrorMessage(error));
        } else {
          toastError("Error desconocido intenta más tarde");
        }
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });
};

onMounted(() => {
  filters.value.status = route.query.status || "";
  filters.value.agreement_type = route.query.agreement_type || "";
  filters.value.documentation_status = route.query.documentation_status || "";
  filters.value.scope = route.query.scope || "";
  console.log(hasPerm(PERMISSIONS.VER_CONVENIO));
  if (!hasPerm(PERMISSIONS.VER_CONVENIO)) {
    router.push({ name: "unauthorized" });
    return;
  }
  obtenerConvenios();
});

watch(currentPage, () => {
  obtenerConvenios();
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
      obtenerConvenios();
    }

    const newStatus = query.status || "";
    const newType = query.agreement_type || "";
    const newDocStatus = query.documentation_status || "";
    const newScope = query.scope || "";

    if (
      filters.value.status !== newStatus ||
      filters.value.agreement_type !== newType ||
      filters.value.documentation_status !== newDocStatus ||
      filters.value.scope !== newScope
    ) {
      filters.value.status = newStatus;
      filters.value.agreement_type = newType;
      filters.value.documentation_status = newDocStatus;
      filters.value.scope = newScope;
      obtenerConvenios();
    }
  }
);

watch(search, (newValue) => {
  if (!newValue) {
    obtenerConvenios();
    actualizarQuery(true);
  }
});
</script>

<style>
</style>
