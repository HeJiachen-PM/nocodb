<script setup lang="ts">
import dayjs from 'dayjs'
import { ColumnInj, ReadonlyInj } from '~/context'

interface Props {
  modelValue: string | null
}

const { modelValue } = defineProps<Props>()

const emit = defineEmits(['update:modelValue'])

const columnMeta = inject(ColumnInj, null)
const readOnlyMode = inject(ReadonlyInj, false)

let isDateInvalid = $ref(false)
const dateFormat = columnMeta?.value?.meta?.date_format ?? 'YYYY-MM-DD'

const localState = $computed({
  get() {
    if (!modelValue) {
      return undefined
    }

    if (!dayjs(modelValue).isValid()) {
      isDateInvalid = true
      return undefined
    }

    return /^\d+$/.test(modelValue) ? dayjs(+modelValue) : dayjs(modelValue)
  },
  set(val?: dayjs.Dayjs) {
    if (!val) {
      emit('update:modelValue', null)
      return
    }

    if (val.isValid()) {
      emit('update:modelValue', val?.format('YYYY-MM-DD'))
    }
  },
})
const open = ref(false)

const randomClass = `picker_${Math.floor(Math.random() * 99999)}`
watch(
  open,
  (next) => {
    if (next) {
      onClickOutside(document.querySelector(`.${randomClass}`)! as HTMLDivElement, () => (open.value = false))
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <a-date-picker
    v-model:value="localState"
    :bordered="false"
    class="!w-full px-1"
    :format="dateFormat"
    :placeholder="isDateInvalid ? 'Invalid date' : !readOnlyMode ? 'Select date' : ''"
    :allow-clear="!readOnlyMode"
    :input-read-only="true"
    :dropdown-class-name="randomClass"
    :open="readOnlyMode ? false : open"
    @click="open = !open"
  >
    <template #suffixIcon></template>
  </a-date-picker>
</template>

<style scoped></style>
