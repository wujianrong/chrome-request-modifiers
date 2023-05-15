<template>
  <div class="json-editor-box" ref="refJsonEditor"></div>
</template>

<script setup lang="ts">
import JSONEditor from 'jsoneditor/dist/jsoneditor.min.js'
import 'jsoneditor/dist/jsoneditor.min.css'
import { ref, onMounted } from 'vue'
const refJsonEditor = ref(null)
const options = ref({
  mode: 'code',
  modes: ['tree', 'code']
})
const props = defineProps({
    defaultValue: {
      type: Object,
      default: () => {}
    }
})
const editor = ref()
onMounted(() => {
  // 初始化editor
  editor.value = new JSONEditor(refJsonEditor.value, options.value)
  editor.value?.set(props.defaultValue)
})

const getValue = () => {
  let data
  try {
    data = editor.value?.get()
  } catch (error) {}
  return data
}

const setValue = (data: object) => {
  editor.value?.set(data)
}

defineExpose({
  getValue,
  setValue
})

</script>

<style lang="scss" scoped>
.json-editor-box {
  height: 400px;
}
</style>