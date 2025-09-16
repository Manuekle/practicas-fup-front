<template>
  <Layout>
    <PageHeader title="Programas" pageTitle="Listar Programas" />
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
                placeholder="Buscar programas"
              />
            </div>
          </div>

          <!-- Boton:  Nuevo Convenio -->
          <div class="col-12 col-md d-flex justify-content-md-end gap-2">
            <!-- Botón Nuevo Convenio -->
            <router-link
              :to="{ name: 'registrar_programa' }"
              class="btn btn-primary"
            >
              <i class="mdi mdi-plus"></i> Nuevo Programa
            </router-link>
          </div>
        </div>

        <!-- Tabla -->
        <Loader :loading="loading" :transparent="false">
          <BTable
            striped
            hover
            :items="programs"
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
                  aria-label="Editar"
                >
                  <BPopover :delay="{ show: 0, hide: 0 }">
                    <template #target>
                      <router-link
                        :to="{
                          name: 'editar_programa',
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
              </ul>
            </template>
          </BTable>
        </Loader>

        <!-- Paginación -->
        <BPagination
          v-if="programs.length > 0"
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

import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import emptyStateData from "@/assets/lottie/empty-state-2.json";
import apiClient from "@/utils/apiClient";
import { LISTA_PROGRAMAS_URL } from "@/constants/urls";

const route = useRoute();
const router = useRouter();

const programs = ref([]);
const fields = [
  { key: "name", label: "Nombre" },
  { key: "code", label: "Código de programa" },
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

const getPrograms = async () => {
  loading.value = true;
  try {
    actualizarQuery();
    const response = await apiClient.get(LISTA_PROGRAMAS_URL, getParams());
    programs.value = response.results;
    totalItems.value = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const buscar = () => {
  actualizarQuery(true);
  getPrograms()
};

onMounted(() => {
  getPrograms()
});

watch(currentPage, () => {
  getPrograms()
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
      getPrograms()
    }

  }
);

watch(search, (newValue) => {
  if (!newValue) {
    actualizarQuery(true);
    getPrograms()
  }
});
</script>

<style>
</style>
