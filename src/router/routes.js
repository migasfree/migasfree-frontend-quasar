const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Dashboard')
      },

      {
        path: '/computers',
        name: 'computers-dashboard',
        component: () => import('pages/computers/index')
      },
      {
        path: '/computers/results',
        name: 'computers-list',
        component: () => import('pages/computers/results/list')
      },
      {
        path: '/computers/results/:id',
        name: 'computer-detail',
        component: () => import('pages/computers/results/detail')
      },
      {
        path: '/computers/results/:id/events',
        name: 'computer-events',
        component: () => import('pages/computers/results/events')
      },
      {
        path: '/computers/results/:id/sync/simulation',
        name: 'computer-simulate',
        component: () => import('pages/computers/results/simulate')
      },

      {
        path: '/features',
        name: 'attributes-dashboard',
        component: () => import('pages/attributes/index')
      },
      {
        path: '/features/results',
        name: 'attributes-list',
        component: () => import('pages/attributes/results/list')
      },
      {
        path: '/features/results/:id',
        name: 'attribute-detail',
        component: () => import('pages/attributes/results/detail')
      },

      {
        path: '/tags',
        name: 'tags-dashboard',
        component: () => import('pages/tags/index')
      },
      {
        path: '/tags/results',
        name: 'tags-list',
        component: () => import('pages/tags/results/list')
      },
      {
        path: '/tags/add',
        name: 'tag-add',
        component: () => import('pages/tags/results/detail')
      },
      {
        path: '/tags/results/:id',
        name: 'tag-detail',
        component: () => import('pages/tags/results/detail')
      },

      {
        path: '/errors',
        name: 'errors-dashboard',
        component: () => import('pages/errors/index')
      },
      {
        path: '/errors/results',
        name: 'errors-list',
        component: () => import('pages/errors/results/list')
      },
      {
        path: '/errors/results/:id',
        name: 'error-detail',
        component: () => import('pages/errors/results/detail')
      },

      {
        path: '/faults',
        name: 'faults-dashboard',
        component: () => import('pages/faults/index')
      },
      {
        path: '/faults/results',
        name: 'faults-list',
        component: () => import('pages/faults/results/list')
      },
      {
        path: '/faults/results/:id',
        name: 'fault-detail',
        component: () => import('pages/faults/results/detail')
      },

      {
        path: '/syncs',
        name: 'syncs-dashboard',
        component: () => import('pages/syncs/index')
      },
      {
        path: '/syncs/results',
        name: 'syncs-list',
        component: () => import('pages/syncs/results/list')
      },
    ],
    meta: { authRequired: true }
  },

  {
    path: '/login',
    component: () => import('layouts/Empty.vue'),
    children: [
      { path: '', name: 'login', component: () => import('pages/Login.vue') },
      {
        path: '/computers/results/:id/label',
        name: 'computer-label',
        component: () => import('pages/computers/results/label.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
