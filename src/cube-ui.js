import Vue from 'vue'

// By default we import all the components.
// Only reserve the components on demand and remove the rest.
// Style is always required.
import {
  // eslint-disable-next-line no-unused-vars
  Style,
  Dialog,
  Toast,
  Loading,
  Checkbox,
  CheckboxGroup,
  Radio,
  Button,
  Picker,
  Form
} from 'cube-ui'

Vue.use(Dialog)
Vue.use(Loading)
Vue.use(Toast)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Button)
Vue.use(Radio)
Vue.use(Picker)
Vue.use(Form)
