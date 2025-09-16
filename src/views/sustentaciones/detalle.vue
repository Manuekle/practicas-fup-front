<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { Spanish } from "flatpickr/dist/l10n/es.js";

import emptyStateData from "@/assets/lottie/emptyState.json";
import apiClient from "@/utils/apiClient";
import {
  OBTENER_SUSTENTACION_URL,
  COMENTARIO_SUSTENTACION_URL,
  REPROGRAMAR_SUSTENTACION_URL,
  FINALIZAR_SUSTENTACION,
} from "@/constants/urls";
import { formatDate } from "@/utils/utils";
import { toastError, toastSuccess } from "@/utils/alert";
import { PERMISSIONS } from "@/constants/permissions"
import { usePermissions } from "@/composables/userPermissions";

const { hasPerm } = usePermissions()

const route = useRoute();
const config = ref({
  locale: Spanish,
});

const defenseId = route.params.id;
const fieldsStudent = [
  { key: "full_name", label: "Nombre" },
  { key: "code", label: "Código" },
  { key: "document_number", label: "Número de documento" },
  { key: "email", label: "Correo electrónico" },
];
const fieldsTeacher = [
  { key: "full_name", label: "Nombre" },
  { key: "document_number", label: "Número de documento" },
  { key: "email", label: "Correo electrónico" },
  { key: "role", label: "Rol" },
];
const fieldsDocuments = [
  { key: "name", label: "Nombre del documento" },
  { key: "uploaded_by", label: "Subido por" },
  { key: "updated_at", label: "Fecha de subida" },
  { key: "download", label: "Descargar" },
];
const finishForm = ref({
  result: null,
  supporting_document: null,
});
const creatingComment = ref(false);
const loading = ref(false);
const defense = ref({});
const comments = ref([]);
const totalItems = ref(0);
const page = ref(0);
const loadingComments = ref(false);
const showModalRe = ref(false);
const showModalComment = ref(false);
const showModalFinish = ref(false);
const formRescheduled = ref({
  comment: null,
  new_scheduled_date: null,
});
const commentForm = ref({
  comment: null,
});
const rescheduling = ref(false);
const finish = ref(false);
const optionsResult = ref([
  {
    value: null,
    text: "selecciona una opción",
  },
  {
    value: "APROBADO",
    text: "Aprobado",
  },
  {
    value: "NO APROBADO",
    text: "No aprobado",
  },
]);

const reglas = computed(() => ({
  comment: {
    required: helpers.withMessage("El comentario es obligatorio.", required),
  },
  new_scheduled_date: {
    required: helpers.withMessage("La nueva fecha es requerida.", required),
    isAfterCurrentScheduledDate: helpers.withMessage(
      "La nueva fecha debe ser posterior a la fecha programada actual.",
      (value) => {
        if (!value || !defense.value?.scheduled_date) return true;
        return (
          new Date(value + "T00:00") >
          new Date(defense.value.scheduled_date + "T00:00")
        );
      }
    ),
  },
}));

const rulesComment = computed(() => ({
  comment: {
    required: helpers.withMessage("Este campo es requerido.", required),
  },
}));

const rulesFinisf = computed(() => ({
  result: {
    required: helpers.withMessage("Este campo es requerido", required),
  },
  supporting_document: {
    required: helpers.withMessage("Este campo es requerido", required),
  },
}));

const v$ = useVuelidate(reglas, formRescheduled);
const vRules = useVuelidate(rulesComment, commentForm);
const fRules = useVuelidate(rulesFinisf, finishForm);

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getDefense = async () => {
  loading.value = true;
  try {
    const url = OBTENER_SUSTENTACION_URL(defenseId);
    const response = await apiClient.get(url);
    defense.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const getComments = async () => {
  loadingComments.value = true;
  page.value += 1;
  try {
    const url = COMENTARIO_SUSTENTACION_URL(defenseId);
    const response = await apiClient.get(url, {
      page: page.value,
    });
    comments.value = [...comments.value, ...response.results];
    totalItems.value = response.count;
  } catch (error) {
    console.log(error);
  } finally {
    loadingComments.value = false;
  }
};

const resetFormRe = () => {
  v$.value.$reset();
  formRescheduled.value = { comment: null, new_scheduled_date: null };
};

const resetCommentForm = () => {
  vRules.value.$reset();
  commentForm.value = { comment: null };
};

const resetFinishForm = () => {
  fRules.value.$reset();
  finishForm.value = { result: null, supporting_document: null };
};

const reScheduledDefense = async () => {
  rescheduling.value = true;
  try {
    const url = REPROGRAMAR_SUSTENTACION_URL(defenseId);
    await apiClient.post(url, formRescheduled.value);
    toastSuccess("Reprogramación correcta.");
    getDefense();
    showModalRe.value = false;
    resetFormRe();
    page.value = 0;
    comments.value = [];

    getComments();
  } catch (error) {
    toastError(error.toString());
  } finally {
    rescheduling.value = false;
  }
};

const createComment = async () => {
  creatingComment.value = true;
  try {
    const url = COMENTARIO_SUSTENTACION_URL(defenseId);
    await apiClient.post(url, commentForm.value);
    toastSuccess("Comentario creado correctamente");
    showModalComment.value = false;
    resetCommentForm();
    comments.value = [];
    page.value = 0;
    getComments();
  } catch (error) {
    toastError(error.toString());
  } finally {
    creatingComment.value = false;
  }
};

const finishDefense = async () => {
  finish.value = true;
  try {
    const formData = new FormData();
    formData.append("result", finishForm.value.result);
    formData.append(
      "supporting_document",
      finishForm.value.supporting_document
    );
    const url = FINALIZAR_SUSTENTACION(defenseId);
    await apiClient.post(url, formData);
    resetFinishForm();
    showModalFinish.value = false;
    comments.value = [];
    page.value = 0;
    getComments();
    getDefense()
    toastSuccess("Sustentación finalizada");
  } catch (error) {
    toastError(error.toString());
  } finally {
    finish.value = false;
  }
};

onMounted(() => {
  getDefense();
  getComments();
});
</script>
<template>
  <Layout>
    <PageHeader title="Detalle de sustentación" pageTitle="Sustentaciones" />
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
                  name: 'editar_sustentacion',
                  params: { id: defenseId },
                }"
                class="btn btn-soft-primary btn-sm"
                v-if="defense.status != 'COMPLETADA'"
              >
                Editar
              </router-link>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="showModalRe = true"
                v-if="defense.status != 'COMPLETADA'"
              >
                Reprogramar
              </button>
              <button
                class="btn btn-primary btn-sm"
                @click="showModalFinish = true"
                v-if="hasPerm(PERMISSIONS.FINALIZAR_SUSTENTACION)"
              >
                Finalizar
              </button>
            </div>
          </b-col>

          <b-col md="2" sm="6" class="mb-3">
            <h5 class="mb-1">Fecha programada</h5>
            <p class="text-muted mb-0">
              <b-icon-calendar-check /> {{ defense.scheduled_date }}
            </p>
          </b-col>
          <b-col md="2" sm="6" class="mb-3">
            <h5 class="mb-1">Jornada</h5>
            <p class="text-muted mb-0">
              <b-icon-calendar /> {{ defense.academic_session }}
            </p>
          </b-col>
          <b-col md="2" sm="6" class="mb-3">
            <h5 class="mb-1">Período</h5>
            <p class="text-muted mb-0">
              <b-icon-calendar /> {{ defense.period }}
            </p>
          </b-col>
          <b-col md="2" sm="6" class="mb-3">
            <h5 class="mb-1">Lugar</h5>
            <p class="text-muted mb-0">
              <b-icon-calendar /> {{ defense.place }}
            </p>
          </b-col>

          <b-col md="2" sm="6" class="mb-3">
            <h5 class="mb-1">Estado</h5>
            <p class="text-muted mb-0">
              <b-icon-info-circle /> {{ defense.status }}
            </p>
          </b-col>

          <b-col md="2" sm="6" class="mb-3">
            <h5 class="mb-1">Nota cualitativa</h5>
            <p class="text-muted mb-0">
              <b-icon-award />
              {{ defense.result ? defense.result : "No asignada" }}
            </p>
          </b-col>
        </b-row>
      </BCard>

      <BRow>
        <BCol sm="12" md="6">
          <BCard>
            <h4 class="mb-2">Estudiantes</h4>
            <div style="max-height: 200px; height: 200px; overflow-y: auto">
              <BTable
                striped
                hover
                :items="defense.students"
                :fields="fieldsStudent"
                bordered
                responsive
                show-empty
              >
                <template #cell(full_name)="data">
                  {{ data.item.student.full_name }}
                </template>
                <template #cell(code)="data">
                  {{ data.item.student.code }}
                </template>
                <template #cell(document_number)="data">
                  {{ data.item.student.document_number }}
                </template>
                <template #cell(email)="data">
                  {{ data.item.student.email }}
                </template>
              </BTable>
            </div>
          </BCard>
        </BCol>
        <BCol sm="12" md="6">
          <BCard>
            <h4 class="mb-2">Jurados</h4>

            <div style="max-height: 200px; height: 200px; overflow-y: auto">
              <BTable
                striped
                hover
                :items="defense.teachers"
                :fields="fieldsTeacher"
                bordered
                responsive
              >
                <template #cell(full_name)="data">
                  {{ data.item.teacher.full_name }}
                </template>
                <template #cell(document_number)="data">
                  {{ data.item.teacher.document_number }}
                </template>
                <template #cell(email)="data">
                  {{ data.item.teacher.email }}
                </template>
              </BTable>
            </div>
          </BCard>
        </BCol>
        <BCol md="12" v-if="defense.documentdefense_set?.length > 0">
          <BCard no-body>
            <BCardBody>
              <BCardTitle>Documentos de sustentación</BCardTitle>
              <BTable
                striped
                hover
                :items="defense.documentdefense_set"
                :fields="fieldsDocuments"
                bordered
                responsive
              >
                <template #cell(download)="data">
                  <BTooltip>
                    <template #target>
                      <a
                        class="btn btn-sm btn-soft-primary"
                        download="acta de sustentación"
                        :href="data.item.file"
                        target="_blank"
                      >
                          <i class="mdi mdi-download"></i>
                      </a>
                    </template>
                    Descargar
                  </BTooltip>
                </template>
              </BTable>
            </BCardBody>
          </BCard>
        </BCol>
        <BCol md="12">
          <BCard>
            <div
              class="px-3 pt-3 d-md-flex justify-content-between align-items-start mb-3"
            >
              <small class="text-muted">
                <span v-if="comments.length"
                  >Mostrando {{ comments.length }} de
                  {{ totalItems }} comentarios</span
                >
                <span v-else>&nbsp;</span>
              </small>
              <h3 class="mb-3 mb-md-0">&nbsp;</h3>
              <button
                class="btn btn-soft-primary btn-sm"
                @click="showModalComment = true"
              >
                Crear comentario
              </button>
            </div>
            <div v-if="comments.length">
              <div
                style="max-height: 400px; overflow-y: auto"
                class="px-3 pb-2"
              >
                <b-timeline>
                  <b-timeline-item
                    v-for="(comment, index) in comments"
                    :key="index"
                    class="mb-4"
                  >
                    <div class="d-flex align-items-center mb-2">
                      <b-avatar
                        :text="getInitials(comment.created_by)"
                        class="me-2"
                      />
                      <div>
                        <strong>{{ comment.created_by }}</strong>
                        <b-badge
                          variant="primary"
                          class="ms-2"
                          small
                          v-if="comment.previous_date"
                        >
                          <span class="mdi mdi-clock-outline"></span>
                          {{ comment.previous_date }}
                        </b-badge>

                        <span
                          v-if="comment.previous_date"
                          class="mdi mdi-arrow-right mx-1"
                        ></span>

                        <b-badge
                          class="ms-2"
                          variant="success"
                          v-if="comment.new_date"
                        >
                          <span class="mdi mdi-clock-outline"></span>
                          {{ comment.new_date }}
                        </b-badge>
                        <div class="text-muted small">
                          {{ formatDate(comment.created_at) }}
                        </div>
                      </div>
                    </div>
                    <p>{{ comment.comment }}</p>
                  </b-timeline-item>
                </b-timeline>
              </div>

              <div
                v-if="comments.length < totalItems"
                class="d-flex justify-content-center py-3"
              >
                <b-button
                  variant="outline-primary"
                  size="sm"
                  @click="getComments"
                  :disabled="loadingComments"
                >
                  <BSpinner v-if="loadingComments" small />
                  <span v-else>Ver más</span>
                </b-button>
              </div>
            </div>
            <div v-else>
              <LottieAnimation :animationData="emptyStateData" />
              <div class="text-center text-muted">
                <span>No hay comentarios</span>
              </div>
            </div>
          </BCard>
        </BCol>
      </BRow>
      <BModal
        v-model="showModalRe"
        title="Reprogramar sustentación"
        size="lg"
        ok-only
        ok-title="Cerrar"
        no-close-on-backdrop
        no-close-on-esc
        @hidden="resetFormRe"
      >
        <BForm class="p-2" @submit.prevent="reScheduledDefense">
          <BRow>
            <BCol sm="12" md="12">
              <BFormGroup
                class="mb-3"
                id="input-comment"
                label="Comentario *"
                label-for="comment"
              >
                <BFormTextarea
                  id="comment"
                  v-model="formRescheduled.comment"
                  type="text"
                  placeholder="Comentario sobre la reprogramación"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.comment.$error }"
                  @blur="v$.comment.$touch()"
                  rows="5"
                />
                <div
                  v-for="(item, index) in v$.comment.$errors"
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
                id="input-new_scheduled_date"
                label="Fecha programada *"
                label-for="new_scheduled_date"
              >
                <flat-pickr
                  v-model="formRescheduled.new_scheduled_date"
                  :first-day-of-week="1"
                  :config="config"
                  placeholder="Fecha programada"
                  class="form-control"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.new_scheduled_date.$error }"
                  @blur="v$.new_scheduled_date.$touch()"
                ></flat-pickr>
                <div
                  v-for="(item, index) in v$.new_scheduled_date.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>
            </BCol>
          </BRow>
          <BButton
            type="submit"
            :disabled="rescheduling || v$.$invalid"
            class="w-100"
          >
            <BSpinner v-if="rescheduling" small />
            <span v-else>Guardar</span>
          </BButton>
        </BForm>
      </BModal>
      <BModal
        v-model="showModalComment"
        title="Nuevo comentario"
        size="lg"
        ok-only
        ok-title="Cerrar"
        no-close-on-backdrop
        no-close-on-esc
        @hidden="resetCommentForm"
      >
        <BForm class="p-2" @submit.prevent="createComment">
          <BRow>
            <BCol sm="12" md="12">
              <BFormGroup
                class="mb-3"
                id="input-comment"
                label="Comentario *"
                label-for="comment"
              >
                <BFormTextarea
                  id="comment"
                  v-model="commentForm.comment"
                  type="text"
                  placeholder="Deja un comentario sobre la sustentación"
                  :disabled="loading"
                  :class="{ 'is-invalid': vRules.comment.$error }"
                  @blur="vRules.comment.$touch()"
                  rows="5"
                />
                <div
                  v-for="(item, index) in vRules.comment.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>
            </BCol>
          </BRow>
          <BButton
            type="submit"
            :disabled="creatingComment || vRules.$invalid"
            class="w-100"
          >
            <BSpinner v-if="creatingComment" small />
            <span v-else>Guardar</span>
          </BButton>
        </BForm>
      </BModal>

      <BModal
        v-model="showModalFinish"
        title="Finalizar sustentación"
        size="lg"
        ok-only
        ok-title="Cerrar"
        no-close-on-backdrop
        no-close-on-esc
        @hidden="resetFinishForm"
      >
        <BForm class="p-2" @submit.prevent="finishDefense">
          <BRow>
            <BCol sm="12" md="12">
              <BFormGroup
                class="mb-3"
                id="input-comment"
                label="Nota cualitativa *"
                label-for="result"
              >
                <BFormSelect
                  id="result"
                  v-model="finishForm.result"
                  :options="optionsResult"
                  :disabled="finish"
                  :class="{ 'is-invalid': fRules.result.$error }"
                  @blur="fRules.result.$touch()"
                />
                <div
                  v-for="(item, index) in fRules.result.$errors"
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
                id="input-comment"
                label="Acta de sustentación *"
                label-for="supporting_document"
              >
                <BFormFile
                  id="supporting_document"
                  v-model="finishForm.supporting_document"
                  :disabled="finish"
                  :class="{ 'is-invalid': fRules.supporting_document.$error }"
                  @blur="fRules.supporting_document.$touch()"
                />
                <div
                  v-for="(item, index) in fRules.supporting_document.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>
            </BCol>
          </BRow>
          <BButton
            type="submit"
            :disabled="finish || fRules.$invalid"
            class="w-100"
          >
            <BSpinner v-if="finish" small />
            <span v-else>Guardar</span>
          </BButton>
        </BForm>
      </BModal>
    </Loader>
  </Layout>
</template>