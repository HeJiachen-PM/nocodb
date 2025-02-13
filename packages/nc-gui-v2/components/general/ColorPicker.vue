<script lang="ts" setup>
import { Chrome } from '@ckpack/vue-color'
import { enumColor } from '@/utils'

interface Props {
  modelValue: string | any
  colors?: string[]
  rowSize?: number
  advanced?: Boolean
  pickButton?: Boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => enumColor.light[0],
  colors: () => enumColor.light.concat(enumColor.dark),
  rowSize: () => 10,
  advanced: () => true,
  pickButton: () => false,
})

const emit = defineEmits(['update:modelValue'])

const vModel = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val.hex ? val.hex : val || null)
  },
})

const picked = ref(props.modelValue || enumColor.light[0])

const selectColor = (color: any) => {
  picked.value = color.hex ? color.hex : color
  vModel.value = color.hex ? color.hex : color
}

const compare = (colorA: String, colorB: String) => {
  if ((typeof colorA === 'string' || colorA instanceof String) && (typeof colorB === 'string' || colorB instanceof String)) {
    return colorA.toLowerCase() === colorB.toLowerCase()
  }
  return false
}

watch(picked, (n, _o) => {
  if (!props.pickButton) {
    vModel.value = n.hex ? n.hex : n
  }
})
</script>

<template>
  <div class="color-picker">
    <div v-for="colId in Math.ceil(props.colors.length / props.rowSize)" :key="colId" class="color-picker-row">
      <button
        v-for="(color, i) in colors.slice((colId - 1) * rowSize, colId * rowSize)"
        :key="`color-${colId}-${i}`"
        class="color-selector"
        :class="compare(picked, color) ? 'selected' : ''"
        :style="{ 'background-color': `${color}` }"
        @click="selectColor(color)"
      >
        {{ compare(picked, color) ? '&#10003;' : '' }}
      </button>
    </div>
    <a-card v-if="props.advanced" class="w-full mt-2" :body-style="{ padding: '0px' }" :bordered="false">
      <a-collapse accordion ghost expand-icon-position="right">
        <a-collapse-panel key="1" header="Advanced" class="">
          <a-button v-if="props.pickButton" class="!bg-primary text-white w-full" @click="selectColor(picked)">
            Pick Color
          </a-button>
          <div class="flex justify-center py-4">
            <Chrome v-model="picked" class="!w-full !shadow-none" />
          </div>
        </a-collapse-panel>
      </a-collapse>
    </a-card>
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: white;
  padding: 10px;
}
.color-picker-row {
  display: flex;
  flex-direction: row;
}
.color-selector {
  position: relative;
  height: 32px;
  width: 32px;
  margin: 10px 5px;
  border-radius: 5px;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: white;
}
.color-selector:hover {
  filter: brightness(90%);
  -webkit-filter: brightness(90%);
}
.color-selector.selected {
  filter: brightness(90%);
  -webkit-filter: brightness(90%);
}
</style>
