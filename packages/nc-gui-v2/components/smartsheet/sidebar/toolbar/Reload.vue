<script setup lang="ts">
import { ReloadViewDataHookInj, RightSidebarInj } from '~/context'
import { inject, ref } from '#imports'

const reloadHook = inject(ReloadViewDataHookInj)!

const sidebarOpen = inject(RightSidebarInj, ref(true))

const onClick = () => reloadHook.trigger()
</script>

<template>
  <a-tooltip :placement="sidebarOpen ? 'bottomRight' : 'left'">
    <template #title> {{ $t('general.reload') }} </template>

    <div class="nc-sidebar-right-item hover:after:bg-green-500 group">
      <MdiReload class="cursor-pointer group-hover:(!text-white)" @click="onClick" />
    </div>
  </a-tooltip>
</template>
