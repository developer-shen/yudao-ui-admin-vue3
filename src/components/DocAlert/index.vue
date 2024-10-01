<template>
  <el-alert v-hasRole="['super_admin']" v-if="getEnable()" type="success" show-icon>
    <template #title>
      <div @click="goToUrl">{{ '【' + title + '】文档地址：' + url }}</div>
    </template>
  </el-alert>
</template>
<script setup lang="tsx">
import { propTypes } from '@/utils/propTypes'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

defineOptions({ name: 'DocAlert' })

const props = defineProps({
  title: propTypes.string,
  url: propTypes.string
})

/** 跳转 URL 链接 */
const goToUrl = () => {
  window.open(props.url)
}

/** 是否开启 */
const getEnable = () => {
  const { wsCache } = useCache()
  const roles = wsCache.get(CACHE_KEY.USER).roles
  const super_admin = 'super_admin'
  const roleFlag = ['super_admin']
  const hasRole = roles.some((role: string) => {
    return super_admin === role || roleFlag.includes(role)
  })

  return hasRole && import.meta.env.VITE_APP_DOCALERT_ENABLE !== 'false'
}
</script>
<style scoped>
.el-alert--success.is-light {
  margin-bottom: 10px;
  cursor: pointer;
  border: 1px solid green;
}
</style>
