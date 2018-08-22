<template>
  <div>
    <el-head></el-head>
    <div class="page-content">
      <nuxt/>
    </div>
  </div>
</template>
<script>
import elHead from '~/components/head.vue'
export default {
  components: {elHead}
}
</script>
<style lang="scss" scoped>
.page-content{
  width:1200px;
  margin:0 auto;
  min-height: 100vh;
}
</style>
