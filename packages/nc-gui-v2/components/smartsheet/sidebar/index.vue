<script setup lang="ts">
import type { FormType, GalleryType, GridType, KanbanType, ViewTypes } from 'nocodb-sdk'
import MenuTop from './MenuTop.vue'
import MenuBottom from './MenuBottom.vue'
import Toolbar from './toolbar/index.vue'
import { computed, inject, provide, ref, useRoute, useRouter, useViews, watch } from '#imports'
import { ActiveViewInj, MetaInj, RightSidebarInj, ViewListInj } from '~/context'

const meta = inject(MetaInj, ref())

const activeView = inject(ActiveViewInj, ref())

const { views, loadViews } = useViews(meta)

const router = useRouter()

const route = useRoute()

provide(ViewListInj, views)

/** Sidebar visible */
const sidebarOpen = inject(RightSidebarInj, ref(true))

const sidebarCollapsed = computed(() => !sidebarOpen.value)

/** View type to create from modal */
let viewCreateType = $ref<ViewTypes>()

/** View title to create from modal (when duplicating) */
let viewCreateTitle = $ref('')

/** selected view id for copying view meta */
let selectedViewId = $ref('')

/** is view creation modal open */
let modalOpen = $ref(false)

/** Watch route param and change active view based on `viewTitle` */
watch(
  [views, () => route.params.viewTitle],
  ([nextViews, viewTitle]) => {
    if (viewTitle) {
      const view = nextViews.find((v) => v.title === viewTitle)
      if (view) {
        activeView.value = view
      }
    }
    /** if active view is not found, set it to first view */
    if (!activeView.value && nextViews.length) {
      activeView.value = nextViews[0]
    }
  },
  { immediate: true },
)

/** Open view creation modal */
function openModal({ type, title = '', copyViewId }: { type: ViewTypes; title: string; copyViewId: string }) {
  modalOpen = true
  viewCreateType = type
  viewCreateTitle = title
  selectedViewId = copyViewId
}

/** Handle view creation */
function onCreate(view: GridType | FormType | KanbanType | GalleryType) {
  views.value.push(view)
  activeView.value = view
  router.push({ params: { viewTitle: view.title || '' } })
  modalOpen = false
}
</script>

<template>
  <a-layout-sider
    :collapsed="sidebarCollapsed"
    collapsiple
    collapsed-width="50"
    width="250"
    class="relative shadow-md h-full"
    theme="light"
  >
    <a-tooltip placement="left">
      <template #title> Toggle sidebar </template>

      <div
        class="group color-transition cursor-pointer hover:ring active:ring-pink-500 z-1 flex items-center p-[1px] absolute top-1/2 left-[-1rem] shadow bg-gray-100 rounded-full"
      >
        <MaterialSymbolsChevronRightRounded
          v-if="sidebarOpen"
          class="transform group-hover:(scale-115 text-pink-500) text-xl text-gray-400"
          @click="sidebarOpen = false"
        />

        <MaterialSymbolsChevronLeftRounded
          v-else
          class="transform group-hover:(scale-115 text-pink-500) text-xl text-gray-400"
          @click="sidebarOpen = true"
        />
      </div>
    </a-tooltip>

    <Toolbar v-if="sidebarOpen" class="flex items-center py-3 px-3 justify-between border-b-1" />

    <Toolbar v-else class="py-3 px-2 max-w-[50px] flex !flex-col-reverse gap-4 items-center mt-[-1px]">
      <template #start>
        <a-tooltip placement="left">
          <template #title> {{ $t('objects.webhooks') }}</template>

          <div class="nc-sidebar-right-item hover:after:bg-gray-300">
            <MdiHook />
          </div>
        </a-tooltip>

        <div class="dot" />

        <a-tooltip placement="left">
          <template #title> Get API Snippet</template>

          <div class="nc-sidebar-right-item group hover:after:bg-yellow-500">
            <MdiXml class="group-hover:(!text-white)" />
          </div>
        </a-tooltip>

        <div class="dot" />
      </template>
    </Toolbar>

    <div v-if="sidebarOpen" class="flex-1 flex flex-col">
      <MenuTop @open-modal="openModal" @deleted="loadViews" @sorted="loadViews" />

      <a-divider class="my-2" />

      <MenuBottom @open-modal="openModal" />
    </div>

    <dlg-view-create
      v-if="views"
      v-model="modalOpen"
      :title="viewCreateTitle"
      :type="viewCreateType"
      :selected-view-id="selectedViewId"
      @created="onCreate"
    />
  </a-layout-sider>
</template>

<style scoped>
:deep(.ant-menu-title-content) {
  @apply w-full;
}

:deep(.ant-layout-sider-children) {
  @apply flex flex-col;
}

.dot {
  @apply w-[3px] h-[3px] bg-gray-300 rounded-full;
}
</style>
