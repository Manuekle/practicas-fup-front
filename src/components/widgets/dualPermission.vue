<template>
  <div
    class="multi-select-container"
    style="display: flex; gap: 1rem; align-items: center"
  >
    <div style="display: flex; flex-direction: column">
      <input
        type="text"
        v-model="searchAvailable"
        placeholder="Buscar permisos"
        class="form-control mb-2"
      />
      <select
        multiple
        size="10"
        v-model="selectedAvailable"
        style="
          min-width: 300px;
          max-width: 300px;
          height: 300px;
          max-height: 300px;
        "
        class="form-control"
      >
        <option
          v-for="item in filteredAvailable"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
    </div>

    <div
      style="
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        justify-content: center;
      "
    >
      <button
        type="button"
        @click="addSelected"
        :disabled="selectedAvailable.length === 0"
        class="btn btn-sm btn-primary"
      >
        <i class="mdi mdi-arrow-right"></i>
      </button>
      <button
        type="button"
        @click="removeSelected"
        :disabled="selectedSelected.length === 0"
        class="btn btn-sm btn-danger"
      >
        <i class="mdi mdi-arrow-left"></i>
      </button>
    </div>

    <div style="display: flex; flex-direction: column">
      <input
        type="text"
        v-model="searchSelected"
        placeholder="Buscar seleccionados"
        class="form-control mb-2"
      />

      <select
        multiple
        size="10"
        v-model="selectedSelected"
        style="
          min-width: 300px;
          max-width: 300px;
          height: 300px;
          max-height: 300px;
        "
        class="form-control"
      >
        <option
          v-for="item in filteredSelectedItems"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const selectedAvailable = ref([]);
const selectedSelected = ref([]);
const searchAvailable = ref("");
const searchSelected = ref("");

const filteredSelectedItems = computed(() => {
  if (!searchSelected.value) return selectedItems.value;
  return selectedItems.value.filter(opt =>
    opt.label.toLowerCase().includes(searchSelected.value.toLowerCase())
  );
});


const selectedItems = computed(() =>
  props.options.filter((opt) => props.modelValue.includes(opt.value))
);

const available = computed(() =>
  props.options.filter((opt) => !props.modelValue.includes(opt.value))
);

const filteredAvailable = computed(() => {
  if (!searchAvailable.value) return available.value;
  return available.value.filter((opt) =>
    opt.label.toLowerCase().includes(searchAvailable.value.toLowerCase())
  );
});

function addSelected() {
  const newSelection = [
    ...new Set([...props.modelValue, ...selectedAvailable.value]),
  ];
  emit("update:modelValue", newSelection);
  selectedAvailable.value = [];
}

function removeSelected() {
  const newSelection = props.modelValue.filter(
    (v) => !selectedSelected.value.includes(v)
  );
  emit("update:modelValue", newSelection);
  selectedSelected.value = [];
}
</script>
