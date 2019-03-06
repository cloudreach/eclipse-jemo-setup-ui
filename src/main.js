import Vue from 'vue'
import VueResource from 'vue-resource'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false;

Vue.use(VueResource);
Vue.http.options.root = 'http://localhost/x2manager/setup';

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
