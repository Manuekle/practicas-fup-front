<template>
  <Layout>
    <PageHeader title="Documentos" pageTitle="Listar Documentos" />
    <BCard>
      <BCardText>
        <div class="row g-2 align-items-center mb-3">
          <!-- Buscador -->
          <!-- <div class="col-12 col-md-4">
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
          </div> -->

          <div class="col-12 col-md d-flex justify-content-md-end gap-2">

            <router-link
              :to="{ name: 'crear_documento' }"
              class="btn btn-primary"
              v-if="hasPerm(PERMISSIONS.CREAR_DOCUMENTO_DE_CONVENIO)"
            >
              <i class="mdi mdi-plus"></i> Nuevo Documento
            </router-link>
          </div>
        </div>
        <Loader :loading="loading" :transparent="false">
          <BTable
            striped
            hover
            :items="documents"
            :fields="fields"
            bordered
            responsive
          >
            <template #cell(is_active)="data">
              {{ data.item.is_active ? "Si" : "No" }}
            </template>
            <template #cell(actions)="data">
              <ul class="list-unstyled hstack gap-1 mb-0">
                <li
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  aria-label="View"
                >
                  <BPopover :delay="{ show: 0, hide: 0 }">
                    <template #target>
                      <router-link
                        :to="{
                          name: 'editar_documento',
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
                    data.item.is_active ? 'Inactivar' : 'Activar'
                  "
                  v-if="hasPerm(PERMISSIONS.CAMBIAR_ESTADO_DOCUMENTO)"
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
        <BPagination
          v-model="currentPage"
          :total-rows="totalItems"
          :per-page="perPage"
          aria-controls="agreement-table"
          pills
          align="end"
        />
      </BCardText>
    </BCard>
  </Layout>
</template>
  
  <script setup>
import { onMounted, ref, watch } from "vue";
import Swal from "sweetalert2";
import { isAxiosError } from "axios";

import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";

import apiClient from "@/utils/apiClient";
import { LISTA_DOCUMENTOS_URL, ACTUALIZAR_ESTADO_DOCUMENTO } from "@/constants/urls";
import { toastSuccess, toastError } from "@/utils/alert";

const fields = [
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  { key: "is_active", label: "Activo" },
  { key: "actions", label: "Acciones" },
];
import { usePermissions } from "@/composables/userPermissions";
import { PERMISSIONS } from "@/constants/permissions";

const { hasPerm } = usePermissions();

const documents = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);

const getDocuments = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(LISTA_DOCUMENTOS_URL, {
      page: currentPage.value,
    });
    documents.value = response.results;
    totalItems.value = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
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

const toggleStatus = async (id, is_active, document) => {
  const action = is_active ? "Inactivar" : "Activar";
  const url = ACTUALIZAR_ESTADO_DOCUMENTO(id);
  Swal.fire({
    title: `¿Estas seguro de ${action} el convenio ${document}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await apiClient.post(url);
        toastSuccess("Operación realizada.");
        getDocuments();
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
  getDocuments();
});

watch(currentPage, getDocuments);
</script>
  
  <style>
</style>