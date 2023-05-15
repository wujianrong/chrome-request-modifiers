<template>
  <el-drawer v-model="drawer" :title="state.title" direction="rtl" :append-to-body="true" :size="540" :destroy-on-close="true">
    <div class="form-box">
      <el-form :model="state.form" label-width="90px" :rules="rules" ref="ruleFormRef">
        <el-form-item label="别名" prop="name">
          <el-input v-model.trim="state.form.name" />
        </el-form-item>
        <el-form-item label="接口" prop="api">
          <el-input v-model.trim="state.form.api" />
        </el-form-item>
        <el-form-item label="模式" prop="filterType">
          <el-radio-group v-model="state.form.filterType">
            <el-radio label="regex" />
            <el-radio label="normal" />
            <el-radio label="exact" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="配置">
          <div class="config-box">
            <div class="config-item">
              <span class="label">是否开启</span> <el-switch v-model="state.form.status"></el-switch>
            </div>
            <div class="config-item">
              <span class="label">忽略原请求状态</span> <el-switch v-model="state.form.httpStatus"></el-switch>
              <el-tooltip class="item" effect="dark" content="开启后，即使出现404/502等错误，接口也会返回经过篡改的出参，并将status统一改为200" placement="top-end">
                <el-icon class="http-status-tips"><Warning /></el-icon>
              </el-tooltip>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <JSONEditor :defaultValue="state.form.response" ref="JSONEditorRef" />
    </div>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="close">关闭</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { FormInstance, FormRules, ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import JSONEditor from './json-editor.vue'

const drawer = ref(false)
const state = reactive({
  title: '',
  form: {} as ApiItem
})

const emit = defineEmits(["submitSuccess"])

const JSONEditorRef = ref<InstanceType<typeof JSONEditor>>()


const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入别名', trigger: 'blur' }
  ],
  api: [
    { required: true, message: '请输入api', trigger: 'blur' }
  ],
  filterType: [
    { required: true, message: '请输入选择模式', trigger: 'blur' }
  ]
})


const open = async (item?: ApiItem) => {
  if (item) {
    state.form = JSON.parse(JSON.stringify(item))
    if (item.response) state.form.response = JSON.parse(item.response)
  } else {
    state.form = {} as ApiItem
  }
  drawer.value = true
  state.title = `${state.form.id ? '编辑' : '新增'}API`
}
const close = () => {
  drawer.value = false
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      const response = JSONEditorRef.value?.getValue()
      if (!response) {
        ElMessage.warning('请输入返回体')
      } else {
        if (!state.form.id) {
          state.form.id = 'API_KEY_' + (new Date()).getTime()
        }
        window.callChrome({
          key: 'SET_API_DATA', 
          params: {id: state.form.id, value: {...state.form, response: JSON.stringify(response)}},
        }, ()=> {
          ElMessage.success('操作成功~')
          emit('submitSuccess')
          close()
        })
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}


defineExpose({
  open,
  close
})

</script>

<style scoped lang="scss">
.form-box {
  padding: 0 20px;
  .config-box {
    @include flexBase(flex-start, center);
    .config-item {
      @include flexBase(flex-start, center);
      margin: 0 12px;
      font-size: 12px;
      .label {
        margin-right: 8px;
      }
      .http-status-tips {
        font-size: 18px;
        color: #999999;
        margin-left: 10px;
      }
    }
  }
}
</style>