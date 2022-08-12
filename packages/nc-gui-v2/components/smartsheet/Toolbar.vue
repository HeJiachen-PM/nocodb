<script setup lang="ts">
import { useSmartsheetStoreOrThrow } from '~/composables'
import { IsPublicInj } from '~/context'

const { isGrid, isForm } = useSmartsheetStoreOrThrow()
const isPublic = inject(IsPublicInj, ref(false))
</script>

<template>
  <div class="nc-table-toolbar w-full py-1 flex gap-1 items-center" style="z-index: 7">
    <SmartsheetToolbarSearchData v-if="isGrid && !isPublic" class="flex-shrink" />

    <SmartsheetToolbarFieldsMenu v-if="isGrid" :show-system-fields="false" />

    <SmartsheetToolbarColumnFilterMenu v-if="isGrid" />

    <SmartsheetToolbarSortListMenu v-if="isGrid" />

    <SmartsheetToolbarShareView v-if="(isForm || isGrid) && !isPublic" />

    <SmartsheetToolbarMoreActions v-if="isGrid && !isPublic" />

    <div class="flex-1" />
  </div>
</template>

<style scoped>
:deep(.nc-toolbar-btn) {
  @apply border-0 !text-xs font-semibold px-2;
}
</style>
