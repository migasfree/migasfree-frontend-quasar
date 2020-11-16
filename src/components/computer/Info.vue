<template>
  <q-card>
    <q-card-section>
      <q-btn-group v-if="$store.getters['auth/user'].is_superuser">
        <q-input v-model="value" outlined label="Nombre" />
        <q-btn
          color="primary"
          icon="mdi-content-save"
          :loading="loading"
          :disabled="loading"
          @click="updateName"
        />
      </q-btn-group>
      <div v-else class="text-h5">{{ name }}</div>
    </q-card-section>

    <q-card-section>
      <div class="row q-pa-md">
        <q-tooltip self="bottom middle">full qualified domain name</q-tooltip>
        <q-icon name="mdi-information" size="sm" /> {{ fqdn }}
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <q-tooltip self="bottom middle">project</q-tooltip>
          <q-icon name="mdi-sitemap" size="sm" />
          <MigasLink model="projects" :pk="project.id" :value="project.name" />
        </div>
        <div class="col-md">
          <q-tooltip self="bottom middle"
            >Date of entry into the migasfree system</q-tooltip
          >
          <q-icon name="mdi-calendar-plus" size="sm" />
          {{ showDate(createdAt) }}
        </div>
      </div>

      <div class="row q-pa-md">
        <div class="col-md">
          <q-tooltip self="bottom middle">ip address</q-tooltip>
          <q-icon name="mdi-ip-network" size="sm" />
          {{ ipAddress }}
        </div>
        <div class="col-md">
          <q-tooltip self="bottom middle">forwarded ip address</q-tooltip>
          <q-icon name="mdi-ip" size="sm" />
          {{ forwardedIpAddress }}
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="evenly">
      <q-btn-group>
        <q-btn
          icon="mdi-calendar-multiple"
          label="Sucesos"
          no-caps
          :to="{
            name: 'computer-events',
            params: { id: cid }
          }"
        />
        <q-btn
          icon="mdi-head-sync-outline"
          label="Simular sincronización"
          no-caps
          :to="{
            name: 'computer-simulate',
            params: { id: cid }
          }"
        />
        <q-btn
          icon="mdi-card-account-details-outline"
          label="Identificación"
          no-caps
          :to="{
            name: 'computer-label',
            params: { id: cid }
          }"
        />
      </q-btn-group>
    </q-card-actions>
  </q-card>
</template>

<script>
import { dateMixin } from 'mixins/date'
import MigasLink from 'components/MigasLink'

export default {
  name: 'ComputerInfo',
  components: {
    MigasLink
  },
  mixins: [dateMixin],
  props: {
    cid: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    fqdn: {
      type: String,
      required: false,
      default: null
    },
    project: {
      type: Object,
      required: true
    },
    createdAt: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      required: false,
      default: null
    },
    forwardedIpAddress: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      value: this.name
    }
  },
  methods: {
    async updateName() {
      this.loading = true
      await this.$axios
        .patch(`/api/v1/token/computers/${this.cid}/`, {
          name: this.value,
        })
        .then((response) => {
          console.log(response)
          this.$store.dispatch(
            'ui/notifySuccess',
            'Name has been changed!'
          )
          this.loading = false
        })
        .catch((error) => {
          this.$store.dispatch('ui/notifyError', error.response.data.detail)
          this.loading = false
        })
    }
  }
}
</script>