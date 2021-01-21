<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="title" :has-add-button="false" />

    <p v-translate>
      This procedure changes status, tags and devices between two computers.
    </p>

    <div class="row q-pa-md q-gutter-md">
      <div class="col-4 col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Source</div>

            <q-select
              v-model="source"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Computer')"
              :options="computers"
              @filter="filterComputers"
              @filter-abort="abortFilterComputers"
              @input="loadDevices(source)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ scope.opt.__str__ }}
                </q-item>
              </template>

              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="computers"
                    :pk="scope.opt.id"
                    :value="scope.opt.__str__ || ''"
                    :icon="elementIcon(scope.opt.status)"
                    :tooltip="scope.opt.summary"
                  />
                </q-chip>
              </template>
            </q-select>
          </q-card-section>

          <q-card-section v-if="source">
            <ReplacementInfo :element="source" :is-loading="loading" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-4 col-md">
        <q-btn
          class="absolute-center vertical-top"
          color="primary"
          icon="mdi-arrow-right"
          icon-right="mdi-arrow-left"
          label="Replace"
          :disabled="!isEnabled || loading"
          @click="replace"
        />
      </div>

      <div class="col-4 col-md">
        <q-card>
          <q-card-section>
            <div v-translate class="text-h5 q-mt-sm q-mb-xs">Target</div>

            <q-select
              v-model="target"
              outlined
              use-input
              map-options
              input-debounce="0"
              :label="$gettext('Computer')"
              :options="computers"
              @filter="filterComputers"
              @filter-abort="abortFilterComputers"
              @input="loadDevices(target)"
            >
              <template #no-option>
                <q-item>
                  <q-item-section v-translate class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  {{ scope.opt.__str__ }}
                </q-item>
              </template>

              <template #selected-item="scope">
                <q-chip
                  removable
                  dense
                  :tabindex="scope.tabindex"
                  class="q-ma-md"
                  @remove="scope.removeAtIndex(scope.index)"
                >
                  <MigasLink
                    model="computers"
                    :pk="scope.opt.id"
                    :value="scope.opt.__str__ || ''"
                    :icon="elementIcon(scope.opt.status)"
                    :tooltip="scope.opt.summary"
                  />
                </q-chip>
              </template>
            </q-select>
          </q-card-section>

          <q-card-section v-if="target">
            <ReplacementInfo :element="target" :is-loading="loading" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import ReplacementInfo from 'components/computer/ReplacementInfo'
import { elementMixin } from 'mixins/element'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    MigasLink,
    ReplacementInfo
  },
  mixins: [elementMixin],
  data() {
    return {
      title: this.$gettext('Computers Replacement'),
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Data'),
          icon: 'mdi-database-search'
        },
        {
          text: this.$gettext('Computers'),
          to: 'computers-dashboard',
          icon: 'mdi-desktop-classic'
        },
        {
          text: this.$gettext('Computers Replacement'),
          icon: 'mdi-compare-horizontal'
        }
      ],
      computers: [],
      source: null,
      target: null,
      loading: false
    }
  },
  computed: {
    isEnabled() {
      return this.source !== null && this.target !== null
    }
  },
  methods: {
    filterComputers(val, update, abort) {
      // call abort() at any time if you can't retrieve data somehow
      if (val.length < 3) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.$axios
          .get('/api/v1/token/computers/', { params: { search: needle } })
          .then((response) => {
            this.computers = response.data.results
          })
        /* this.computers = stringOptions.filter(
          (v) => v.toLowerCase().indexOf(needle) > -1
        ) */
      })
    },

    abortFilterComputers() {
      // console.log('delayed filter aborted')
    },

    async loadDevices(obj) {
      if (obj !== null) {
        await this.$axios
          .get(`/api/v1/token/computers/${obj.id}/devices/`)
          .then((response) => {
            this.$set(obj, 'devices', response.data)
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
      }
    },

    async replace() {
      if (this.source !== null && this.target !== null) {
        this.loading = true
        await this.$axios
          .post(`/api/v1/token/computers/${this.source.id}/replacement/`, {
            target: this.target.id
          })
          .then((response) => {
            let tmp = null

            tmp = this.source.status
            this.$set(this.source, 'status', this.target.status)
            this.$set(this.target, 'status', tmp)

            tmp = this.source.tags
            this.$set(this.source, 'tags', this.target.tags)
            this.$set(this.target, 'tags', tmp)

            tmp = this.source.devices
            this.$set(this.source, 'devices', this.target.devices)
            this.$set(this.target, 'devices', tmp)

            this.$store.dispatch(
              'ui/notifySuccess',
              this.$gettext('Replacement made!')
            )
          })
          .catch((error) => {
            this.$store.dispatch('ui/notifyError', error)
          })
          .finally(() => (this.loading = false))
      }
    }
  }
}
</script>