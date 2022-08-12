import type { FilterType, ViewType } from 'nocodb-sdk'
import type { ComputedRef, Ref } from 'vue'
import { useNuxtApp, useUIPermission } from '#imports'
import { useMetas } from '~/composables/useMetas'
import { IsPublicInj, MetaInj } from '~/context'

export function useViewFilters(
  view: Ref<ViewType> | undefined,
  parentId?: string,
  autoApply?: ComputedRef<boolean>,
  reloadData?: () => void,
) {
  const { filters: sharedViewFilter } = useSharedView()
  const meta = inject(MetaInj)
  const { loadData } = useViewData(meta, view)

  const filters = ref<(FilterType & { status?: 'update' | 'delete' | 'create'; parentId?: string })[]>([])

  const isPublic = inject(IsPublicInj, ref(false))
  const { $api } = useNuxtApp()
  const { isUIAllowed } = useUIPermission()
  const { metas } = useMetas()

  const loadFilters = async () => {
    if (isPublic.value) return

    if (parentId) {
      filters.value = await $api.dbTableFilter.childrenRead(parentId)
    } else {
      filters.value = await $api.dbTableFilter.read(view?.value?.id as string)
    }
  }

  const sync = async (_nested = false) => {
    for (const [i, filter] of Object.entries(filters.value)) {
      if (filter.status === 'delete') {
        await $api.dbTableFilter.delete(filter.id as string)
      } else if (filter.status === 'update') {
        await $api.dbTableFilter.update(filter.id as string, {
          ...filter,
          fk_parent_id: parentId,
        })
      } else if (filter.status === 'create') {
        filters.value[+i] = (await $api.dbTableFilter.create(view?.value?.id as string, {
          ...filter,
          fk_parent_id: parentId,
        })) as any
      }
    }
    reloadData?.()
  }

  const deleteFilter = async (filter: FilterType & { status: string }, i: number) => {
    // if shared or sync permission not allowed simply remove it from array
    if (isPublic.value || !isUIAllowed('filterSync')) {
      filters.value.splice(i, 1)
      reloadData?.()
    } else {
      if (filter.id) {
        // if auto-apply disabled mark it as disabled
        if (!autoApply?.value) {
          filter.status = 'delete'
          // if auto-apply enabled invoke delete api and remove from array
        } else {
          await $api.dbTableFilter.delete(filter.id)
          reloadData?.()
          filters.value.splice(i, 1)
        }
        // if not synced yet remove it from array
      } else {
        filters.value.splice(i, 1)
      }
    }
  }

  const saveOrUpdate = async (filter: FilterType & { status?: string }, i: number, force = false) => {
    if (!view?.value) return
    if (isPublic.value || !isUIAllowed('filterSync')) {
      // skip
    } else if (!autoApply?.value && !force) {
      filter.status = filter.id ? 'update' : 'create'
    } else if (filter.id) {
      await $api.dbTableFilter.update(filter.id, {
        ...filter,
        fk_parent_id: parentId,
      })
    } else {
      filters.value[i] = await $api.dbTableFilter.create(view?.value?.id as string, {
        ...filter,
        fk_parent_id: parentId,
      })
    }
    reloadData?.()
  }

  const addFilter = () => {
    filters.value = [
      ...filters.value,
      {
        comparison_op: 'eq',
        value: '',
        status: 'create',
        logical_op: 'and',
      },
    ]
  }

  const addFilterGroup = async () => {
    filters.value = [
      ...filters.value,
      {
        parentId,
        is_group: true,
        status: 'create',
        logical_op: 'and',
      },
    ]
    const index = filters.value.length - 1
    await saveOrUpdate(filters.value[index], index, true)
  }

  /** on column delete reload filters, identify by checking columns count */
  watch(
    () => {
      if (!view?.value || !metas?.value?.[view?.value?.fk_model_id as string]) {
        return 0
      }

      return metas?.value?.[view?.value?.fk_model_id as string]?.columns?.length || 0
    },
    async (nextColsLength, oldColsLength) => {
      if (nextColsLength < oldColsLength) {
        await loadFilters()
      }
    },
  )

  watch(
    () => filters.value,
    () => {
      if (!isPublic.value) return

      sharedViewFilter.value = filters.value
      loadData()
    },
  )

  return { filters, loadFilters, sync, deleteFilter, saveOrUpdate, addFilter, addFilterGroup }
}
