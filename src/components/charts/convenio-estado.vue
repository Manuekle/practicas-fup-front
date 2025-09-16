<template>
  <BCard no-body>
    <BCardBody>
      <BCardTitle class="text-center">Convenios por estado</BCardTitle>
      <Loader :loading="loading">
        <div class="chart-wrapper" v-if="success">
          <apexchart
            ref="chart"
            class="apex-charts"
            type="pie"
            :options="chartOptions"
            :series="chartData"
            height="350"
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
import { ESTADOS_CONVENIO } from "@/constants/urls";

const chart = ref(null);
const success = ref(true);
const loading = ref(false);
const chartData = ref([]);
const chartOptions = ref({
  chart: {
    width: 380,
  },
  labels: [],
  legend: {
    show: true,
    position: "bottom",
    horizontalAlign: "center",
    verticalAlign: "middle",
    floating: false,
    fontSize: "14px",
    offsetX: 0,
  },
  tooltip: {
    y: {
      formatter: (val) => `${val} convenios`,
    },
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 240,
        },
        legend: {
          show: false,
        },
      },
    },
  ],
});

const getData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(ESTADOS_CONVENIO);
    chartData.value = response.series;

    chart.value.updateOptions({
      labels: response.labels,
    });
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
}
</style>
