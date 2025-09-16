<script setup>
import { computed, defineProps } from 'vue'
import { useLayoutStore } from '@/state/pinia' // ajusta la ruta si es diferente

// Props
const props = defineProps({
  loading: Boolean,
  transparent: {
    type: Boolean,
    default: false
  }
})

// Store
const layoutStore = useLayoutStore()

// Computed: fondo adaptado al modo y a `transparent`
const backgroundColor = computed(() => {
  if (!props.transparent) {
    return layoutStore.mode === 'dark' ? '#262b3c' : '#ffffff';
  }
  return layoutStore.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(255, 255, 255, 0.8)'
})
</script>

<template>
  <div :class="{ 'is-loading': props.loading }">
    <div
      v-if="props.loading"
      class="preloader-component"
      :style="{ backgroundColor }"
    >
      <div class="status">
        <div class="spinner-chase">
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
          <div class="chase-dot"></div>
        </div>
      </div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.is-loading {
  position: relative;
}

.preloader-component {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
