import { isSystemColumn } from 'nocodb-sdk'
import type { ColumnType, TableType, ViewType } from 'nocodb-sdk'
import { watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useNuxtApp } from '#app'
import { IsPublicInj } from '~/context'

export function useViewColumns(view: Ref<ViewType> | undefined, meta: ComputedRef<TableType>, reloadData?: () => void) {
  const isPublic = inject(IsPublicInj, ref(false))
  const fields = ref<
    {
      order: number
      show: number | boolean
      title: string
      fk_column_id?: string
      system?: boolean
    }[]
  >()

  const filterQuery = ref('')

  const { $api } = useNuxtApp()

  const loadViewColumns = async () => {
    if (!meta || !view) return

    let order = 1
    if (view.value?.id) {
      const data = (isPublic.value ? meta.value?.columns : await $api.dbViewColumn.list(view.value.id)) as any[]

      const fieldById = data.reduce<Record<string, any>>((acc, curr) => {
        curr.show = !!curr.show

        return {
          ...acc,
          [curr.fk_column_id]: curr,
        }
      }, {})

      fields.value = meta.value?.columns
        ?.map((column) => {
          const currentColumnField = fieldById[column.id!] || {}

          return {
            title: column.title,
            fk_column_id: column.id,
            ...currentColumnField,
            order: currentColumnField.order || order++,
            system: isSystemColumn(currentColumnField.type || false),
          }
        })
        .sort((a, b) => a.order - b.order)
    }
  }

  const showAll = async (ignoreIds?: any) => {
    if (view?.value?.id) {
      if (ignoreIds) {
        await $api.dbView.showAllColumn(view.value.id, {
          ignoreIds,
        })
      } else {
        await $api.dbView.showAllColumn(view.value.id)
      }
    }

    await loadViewColumns()
    reloadData?.()
  }
  const hideAll = async (ignoreIds?: any) => {
    if (view?.value?.id) {
      if (ignoreIds) {
        await $api.dbView.hideAllColumn(view.value.id, {
          ignoreIds,
        })
      } else {
        await $api.dbView.hideAllColumn(view.value.id)
      }
    }

    await loadViewColumns()
    reloadData?.()
  }

  const saveOrUpdate = async (field: any, index: number) => {
    if (isPublic && fields.value) {
      fields.value[index] = field
      meta.value.columns = meta.value?.columns?.map((column) => {
        if (column.id === field.fk_column_id) {
          return {
            ...column,
            ...field,
          }
        }
        return column
      })

      reloadData?.()
      return
    }

    if (field.id && view?.value?.id) {
      await $api.dbViewColumn.update(view.value.id, field.id, field)
    } else if (view?.value?.id) {
      if (fields.value) fields.value[index] = (await $api.dbViewColumn.create(view.value.id, field)) as any
    }

    reloadData?.()
  }

  const metaColumnById = computed(() => {
    return (
      meta.value?.columns?.reduce<Record<string, ColumnType>>((acc, curr) => {
        return {
          ...acc,
          [curr.id!]: curr,
        }
      }, {}) || {}
    )
  })

  const showSystemFields = computed({
    get() {
      return view?.value?.show_system_fields || false
    },
    set(v: boolean) {
      if (view?.value?.id) {
        if (!isPublic.value) {
          $api.dbView
            .update(view.value.id, {
              show_system_fields: v,
            })
            .finally(() => reloadData?.())
        }
        ;(view.value as any).show_system_fields = v
      }
    },
  })

  const filteredFieldList = computed(() => {
    return (
      fields.value?.filter((field) => {
        // hide system columns if not enabled
        if (!showSystemFields.value && isSystemColumn(metaColumnById?.value?.[field.fk_column_id!])) {
          return false
        }

        return !filterQuery?.value || field.title.toLowerCase().includes(filterQuery.value.toLowerCase())
      }) || {}
    )
  })

  const sortedAndFilteredFields = computed<ColumnType[]>(() => {
    return (fields?.value
      ?.filter((c) => {
        // hide system columns if not enabled
        if (
          !showSystemFields.value &&
          metaColumnById.value &&
          metaColumnById?.value?.[c.fk_column_id!] &&
          isSystemColumn(metaColumnById.value?.[c.fk_column_id!])
        ) {
          return false
        }
        return c.show && metaColumnById?.value?.[c.fk_column_id!]
      })
      ?.sort((a, b) => a.order - b.order)
      ?.map((c) => metaColumnById?.value?.[c.fk_column_id!]) || []) as ColumnType[]
  })

  // reload view columns when table meta changes
  watch(meta, () => loadViewColumns())

  return {
    fields,
    loadViewColumns,
    filteredFieldList,
    filterQuery,
    showAll,
    hideAll,
    saveOrUpdate,
    sortedAndFilteredFields,
    showSystemFields,
  }
}
