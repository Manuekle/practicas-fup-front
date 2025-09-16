<template>
  <template v-if="loading">
    <BRow>
      <BCol sm="6" md="3" v-for="index in 4" :key="index">
        <Loader :loading="loading" :transparent="false">
          <BCard style="min-height: 90px;">&nbsp;</BCard>
        </Loader>

      </BCol>
    </BRow>

  </template>
    <BRow v-else>
      <BCol sm="6" md="3" v-for="stat of statData" :key="stat.icon">
        <Stat :icon="stat.icon" :title="stat.title" :value="stat.value" />
      </BCol>
    </BRow>
  <BRow>
    <BCol sm="12" md="6">
      <ConvenioEstado />
    </BCol>
    <BCol sm="12" md="6">
      <ProximoVencimientoConvenio />
    </BCol>
    <BCol sm="12" md="6">
      <ConvenioPorAno />
    </BCol>
    <BCol sm="12" md="6">
      <ConvenioPrograma />
    </BCol>
    <BCol sm="12" md="6">
      <ConvenioEstudiantes />
    </BCol>
    <BCol sm="12" md="6">
      <Sustentacion />
    </BCol>
  </BRow>
</template>

<script setup>
import Stat from "@/components/widgets/stat";
import Loader from "@/components/widgets/loader";
import ConvenioEstado from "@/components/charts/convenio-estado.vue";
import ProximoVencimientoConvenio from "@/components/charts/ProximoVencimientoConvenio";
import ConvenioPorAno from "@/components/charts/ConvenioPorAno";
import ConvenioPrograma from "@/components/charts/convenioPrograma";
import ConvenioEstudiantes from "@/components/charts/convenioEstudiantes";
import Sustentacion from "@/components/charts/sustentacion";

import { ref, onMounted } from "vue";

import apiClient from "@/utils/apiClient";
import { ESTADISTICAS_CONVENIO } from "@/constants/urls";

const loading = ref(false);
const statData = ref([]);

const getData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(ESTADISTICAS_CONVENIO);
    formatStatData(response);
  } catch (error) {
    console.log();
  } finally {
    loading.value = false;
  }
};

const formatStatData = async (data) => {
  const traductions = {
    total: "Total convenios",
    active: "Convenios activos",
    inactive: "Convenios inactivos",
    expiring_soon: "Próximos a vencer",
  };
  for (let item in data) {
    const temp = {
      icon: "bx bx-purchase-tag-alt",
      title: traductions[item],
      value: data[item].toString(),
    };
    statData.value.push(temp);
  }
};

onMounted(() => {
  getData();
});
</script>