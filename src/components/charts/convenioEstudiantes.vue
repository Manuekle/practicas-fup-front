<template>
  <BCard no-body>
    <BCardBody>
      <BCardTitle class="text-center">
        Estudiantes por convenio
      </BCardTitle>
      <Loader :loading="loading">
        <div class="chart-wrapper" v-if="success">
          <apexchart
            ref="chart"
            type="line"
            height="350"
            :options="chartOptions"
            :series="chartData"
          />
        </div>
        <div v-else class="chart-wrapper">
          <LottieAnimation :animationData="error" />
          <div class="text-center">
            <p class="text-muted">Error obteniendo la información</p>
          </div>
        </div>
      </Loader>
    </BCardBody>
  </BCard>
</template>

<script setup>
import Loader from "../widgets/loader.vue";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import { ref, onMounted } from "vue";

import error from "@/assets/lottie/error.json";
import apiClient from "@/utils/apiClient";
import { CONVENIOS_ESTUDIANTES } from "@/constants/urls";

const success = ref(true);
const chart = ref(null)
const loading = ref(false);
const chartData = ref([
  {
    name: "Estudiantes",
    data: [],
  },
]);

const chartOptions = ref({
  chart: {
    type: "line",
    zoom: {
      enabled: true,
      type: "xy",
      resetIcon: {
        offsetX: 0,
        offsetY: 0,
        size: 30,
      },
    },
  },
  xaxis: {
    categories: [],
    title: {
      text: "Convenio",
    },
    labels: {
    rotate: -45,
    trim: true,
    style: {
      fontSize: '12px',
      cssClass: 'apexcharts-xaxis-label'
    }
  },
  tooltip: {
    enabled: true  
  }
  },
  yaxis: {
    title: {
      text: "Cantidad de Estudiantes",
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 5,
  },
  tooltip: {
    y: {
      formatter: (val) => `${val} estudiantes`,
    },
  },
});

const getData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(CONVENIOS_ESTUDIANTES);
    chart.value.updateOptions({
      xaxis: {
        categories: response.labels,
      },
    });
    chartData.value = [{
      name: 'Estudiantes',
      data: response.series
    }]
  } catch (error) {
    success.value = false;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getData();
});
</script>

<style scoped>
.chart-wrapper {
  height: 350px;
  min-height: 350px;
}
</style>
