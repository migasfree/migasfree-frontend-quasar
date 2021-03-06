<template>
  <q-page padding>
    <Breadcrumbs :items="breadcrumbs" />

    <Header :title="$gettext('Package')">
      <template v-if="element.id" #append
        >:
        <MigasLink
          model="packages"
          :pk="element.id"
          :value="element.fullname"
          icon="mdi-package-variant"
        />
        <q-btn
          v-if="element.store.id"
          class="q-ma-md"
          size="md"
          icon="mdi-information"
          :label="$gettext('Package Information')"
          color="info"
          @click="
            $router.push({
              name: 'package-information',
              params: { id: element.id }
            })
          "
        />
      </template>
    </Header>

    <q-card>
      <q-card-section>
        <div class="row q-pa-md q-gutter-md">
          <div class="col-6 col-md">
            <template v-if="element.id">
              <translate>Project</translate>:
              <MigasLink
                model="projects"
                :pk="element.project.id"
                :value="element.project.name"
                icon="mdi-sitemap"
              />
            </template>
            <q-input
              v-else
              v-model="projectStore.selected"
              outlined
              readonly
              :label="$gettext('Project / Store')"
              @input="$refs.menu.show()"
            >
              <template #append>
                <q-icon name="mdi-menu-down" class="cursor-pointer" />
              </template>

              <q-menu ref="menu" fit auto-close>
                <q-tree
                  ref="tree"
                  class="q-ma-sm"
                  :nodes="projectStore.items"
                  node-key="id"
                  label-key="label"
                  :default-expand-all="true"
                  :selected="projectStore.selected"
                  @update:selected="nodeSelected"
                  @lazy-load="onLazyLoad"
                />
              </q-menu>
            </q-input>
          </div>

          <div class="col-6 col-md">
            <template v-if="element.id">
              <translate>Store</translate>:
              <MigasLink
                v-if="element.store.id > 0"
                model="stores"
                :pk="element.store.id"
                :value="element.store.name"
                icon="mdi-store-24-hour"
              />
            </template>
          </div>
        </div>

        <div v-if="element.id === 0" class="row q-pa-md q-gutter-md">
          <div class="col-12">
            <q-file
              v-model="element.files"
              clearable
              outlined
              counter
              :label="$gettext('Select one file')"
              ><template #prepend
                ><q-icon name="mdi-package-variant" /> </template
            ></q-file>
          </div>
        </div>

        <div v-if="element.id" class="row q-pa-md q-gutter-md">
          <div class="col-4 col-md">
            <translate>Name</translate>: <strong>{{ element.name }}</strong>
          </div>

          <div class="col-4 col-md">
            <translate>Version</translate>:
            <strong>{{ element.version }}</strong>
          </div>

          <div class="col-4 col-md">
            <translate>Architecture</translate>:
            <strong>{{ element.architecture }}</strong>
          </div>
        </div>
      </q-card-section>

      <q-card-actions v-if="element.id === 0" class="justify-around">
        <q-btn
          flat
          color="primary"
          icon="mdi-plus"
          :label="$gettext('Save and add other')"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('add')"
        />
        <q-btn
          color="primary"
          icon="mdi-content-save-move"
          :label="$gettext('Save')"
          :loading="loading"
          :disabled="!isValid || loading"
          @click="updateElement('return')"
        />
      </q-card-actions>
    </q-card>

    <div v-if="$route.params.id && element.id" class="row q-pa-md">
      <q-btn
        flat
        icon="mdi-delete"
        color="negative"
        :label="$gettext('Delete')"
        @click="confirmRemove = true"
      />
    </div>

    <RemoveDialog
      v-model="confirmRemove"
      @confirmed="remove"
      @canceled="confirmRemove = !confirmRemove"
    />
  </q-page>
</template>

<script>
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Header from 'components/ui/Header'
import MigasLink from 'components/MigasLink'
import RemoveDialog from 'components/ui/RemoveDialog'
import { elementMixin } from 'mixins/element'
import { detailMixin } from 'mixins/detail'

export default {
  meta() {
    return {
      title: this.title
    }
  },
  components: {
    Breadcrumbs,
    Header,
    RemoveDialog,
    MigasLink
  },
  mixins: [elementMixin, detailMixin],
  data() {
    const title = this.$gettext('Package')
    const element = { id: 0, files: null }

    return {
      title,
      originalTitle: title,
      breadcrumbs: [
        {
          text: this.$gettext('Dashboard'),
          to: 'home',
          icon: 'mdi-home'
        },
        {
          text: this.$gettext('Release'),
          icon: 'mdi-truck-delivery'
        },
        {
          text: this.$gettext('Packages'),
          to: 'packages-dashboard',
          icon: 'mdi-package-variant'
        }
      ],
      element,
      emptyElement: Object.assign({}, element),
      model: 'packages',
      listRoute: 'packages-list',
      addRoute: 'package-add',
      detailRoute: 'package-detail',
      projectStore: { items: [], selected: null },
      confirmRemove: false
    }
  },
  computed: {
    isValid() {
      return this.projectStore.selected !== null && this.element.files !== null
    },

    elementText() {
      return this.element.id ? this.element.fullname : ''
    }
  },
  methods: {
    nodeSelected(value) {
      if (typeof value !== 'string') return

      const keys = value.split('|')
      if (keys.length != 2) return

      const nodeProject = this.$refs.tree.getNodeByKey(parseInt(keys[0]))
      const nodeStore = this.$refs.tree.getNodeByKey(value)

      this.projectStore.selected = `${nodeProject.label} / ${nodeStore.label}`
      Object.assign(this.element, {
        project: { id: nodeProject.id },
        store: { id: nodeStore.store_id }
      })

      this.$refs.menu.hide()
    },

    onLazyLoad({ node, key, done, fail }) {
      this.$axios
        .get('/api/v1/token/stores/', { params: { project__id: key } })
        .then((response) => {
          done(
            Object.entries(response.data.results).map(([index, item]) => {
              return {
                id: `${key}|${item.id}`,
                label: item.name,
                icon: 'mdi-store-24-hour',
                store_id: item.id
              }
            })
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    async loadRelated() {
      await this.$axios
        .get(`/api/v1/token/projects/`)
        .then((response) => {
          this.projects = response.data.results

          this.projectStore.items = Object.entries(this.projects).map(
            ([key, item]) => {
              return {
                id: item.id,
                label: item.name,
                icon: 'mdi-sitemap',
                lazy: true
              }
            }
          )
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error)
        })
    },

    elementData() {
      if (this.element.id) {
        return {
          property_att: this.element.property_att.id,
          value: this.element.value,
          description: this.element.description
        }
      }

      let data = new FormData()
      data.append('project', this.element.project.id)
      data.append('store', this.element.store.id)
      data.append('files', this.element.files)

      return data
    },

    resetRelated() {
      this.projectStore.selected = null
    }
  }
}
</script>
