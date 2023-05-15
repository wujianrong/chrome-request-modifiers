<template>
  <div id="app-vue">
    <header class="app-header">
      <el-switch v-model="state.ruleForm.switchVal" @change="switchChange"></el-switch>
      <el-icon class="close-icon" @click="closeFn"><CloseBold /></el-icon>
    </header>
    <el-divider />
    <main v-show="state.ruleForm.switchVal">
      <api-list ref="apiListRef" />
    </main>
    <!-- <footer class="app-footer"></footer> -->
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { sendXHR } from './utils/send-api'
import apiList from './components/api-list.vue'
import { CloseBold } from '@element-plus/icons-vue'

const state = reactive({
  ruleForm: {
    switchVal: false
  }
})

const sendXHRObject = new sendXHR
const switchChange = async (value: boolean) => {
  window.callChrome({ key: 'SET_SWITCH', params: { value } })
}

const closeFn = () => {
  sendXHRObject.setAllShow(false)
}

onMounted(async () => {
  window.callChrome({ key: 'GET_SWITCH', params: {} }, (value: boolean) => {
    state.ruleForm.switchVal = value
  })
})
</script>

<style lang="scss" scoped>
#app-vue {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-image: linear-gradient(-20deg, #e9defa 0%, #fbfcdb 100%);
  box-sizing: border-box;
  padding: 8px 20px 50px 20px;
  overflow-y: auto;
  .app-header {
    @include flexBase(space-between, center);
    .close-icon {
      cursor: pointer;
      font-size: 18px;
    }
  }
  .app-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 99;
    width: 100%;
    height: 50px;
    @include flexBase(center, center);
  }
}
</style>