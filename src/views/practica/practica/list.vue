<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import { ref, onMounted, watch } from "vue";
import apiClient from "@/utils/apiClient";
import { LISTA_PRACTICA_URL } from "@/constants/urls";
import { toastError } from "@/utils/alert";
import { useRouter } from "vue-router";
import LottieAnimation from "@/components/widgets/lottieAnimation";
import emptyStateData from "@/assets/lottie/empty-state-2.json";

const fields = [
  { key: "student", label: "Estudiante" },
  { key: "teacher", label: "Docente" },
  { key: "program", label: "Programa" },
  { key: "agreement", label: "Convenio" },
  { key: "initial_date", label: "Fecha inicial" },
  { key: "end_date", label: "Fecha final" },
  { key: "status", label: "Estado" },
  { key: "practical_offer", label: "Oferta práctica" },
  { key: "actions", label: "Acciones" },
];

const router = useRouter();
const practicas = ref([]);
const total = ref(0);
const currentPage = ref(1);
const perPage = ref(10);
const loading = ref(false);

const fetchPractica = async () => {
  loading.value = true;
  try {
    const data = await apiClient.get(LISTA_PRACTICA_URL, {
      params: {
        page: currentPage.value,
      },
    });
    practicas.value = data.results;
    total.value = data.count;
  } catch (err) {
    console.error(err);
    toastError("Error al cargar las prácticas");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPractica);
watch(currentPage, fetchPractica);
</script>

<template>
  <Layout>
    <PageHeader title="Listado de prácticas" pageTitle="Práctica" />
    <b-card>
      <div class="d-flex justify-content-end mb-3">
        <b-button variant="primary" @click="router.push({ name: 'practica_crear' })">
          + Crear práctica
        </b-button>
      </div>

      <b-table
        striped
        hover
        :items="practicas"
        :fields="fields"
        bordered
        responsive
        show-empty
      >
        <template #empty>
          <LottieAnimation :animationData="emptyStateData" />
        </template>

        <template #cell(actions)="row">
          <ul class="list-unstyled hstack gap-1 mb-0">
            <li>
              <b-button
                size="sm"
                variant="primary"
                @click="router.push({ name: 'practica_detalle', params: { id: row.item.id } })"
              >
                <i class="mdi mdi-eye-outline"></i>
              </b-button>
            </li>
            <li>
              <router-link
                :to="{ name: 'practica_editar', params: { id: row.item.id } }"
                class="btn btn-sm btn-soft-primary"
              >
                <i class="mdi mdi-pencil-outline"></i>
              </router-link>
            </li>
            <li>
            <router-link
              :to="{ name: 'practica_seguimiento', params: { id: row.item.id } }"
              class="btn btn-sm btn-soft-primary"
            >
              <i class="mdi mdi-clipboard-check-outline"></i>
            </router-link>
          </li>
          </ul>
        </template>
      </b-table>

      <div class="mt-3 d-flex justify-content-end">
        <b-pagination
          v-model="currentPage"
          :total-rows="total"
          :per-page="perPage"
          align="right"
        />
      </div>
    </b-card>
  </Layout>
</template>

