import { createApp } from 'vue'

import App from './App.vue'
import router from "./router";
import VueApexCharts from "vue3-apexcharts";
import vClickOutside from "click-outside-vue3";
import { registerScrollSpy } from 'vue3-scroll-spy';

import { vMaska } from "maska"
import i18n from "./i18n"

import BootstrapVueNext from 'bootstrap-vue-next'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import "@/assets/scss/app.scss";
// import "@vueform/multiselect/themes/default.css"

// PINIA
import pinia from '@/state/pinia'


createApp(App)
  .use(pinia)
  .use(router)
  .use(require('vue-chartist'))
  .use(BootstrapVueNext)
  .use(VueApexCharts)
  .use(vClickOutside)
  .use(i18n)
  .use(registerScrollSpy)
  .directive("maska", vMaska)
  .mount('#app')
