<template>
  <Layout>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Ofertas de Prácticas</h3>
      <router-link to="/ofertapractica/crear" class="btn btn-primary">
        <i class="mdi mdi-plus"></i> Nueva Oferta
      </router-link>
    </div>

    <div class="mb-3 input-group">
      <span class="input-group-text">
        <i class="mdi mdi-magnify"></i>
      </span>
      <input
        v-model="search"
        @keyup.enter="buscar"
        class="form-control"
        placeholder="Buscar ofertas por título..."
      />
    </div>

    <Loader :loading="loading" :transparent="false">
      <b-table
        :items="ofertas"
        :fields="campos"
        responsive
        hover
        bordered
        show-empty
      >
        <template #empty>
          <div class="text-center py-4 text-muted">
            No hay ofertas disponibles.
          </div>
        </template>

        <template #cell(actions)="data">
          <ul class="list-unstyled hstack gap-1 mb-0">
            <li>
              <b-popover :delay="{ show: 0, hide: 0 }" title="Editar">
                <template #target>
                  <router-link
                    :to="{
                      name: 'ofertapractica_editar',
                      params: { id: data.item.id },
                    }"
                    class="btn btn-sm btn-soft-primary"
                    ref="setRef"
                  >
                    <i class="mdi mdi-pencil-outline"></i>
                  </router-link>
                </template>
              </b-popover>
            </li>
            <li>
              <router-link
                :to="`/ofertapractica/${data.item.id}/detalle`"
                class="btn btn-sm btn-soft-primary"
              >
                <i class="mdi mdi-eye-outline"></i> 
              </router-link>
            </li>
          </ul>
        </template>
      </b-table>
    </Loader>

    <b-pagination
      v-if="totalItems > itemsPorPagina"
      v-model="currentPage"
      :total-rows="totalItems"
      :per-page="itemsPorPagina"
      align="end"
      pills
      class="mt-3"
    />
  </Layout>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Layout from "@/layouts/main";
import apiClient from "@/utils/apiClient";
import Loader from "@/components/widgets/loader";

const route = useRoute();
const router = useRouter();

const ofertas = ref([]);
const totalItems = ref(0);
const loading = ref(true);
const currentPage = ref(Number(route.query.page) || 1);
const itemsPorPagina = ref(10); // para paginación
const search = ref(route.query.search || "");

const campos = [
  { key: "title", label: "Título" },
  { key: "close_date", label: "Fecha de Cierre" },
  { key: "vacancies", label: "Vacantes" },
  { key: "agreement", label: "Convenio" },
  { key: "actions", label: "Acciones" },
];

const actualizarQuery = () => {
  router.replace({
    query: {
      page: currentPage.value !== 1 ? currentPage.value : undefined,
      search: search.value || undefined,
    },
  });
};

const cargarOfertas = async () => {
  loading.value = true;
  try {
    actualizarQuery();
    const response = await apiClient.get("practical-offers", {
        page: currentPage.value,
        search: search.value || undefined,
    });
    ofertas.value = response.results;
    totalItems.value = response.count;
  } catch (err) {
    console.error("Error cargando ofertas:", err);
    ofertas.value = [];
  } finally {
    loading.value = false;
  }
};

const buscar = () => {
  currentPage.value = 1;
  cargarOfertas();
};

onMounted(() => {
  cargarOfertas();
});

watch(currentPage, () => {
  cargarOfertas();
});

watch(search, (val) => {
  if (!val) buscar();
});
</script>
