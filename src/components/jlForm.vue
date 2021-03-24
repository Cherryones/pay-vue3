<!--
 * @Author: xiongying@xgd.com
 * @Date: 2020-06-22 18:40:53
 * @Description:表单组件
-->
<template>
  <div class="custom-content">
    <cube-form
      action="#"
      :model="model"
      :schema="schema"
      :immediate-validate="false"
      :options="options"
      @submit="submitHandler">
      </cube-form>
  </div>
</template>
<script>
export default {
  data () {
    return {
      validity: {},
      valid: undefined,
      model: {},
      schema: {
        fields: []
      },
      options: {
        layout: 'standard' // classic fresh standard
      }
    }
  },
  props: ['modelDetail', 'jlModel'],
  watch: {
    modelDetail: {
      handler (val) {
        this.schema.fields = [...val]
      },
      immediate: true
    },
    jlModel: {
      handler (val) {
        this.model = {...val}
      },
      immediate: true
    }
  },
  methods: {
    // 触发提交按钮的点击事件
    triggerSubmit () {
      const el = document.getElementById('submit')
      el && el.click()
    },
    // 拼接备注并提交
    submitHandler (e, formData) {
      e.preventDefault() // 阻止表单提交跳转
      let remark = ''
      let models = [...this.modelDetail]
      models.pop()
      for (const item of models) {
        const key = item.modelKey
        const val = formData[key] || '-'
        remark += `${key}：${val}|`
      }
      remark = remark.substring(0, remark.length - 1).replace(/\s/g, '')
      if (remark.length > 127) {
        remark = remark.substring(0, 127)
      }
      this.$emit('setRemark', remark)
    }
  }
}
</script>
<style lang="stylus">
.custom-content
  padding 15px 1px 15px 1px
  .cube-form_standard .cube-validator
    padding-left 4px
  .cube-form_standard .cube-textarea-wrapper
    min-height 48px
  .cube-form-group-content .cube-form-item:last-child // 隐藏提交按钮
    display none
  .cube-form-item .cube-form-label
    font-size 14px
</style>
