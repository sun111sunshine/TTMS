import Poster from '../components/component/poster.vue'
import Footer from '../components/pages/index/footer.vue'
import Loading from '../components/component/loading.vue'
import Seat from '../components/component/selectSeat.vue'

import Vue from 'vue'
const components = [
  Poster,
  Footer,
  Loading,
  Seat
];
components.map(component => Vue.component(component.name, component));
export  default {
  Poster,
  Footer,
  Loading,
  Seat
}

