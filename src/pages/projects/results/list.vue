<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      @new="$router.push({ name: 'project-add' })"
    />

    <SearchFilter
      v-model="tableFilters.search"
      @search="onSearch"
      @clear="onSearchClear"
    />

    <div class="row q-pa-md">
      <div class="col-12">
        <q-btn :label="$gettext('Reset all filters')" @click="resetFilters" />
      </div>
    </div>

    <vue-good-table
      ref="myTable"
      :columns="columns"
      :rows="rows"
      mode="remote"
      compact-mode
      :total-rows="totalRecords"
      :is-loading.sync="isLoading"
      :line-numbers="false"
      :select-options="selectOptions"
      :pagination-options="paginationOptions"
      :search-options="searchOptions"
      style-class="vgt-table striped condensed"
      @on-page-change="onPageChange"
      @on-sort-change="onSortChange"
      @on-column-filter="onColumnFilter"
      @on-per-page-change="onPerPageChange"
      @on-selected-rows-change="onSelectionChanged"
    >
      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'actions'">
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-pencil"
            color="primary"
            @click="edit(props.row.id)"
          />
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-delete"
            color="negative"
            @click="confirmRemove(props.row.id)"
          />
        </span>
        <span v-else-if="props.column.field == 'platform.name'">
          <MigasLink
            model="platforms"
            :pk="props.row.platform.id"
            :value="props.row.platform.name"
            icon="mdi-layers"
          />
        </span>
        <span v-else-if="props.column.field == 'name'">
          <MigasLink
            model="projects"
            :pk="props.row.id"
            :value="props.row.name"
            icon="mdi-sitemap"
          />
        </span>
        <span v-else-if="props.column.field == 'auto_register_computers'">
          <BooleanView v-model="props.row.auto_register_computers" />
        </span>
        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>
      <div slot="emptystate" v-translate>There are no results</div>
      <div slot="selected-row-actions">
        <q-btn
          size="sm"
          color="negative"
          icon="mdi-delete"
          @click="confirmRemove"
        />
      </div>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import Header from 'components/ui/Header'
import BooleanView from 'components/ui/BooleanView'
import MigasLink from 'components/MigasLink'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('Projects List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    BooleanView,
    MigasLink
  },
  mixins: [datagridMixin],
  data() {
    return {
      title: this.$gettext('Projects'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Configuration'),
          icon: 'mdi-cogs'
        },
        {
          text: this.$gettext('Projects'),
          icon: 'mdi-sitemap'
        },
        {
          text: this.$gettext('Results')
        }
      ],
      columns: [
        {
          field: 'id',
          hidden: true
        },
        {
          label: this.$gettext('Actions'),
          field: 'actions',
          html: true,
          sortable: false,
          globalSearchDisabled: true
        },
        {
          label: this.$gettext('Name'),
          field: 'name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          field: 'platform.id',
          hidden: true
        },
        {
          label: this.$gettext('Platform'),
          field: 'platform.name',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Package Management System'),
          field: 'pms',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Auto register computers'),
          field: 'auto_register_computers',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
            filterDropdownItems: [
              { value: true, text: this.$gettext('Yes') },
              { value: false, text: this.$gettext('No') }
            ]
          }
        }
      ],
      model: 'projects',
      detailRoute: 'project-detail'
    }
  },
  methods: {
    async loadFilters() {
      await this.$axios
        .get('/api/v1/token/platforms/')
        .then((response) => {
          this.columns.find(
            (x) => x.field === 'platform.name'
          ).filterOptions.filterDropdownItems = response.data.results.map(
            (item) => {
              return {
                value: item.id,
                text: item.name
              }
            }
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    }
  }
}
</script>