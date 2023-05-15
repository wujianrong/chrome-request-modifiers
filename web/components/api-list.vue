<template>
  <div class="api-list-header">
    <el-input class="search-input" placeholder="根据别名/api 搜索" v-model="keyword" @input="searchFn" />
    <el-button type="primary" size="small" @click.native="editApiItem()" :icon="Plus" circle />
    <!-- <el-button  @click.native="getApiList" :icon="Refresh" circle /> -->
  </div>
  <div class="api-list-box">
    <el-card class="api-item-card" :class="{'status-close': !item.status}" v-for="item, index in state.apiListData" :key="index">
      <div class="api-item-box">
        <div class="card-header">
          <span class="title">
            {{ item.name }}
          </span>
          <div class="bar" :class="{'events-close': !item.status}">
            <el-button type="primary" @click.native="editApiItem(item)" size="small" color="#626aef" :icon="Edit" circle
              plain />
            <el-button type="danger" @click.native="deleteApiItem(item)" size="small" :icon="Delete" circle plain />
          </div>
        </div>
        <div class="card-content">
          {{ item.api }}
        </div>
        <div class="card-footer">
          <el-tag type="success">{{ item.filterType }}</el-tag>
          <el-switch v-model="item.status" size="small" @change="(val: boolean) => { switchChange(item, val) }" />
        </div>
      </div>
    </el-card>
    <json-view-dialog ref="jsonViewDialogRef" @submitSuccess="getApiList"/>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import jsonViewDialog from './json-view-dialog.vue'

const keyword = ref('')
const state = reactive({
  apiListData: [] as ApiItem[]
})
/**
 * 获取api列表
 */
const getApiList = async (params?: string) => {
  const _keyword = params || keyword.value || ''
  // API_DATA
  window.callChrome({ key: 'GET_API_DATA_ALL', value: {} }, (value: ApiItem[]) => {
    const _apiListData = value
    state.apiListData = _apiListData.filter((i: ApiItem) => i.api.includes(_keyword) || i.name.includes(_keyword))
  })
}
const searchFn = (val: string) => {
  getApiList(val)
}


const jsonViewDialogRef = ref<InstanceType<typeof jsonViewDialog>>()
const editApiItem = (item?: ApiItem) => {
  jsonViewDialogRef.value?.open(item)
}

const deleteApiItem = (item: ApiItem) => {
  ElMessageBox.confirm(
    '确认定删除吗？',
    'Warning',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      if (item.id) {
        window.callChrome({
          key: 'REMOVE_API_DATA', 
          params: {id: item.id},
        }, ()=> {
          getApiList()
        })
      }
    })
    .catch(() => { })
}

const switchChange = async (item: ApiItem, value: boolean) => {
  if (item.id) {
    window.callChrome({
      key: 'SET_API_DATA', 
      params: {id: item.id, value: {...item, status: value}},
    })
  }
}


onMounted(async () => {
  getApiList()
})

defineExpose({
  getApiList
})

</script>

<style lang="scss" scoped>
.api-list-header {
  @include flexBase;
  padding-top: 4px;
  margin-bottom: 10px;
  .search-input {
    width: 280px;
    margin-right: 20px;
  }
}
.api-list-box {
  @include flexBase;
  flex-wrap: wrap;

  .api-item-card {
    width: 280px;
    margin: 0 10px 10px 0;
  }

  .api-item-box {
    @include flexBase(space-between, flex-start);
    flex-direction: column;

    >div {
      width: 100%
    }

    .card-header,
    .bar,
    .card-footer {
      @include flexBase(space-between);
    }

    .card-content {
      @include text-line(3);
      height: 64px;
      margin: 16px 0;
      padding: 8px;
      box-sizing: border-box;
      border-radius: 5px;
      color: #ffffff;
      background-image: linear-gradient(60deg, #29323c 0%, #485563 100%);
    }

    .title {
      @include text-line();
      font-size: 13px;
      font-weight: 600;
      padding-right: 10px;
    }
  }
}
</style>