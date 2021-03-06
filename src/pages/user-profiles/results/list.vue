<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header
      :title="title"
      :results="totalRecords"
      :add-routes="[{ route: 'user-profile-add' }]"
    />

    <SearchFilter
      v-model="tableFilters.search"
      @search="onSearch"
      @clear="onSearchClear"
    />

    <div class="row q-pa-md">
      <div class="col-12">
        <q-btn
          icon="mdi-filter-remove"
          color="info"
          text-color="black"
          :label="$gettext('Reset all filters')"
          @click="resetFilters"
        />
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
      <span slot="loadingContent" v-translate class="vgt-loading__content"
        >Loading data...
      </span>

      <template slot="table-row" slot-scope="props">
        <span v-if="props.column.field == 'actions'">
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-pencil"
            color="primary"
            @click="edit(props.row.id)"
            ><q-tooltip>{{ $gettext('Edit') }}</q-tooltip></q-btn
          >
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-delete"
            color="negative"
            @click="confirmRemove(props.row.id)"
            ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
          >
          <q-btn
            class="q-ma-xs"
            round
            size="sm"
            icon="mdi-account-key"
            color="info"
            @click="
              $router.push({
                name: 'user-profile-change-password',
                params: { id: props.row.id }
              })
            "
            ><q-tooltip>{{ $gettext('Change Password') }}</q-tooltip></q-btn
          >
        </span>

        <span v-else-if="props.column.field == 'username'">
          <MigasLink
            model="user-profiles"
            :pk="props.row.id"
            :value="props.row.username"
            icon="mdi-account-cog"
          />
        </span>

        <span v-else-if="props.column.field == 'domain_preference'">
          <MigasLink
            model="domains"
            :pk="props.row.domain_preference.id"
            :value="props.row.domain_preference.name"
            icon="mdi-earth"
          />
        </span>

        <span v-else-if="props.column.field == 'is_active'">
          <BooleanView v-model="props.row.is_active" />
        </span>

        <span v-else>
          {{ props.formattedRow[props.column.field] }}
        </span>
      </template>

      <q-banner slot="emptystate" rounded class="bg-warning text-black">
        <translate>There are no results</translate>
      </q-banner>

      <div slot="selected-row-actions">
        <q-btn
          size="sm"
          color="negative"
          icon="mdi-delete"
          @click="confirmRemove"
          ><q-tooltip>{{ $gettext('Delete') }}</q-tooltip></q-btn
        >
      </div>
    </vue-good-table>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import SearchFilter from 'components/ui/SearchFilter'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import BooleanView from 'components/ui/BooleanView'
import { datagridMixin } from 'mixins/datagrid'

export default {
  meta() {
    return {
      title: this.$gettext('User Profiles List')
    }
  },
  components: {
    Breadcrumbs,
    SearchFilter,
    Header,
    MigasLink,
    BooleanView
  },
  mixins: [datagridMixin],
  data() {
    return {
      title: this.$gettext('User Profiles'),
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
          text: this.$gettext('User Profiles'),
          icon: 'mdi-account-cog'
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
          label: this.$gettext('Username'),
          field: 'username',
          html: true,
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('First Name'),
          field: 'first_name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Last Name'),
          field: 'last_name',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('Filter'),
            trigger: 'enter'
          }
        },
        {
          label: this.$gettext('Enabled'),
          field: 'is_active',
          filterOptions: {
            enabled: true,
            placeholder: this.$gettext('All'),
            trigger: 'enter',
            filterDropdownItems: [
              { value: true, text: this.$gettext('Yes') },
              { value: false, text: this.$gettext('No') }
            ]
          }
        },
        {
          field: 'domain_preference.id',
          hidden: true
        },
        {
          label: this.$gettext('Domain Preference'),
          field: 'domain_preference.name'
        }
      ],
      model: 'user-profiles',
      detailRoute: 'user-profile-detail'
    }
  }
}
</script>
