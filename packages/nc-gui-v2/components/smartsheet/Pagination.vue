<script setup lang="ts">
import { computed, inject } from 'vue'
import { ChangePageInj, PaginationDataInj } from '~/context'
import MdiKeyboardIcon from '~icons/mdi/keyboard-return'

const paginatedData = inject(PaginationDataInj)

const changePage = inject(ChangePageInj)

const count = computed(() => paginatedData?.value?.totalRows ?? Infinity)

const size = computed(() => paginatedData?.value?.pageSize ?? 25)

const page = computed({
  get: () => paginatedData?.value?.page ?? 1,
  set: (p) => changePage?.(p),
})
</script>

<template>
  <div class="flex items-center">
    <span v-if="count !== null && count !== Infinity" class="caption ml-2"> {{ count }} record{{ count !== 1 ? 's' : '' }} </span>

    <div class="flex-1" />

    <a-pagination
      v-if="count !== Infinity"
      v-model:current="page"
      size="small"
      class="!text-xs !m-1"
      :total="count"
      :page-size="size"
      show-less-items
      :show-size-changer="false"
    />
    <div v-else class="mx-auto d-flex align-center mt-n1" style="max-width: 250px">
      <span class="caption" style="white-space: nowrap"> Change page:</span>
      <v-text-field
        :value="page"
        class="ml-1 caption"
        :full-width="false"
        outlined
        dense
        hide-details
        type="number"
        @keydown.enter="changePage(page)"
      >
        <template #append>
          <MdiKeyboardIcon class="mt-1" @click="changePage(page)" />
        </template>
      </v-text-field>
    </div>

    <div class="flex-1" />
  </div>
</template>

<style scoped>
:deep(.ant-pagination-item a) {
  line-height: 21px !important;
  @apply text-sm;
}
</style>
