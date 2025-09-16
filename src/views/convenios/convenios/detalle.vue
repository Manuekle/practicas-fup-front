<template>
  <Layout>
    <PageHeader title="Detalle del convenio" pageTitle="Convenios" />
    <Loader :loading="loading" :transparent="false">
      <BCard>
        <b-row class="px-4 mb-3 align-items-start">
          <b-col
            cols="12"
            class="d-md-flex justify-content-between align-items-start mb-3"
          >
            <h3 class="mb-3 mb-md-0">&nbsp;</h3>
            <div class="d-flex gap-2">
              <router-link
                :to="{
                  name: 'convenios_editar',
                  params: { id: convenioId },
                }"
                class="btn btn-soft-primary btn-sm"
                v-if="hasPerm(PERMISSIONS.EDITAR_CONVENIO)"
              >
                Editar
              </router-link>
              <b-button
                variant="primary"
                @click="showUploadModal = true"
                class="btn btn-soft-primary btn-sm"
                v-if="hasPerm(PERMISSIONS.AGREGAR_DOCUMENTO_A_CONVENIO)"
              >
                Subir documentos
              </b-button>
              <b-button
                variant="primary"
                @click="toggleStatus"
                class="btn btn-soft-warning btn-sm"
                v-if="hasPerm(PERMISSIONS.CAMBIAR_ESTADO_CONVENIO)"
              >
                {{ convenio.status == 'ACTIVO'? 'Inactivar': 'Activar' }}
              </b-button>
            </div>
          </b-col>

          <b-col md="3" sm="6" class="mb-3">
            <h4 class="mb-1">
              {{ convenio.name }}
              <!-- <b-badge variant="primary">Tradicional</b-badge> -->
            </h4>
            <p class="text-muted">
              <b-icon-building /> {{ convenio.company?.name }}
              <b-icon-briefcase />
            </p>
          </b-col>
          <b-col md="2" sm="6" class="mb-3">
            <h4 class="mb-1">Estado</h4>
            <p class="text-muted">
              <b-icon-building /> {{ convenio.status }} <b-icon-briefcase />
            </p>
          </b-col>
          <b-col md="2" sm="6" class="mb-3">
            <h4 class="mb-1">Fechas</h4>
            <p class="text-muted">
              <b-icon-building /> {{ convenio.initial_date }} -
              {{ convenio.end_date }}
              <b-icon-briefcase />
            </p>
          </b-col>
          <b-col md="2" sm="6" class="mb-3">
            <h4 class="mb-1">Duración</h4>
            <p class="text-muted">
              <b-icon-building />
              {{
                getFullMonthDifference(convenio.initial_date, convenio.end_date)
              }}
              meses
              <b-icon-briefcase />
            </p>
          </b-col>
          <b-col md="3" sm="6" class="mb-3">
            <h4 class="mb-1">Vigencia restante</h4>
            <p class="text-muted">
              <b-icon-building />
              {{
                getRemainingTimeTo(convenio.end_date)
              }}
              <b-icon-briefcase />
            </p>
          </b-col>
        </b-row>
        <b-row class="mt-auto">
          <b-tabs v-model="activeTab" pills card fill>
            <b-tab title="Resumen" no-body title-link-class="text-dark" />
            <b-tab title="Documentos" no-body title-link-class="text-dark" />
            <b-tab title="Participantes" no-body title-link-class="text-dark" />
          </b-tabs>
        </b-row>

        <!-- Modal para subir documentos -->
        <BModal
          v-model="showUploadModal"
          title="Subir Documento"
          size="lg"
          no-close-on-backdrop
          no-close-on-esc
          ok-only
          ok-title="Cerrar"
          ok-variant="secondary"
        >
          <BFormGroup label="Selecciona un documento" class="mb-3">
            <BFormSelect
              v-model="selectedDocument"
              :options="documentOptions"
            />
          </BFormGroup>

          <!-- Dropzone (Se habilita solo si se selecciona un documento) -->
          <Dropzone
            :disabled="isDropzoneEnabled"
            @drop.prevent="drop"
            @change="handleFileUpload"
          />
          <ul class="list-unstyled my-2" id="dropzone-preview">
            <div
              class="border rounded"
              v-for="(file, index) of files"
              :key="index"
            >
              <div class="d-flex p-2">
                <div class="flex-shrink-0 me-3">
                  <!-- <div class="avatar-sm bg-light rounded">
                    <img
                      data-dz-thumbnail=""
                      class="img-fluid rounded d-block h-100"
                      :src="getFileSrc(file.file)"
                    />
                  </div> -->
                </div>
                <div class="flex-grow-1">
                  <div class="pt-1">
                    <h5 class="fs-14 mb-1" data-dz-name="">
                      <a :href="getFileSrc(file.file)" target="blank">{{
                        file.file.name
                      }}</a>
                    </h5>
                    <p class="fs-13 text-muted mb-0" data-dz-size="">
                      <strong>{{ (file.file.size / 1024).toFixed(2) }}</strong>
                      KB
                    </p>
                    <strong
                      class="error text-danger"
                      data-dz-errormessage=""
                    ></strong>
                  </div>
                </div>
                <div class="flex-shrink-0 ms-3">
                  <BButton
                    variant="danger"
                    size="sm"
                    data-dz-remove=""
                    @click="deleteRecord(index)"
                  >
                    Delete
                  </BButton>
                </div>
              </div>
            </div>
          </ul>
          <div v-if="files.length" class="d-grid gap-2 mt-5">
            <BButton
              pill
              variant="primary"
              data-dz-remove=""
              @click="uploadDocuments"
              :disabled="sending"
            >
              <BSpinner v-if="sending" small />
              <span v-else>Enviar</span>
            </BButton>
          </div>
        </BModal>
      </BCard>
      <div v-if="activeTab === 0">
        <b-row>
          <BCol md="5" sm="12">
            <BCard>
              <h6 class="mb-0 text-center">Información de la empresa</h6>
              <hr />
              <BTableSimple responsive>
                <BTr>
                  <BTh>Nombre</BTh>
                  <BTd class="text-muted">{{ convenio.company?.name }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Teléfono</BTh>
                  <BTd class="text-muted">{{ convenio.company?.phone }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Correo</BTh>
                  <BTd class="text-muted">{{ convenio.company?.email }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Dirección</BTh>
                  <BTd class="text-muted">{{ convenio.company?.address }}</BTd>
                </BTr>
                <BTr>
                  <BTh>NIT</BTh>
                  <BTd class="text-muted">{{ convenio.company?.nui }}</BTd>
                </BTr>
              </BTableSimple>
            </BCard>
          </BCol>
          <b-col md="7" sm="12">
            <b-card>
              <b-card-body>
                <h6 class="mb-0 text-center">Información del convenio</h6>
                <hr />
                <BTableSimple responsive bordeles>
                  <BTr>
                    <BTh>Nombre</BTh>
                    <BTd>{{ convenio.name }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Tipo de convenio</BTh>
                    <BTd>{{ convenio.agreement_type }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Alcance del convenio</BTh>
                    <BTd>{{ convenio.scope }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Estado de la documentación</BTh>
                    <BTd>{{ convenio.documentation_status }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Descripción</BTh>
                    <BTd>{{
                      convenio.description
                        ? convenio.description
                        : "Sin descripción"
                    }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Creado el</BTh>
                    <BTd>{{ formatDate(convenio.created_at) }}</BTd>
                  </BTr>
                </BTableSimple>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
      </div>

      <div v-if="activeTab === 1">
        <BRow>
          <BCol
            xl="3"
            sm="6"
            md="4"
            v-for="(item, index) of documents"
            :key="index"
          >
            <BCard no-body>
              <BCardBody>
                <div class="d-flex align-items-start">
                  <div class="avatar-md me-4">
                    <span
                      class="avatar-title rounded-circle bg-light text-danger font-size-14"
                    >
                      <i class="mdi mdi-file mdi-36px"></i>
                    </span>
                  </div>

                  <div class="flex-grow-1 overflow-hidden">
                    <h5
                      class="font-size-15"
                      v-b-tooltip.hover.top
                      title="Ver documento"
                    >
                      <BLink
                        :href="item.file || 'javascript: void(0);'"
                        class="text-dark"
                        :target="item.file ? '_blank' : '_self'"
                      >
                        {{ item.document_agreement?.name }}
                      </BLink>
                    </h5>
                    <!-- <p class="text-muted mb-4"></p> -->
                  </div>

                  <div
                    class="ms-auto position-relative"
                    v-if="
                      item.status != 'PENDIENTE' &&
                      hasPerm(PERMISSIONS.EDITAR_DOCUMENTO_A_CONVENIO)
                    "
                  >
                    <BDropdown
                      variant="link"
                      toggle-class="text-muted p-0"
                      no-caret
                      v-b-tooltip.hover.top
                      title="Acciones"
                    >
                      <template #button-content>
                        <i class="mdi mdi-dots-vertical"></i>
                      </template>
                      <BDropdownItem
                        @click="changeStatusDocumentModal(item.id)"
                      >
                        Cambiar estado
                      </BDropdownItem>
                    </BDropdown>
                  </div>
                </div>
              </BCardBody>
              <div class="px-2 py-3 border-top">
                <ul class="list-inline mb-0">
                  <li class="list-inline-item me-3">
                    <b-badge
                      :variant="getBadgeVariant(item.status)"
                      class="ms-2"
                      small
                    >
                      {{ item.status }}
                    </b-badge>
                  </li>
                  <li
                    v-b-tooltip.hover.top
                    class="list-inline-item me-3"
                    title="Fecha de subida"
                  >
                    <i class="bx bx-calendar me-1"></i>
                    {{
                      item.upload_date
                        ? formatDate(item.upload_date, "DD/MM/YYYY")
                        : "N/A"
                    }}
                  </li>
                  <li
                    v-b-tooltip.hover.top
                    class="list-inline-item me-3"
                    title="Comentarios"
                    @click="openCommentsModal(item.comments)"
                  >
                    <i class="bx bx-comment-dots me-1"></i>
                    {{ item.comments.length }}
                  </li>
                </ul>
              </div>
            </BCard>
          </BCol>
        </BRow>
        <BPagination
          v-model="currentPage"
          :total-rows="totalItems"
          :per-page="perPage"
          aria-controls="agreement-table"
          pills
          align="end"
        />
      </div>

      <b-card v-if="activeTab === 2">
        <h5>Participantes</h5>
        <p>Listado de participantes...</p>
      </b-card>

      <!-- Modal de comentarios -->
      <BModal v-model="showCommentsModal" title="Comentarios" size="lg" ok-only>
        <template v-if="selectedComments.length">
          <b-timeline>
            <b-timeline-item
              v-for="(comment, index) in selectedComments"
              :key="index"
              class="mb-4"
            >
              <div class="d-flex align-items-center mb-2">
                <b-avatar
                  :text="
                    getInitials(
                      `${comment.created_by.first_name} ${comment.created_by.last_name}`
                    )
                  "
                  class="me-2"
                />
                <div>
                  <strong
                    >{{ comment.created_by.first_name }}
                    {{ comment.created_by.last_name }}</strong
                  >
                  <b-badge
                    :variant="getBadgeVariant(comment.previous_state)"
                    class="ms-2"
                    small
                    v-if="comment.previous_state"
                  >
                    <span
                      class="mdi"
                      :class="getBadgeIcon(comment.previous_state)"
                    ></span>
                    {{ comment.previous_state }}
                  </b-badge>

                  <span
                    v-if="comment.previous_state"
                    class="mdi mdi-arrow-right mx-1"
                  ></span>

                  <b-badge
                    :variant="getBadgeVariant(comment.new_state)"
                    class="ms-2"
                  >
                    <span
                      class="mdi"
                      :class="getBadgeIcon(comment.new_state)"
                    ></span>
                    {{ comment.new_state }}
                  </b-badge>
                  <div class="text-muted small">
                    {{ formatDate(comment.created_at) }}
                  </div>
                </div>
              </div>
              <p>{{ comment.comment }}</p>
            </b-timeline-item>
          </b-timeline>
        </template>
        <div v-else>
          <LottieAnimation :animationData="emptyStateData" />
          <div class="text-center text-muted">
            <span>No hay comentarios</span>
          </div>
        </div>
      </BModal>

      <!-- Modal para cambiar el estado del documento -->
      <BModal
        v-model="showChangeStatusModal"
        title="Cambiar estado de documento"
        size="lg"
        no-close-on-backdrop
        no-close-on-esc
        ok-only
        ok-title="Cerrar"
        ok-variant="secondary"
        @hidden="resetDataChangeStatus"
      >
        <BForm>
          <BFormGroup
            class="mb-3"
            id="input-status"
            label="Estado"
            label-for="status"
          >
            <BFormSelect
              v-model="formChangeStatus.status"
              :options="statusOptions"
            >
            </BFormSelect>
          </BFormGroup>
          <BFormGroup
            class="mb-3"
            id="input-comment"
            label="Comentario"
            label-for="comment"
            v-if="formChangeStatus.status == 'RECHAZADO'"
          >
            <BFormTextarea
              v-model="formChangeStatus.comment"
              placeholder="Enter something..."
              rows="3"
            />
          </BFormGroup>
          <div class="d-grid gap-2 mt-5">
            <BButton
              pill
              variant="primary"
              @click="changeStatusDocument"
              :disabled="changing || !formChangeStatus.status"
            >
              <BSpinner v-if="changing" small />
              <span v-else>Enviar</span>
            </BButton>
          </div>
        </BForm>
      </BModal>
    </Loader>
  </Layout>
</template>

<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";
import Dropzone from "@/components/widgets/dropZone.vue";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { isAxiosError } from "axios";
import Swal from "sweetalert2";

import router from "@/router/index";
import emptyStateData from "@/assets/lottie/emptyState.json";
import apiClient from "@/utils/apiClient";
import { formatDate } from "@/utils/utils";
import { toastError, toastSuccess } from "@/utils/alert";
import {
  OBTENER_CONVENIO_URL,
  OBTENER_DOCUMENTOS_CONVENIO_URL,
  CARGAR_DOCUMENTOS_CONVENIO_URL,
  ACTUALIZAR_ESTADO_DOCUMENTO_CONVENIO,
  ACTUALIZAR_ESTADO_CONVENIO
} from "@/constants/urls";
import { usePermissions } from "@/composables/userPermissions";
import { PERMISSIONS } from "@/constants/permissions";

const { hasPerm } = usePermissions();

const route = useRoute();
const activeTab = ref(0);
const convenio = ref({});
const loading = ref(true);
const sending = ref(false);
const changing = ref(false);
const loadingDocuments = ref(true);
const showCommentsModal = ref(false);
const showChangeStatusModal = ref(false);
const selectedComments = ref([]);
const documents = ref([]);
const currentPage = ref(1);
const perPage = ref(10);
const totalItems = ref(0);
const convenioId = route.params.id;
const showUploadModal = ref(false);
const selectedDocument = ref(null);
const formChangeStatus = ref({
  status: null,
  comment: null,
});
const statusOptions = ref([
  { value: null, text: "Seleccion una opción" },
  { value: "APROBADO", text: "Aprobado" },
  { value: "RECHAZADO", text: "Rechazado" },
]);
const documentSelected = ref(null);

const isDropzoneEnabled = computed(() => !selectedDocument.value);

let files = ref([]);

const documentOptions = ref([{ value: null, text: "Selecciona un documento" }]);

const calculateFileHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
};
const getRemainingTimeTo = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)

  if (end <= now) return '0 días'

  let months = (end.getFullYear() - now.getFullYear()) * 12
  months += end.getMonth() - now.getMonth()

  if (end.getDate() < now.getDate()) {
    months -= 1
  }

  if (months > 0) {
    return `${months} mes${months === 1 ? '' : 'es'}`
  }

  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays} día${diffDays === 1 ? '' : 's'}`
}

const addFile = async (file) => {
  if (!file) return;

  let fileAdded = false;
  let errorMessage = "";

  const fileHash = await calculateFileHash(file);
  const exists = files.value.some(
    (existingFile) => existingFile.hash === fileHash
  );

  if (!exists) {
    files.value.push({
      file: file,
      type: selectedDocument.value,
      hash: fileHash,
    });
    fileAdded = true;
  } else {
    errorMessage = `El archivo "${file.name}" ya ha sido subido.`;
  }

  if (fileAdded) {
    const option = documentOptions.value.find(
      (element) => element.value == selectedDocument.value
    );
    option["disabled"] = true;
    selectedDocument.value = null;
  } else {
    toastError(errorMessage);
  }
};

const drop = async (e) => {
  e.preventDefault();
  await addFile(e.dataTransfer.files[0]);
};

const handleFileUpload = async () => {
  const fileInput = document.querySelector(".dropzoneFile");
  const uploadedFiles = fileInput.files;

  for (const file of uploadedFiles) {
    await addFile(file);
  }

  fileInput.value = "";
};

const deleteRecord = (index) => {
  const file = files.value[index];
  const option = documentOptions.value.find(
    (element) => element.value == file.type
  );
  option["disabled"] = false;
  files.value.splice(index, 1);
};
const getFileSrc = (file) => {
  return URL.createObjectURL(file);
};

const openCommentsModal = (comments) => {
  selectedComments.value = comments;
  showCommentsModal.value = true;
};

const obtenerDocumentosParaSelect = () => {
  documentOptions.value = [{ value: null, text: "Selecciona un documento" }];
  const status = ["SUBIDO", "RECHAZADO", "PENDIENTE"];
  for (const item of documents.value) {
    if (status.includes(item.status)) {
      documentOptions.value.push({
        value: item.id,
        text: item.document_agreement.name,
      });
    }
  }
};

const obtenerConvenio = async () => {
  loading.value = true;
  try {
    const url = OBTENER_CONVENIO_URL(convenioId);
    const response = await apiClient.get(url);
    convenio.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const uploadDocuments = async () => {
  if (!hasPerm(PERMISSIONS.AGREGAR_DOCUMENTO_A_CONVENIO)) {
    router.push({ name: "unauthorized" });
    return;
  }
  const formData = new FormData();

  files.value.forEach((item) => {
    formData.append("files", item.file);
  });

  files.value.forEach((item) => {
    formData.append("through_ids", item.type);
  });

  sending.value = true;
  try {
    const convenioId = route.params.id;
    const url = CARGAR_DOCUMENTOS_CONVENIO_URL(convenioId);
    const response = await apiClient.post(url, formData);
    toastSuccess(response.message);
    files.value = [];
    showUploadModal.value = false;
  } catch (error) {
    toastError(error.toString());
  } finally {
    sending.value = false;
    obtenerConvenio();
    obtenerDocumentosConvenio();
  }
};

const obtenerDocumentosConvenio = async () => {
  loadingDocuments.value = true;
  try {
    const convenioId = route.params.id;
    const url = OBTENER_DOCUMENTOS_CONVENIO_URL(convenioId);
    const response = await apiClient.get(url, {
      page: currentPage.value,
    });
    documents.value = response.results;
    totalItems.value = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loadingDocuments.value = false;
  }
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getBadgeVariant = (status) => {
  return (
    {
      APROBADO: "success",
      PENDIENTE: "warning",
      SUBIDO: "primary",
      RECHAZADO: "danger",
    }[status] || "secondary"
  );
};

const getBadgeIcon = (status) => {
  return (
    {
      APROBADO: "mdi-check-circle",
      PENDIENTE: "mdi-clock-outline",
      SUBIDO: "mdi-upload",
      RECHAZADO: "mdi-close-circle",
    }[status] || "mdi-help-circle"
  );
};

const resetDataChangeStatus = () => {
  formChangeStatus.value = {
    status: null,
    comment: null,
  };
};

const changeStatusDocumentModal = (documentId) => {
  documentSelected.value = documentId;
  showChangeStatusModal.value = true;
};

const changeStatusDocument = async () => {
  if (!hasPerm(PERMISSIONS.EDITAR_DOCUMENTO_A_CONVENIO)) {
    router.push({ name: "unauthorized" });
    return;
  }
  if (!formChangeStatus.value.status) return toastError("Selecciona un estado");
  if (
    formChangeStatus.value.status == "RECHAZADO" &&
    !formChangeStatus.value.comment
  )
    return toastError("Debes proporcionar un comentario");
  changing.value = true;
  try {
    const url = ACTUALIZAR_ESTADO_DOCUMENTO_CONVENIO(
      convenioId,
      documentSelected.value
    );
    const response = await apiClient.post(url, { ...formChangeStatus.value });
    toastSuccess(response.message);
    showChangeStatusModal.value = false;
    obtenerConvenio();
    obtenerDocumentosConvenio();
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(error.response?.data.message);
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  } finally {
    changing.value = false;
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

const toggleStatus = async () => {
  const action = convenio.value.status == "ACTIVO" ? "Inactivar" : "Activar";
  const url = ACTUALIZAR_ESTADO_CONVENIO(convenioId);
  Swal.fire({
    title: `¿Estas seguro de ${action} el convenio ${convenio.value.name}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await apiClient.post(url);
        toastSuccess("Operación realizada.");
        obtenerConvenio();
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

const getFullMonthDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months += end.getMonth() - start.getMonth();

  if (end.getDate() < start.getDate()) {
    months -= 1;
  }

  return months;
};

onMounted(() => {
  obtenerConvenio();
  if (hasPerm(PERMISSIONS.VER_DOCUMENTO_A_CONVENIO)) {
    obtenerDocumentosConvenio();
  }
});

watch(
  () => [...files.value],
  (currentValue) => {
    return currentValue;
  }
);

watch(showUploadModal, (newValue) => {
  if (newValue) {
    obtenerDocumentosParaSelect();
  }
});

// watch(activeTab, (newValue) => {
//   if (newValue === 1) {
//     obtenerDocumentosConvenio()
//   }
// });

watch(currentPage, obtenerDocumentosConvenio);
</script>

<style>
</style>