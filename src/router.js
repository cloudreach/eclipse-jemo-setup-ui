import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {path: '/', name: 'home', component: Home},
        {path: '/csp', name: 'csp', props: true, component: () => import('./views/Csp.vue')},
        {path: '/csp-cred', name: 'csp-cred', props: true, component: () => import('./views/CspCredentials.vue')},
        {path: '/csp-perm', name: 'csp-perm', props: true, component: () => import('./views/CspPermissions.vue')},
        {path: '/user/create', name: 'user-create', props: true, component: () => import('./views/CreateUser.vue')},
        {path: '/jemo/params', name: 'jemo-params', props: true, component: () => import('./views/JemoParams.vue')}
    ]
})
