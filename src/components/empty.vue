<template>
  <div class="empty-content flex j-c a-c">
    <div class="empty">
      <span class="empty-icon LIVEFONT">&#xe76a;</span>
      <div class="empty-info">{{emptyInfo}}</div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  computed: {
  },
  props: ['emptyInfo'],
  mounted () {
  },
  updated () {
  }
}
</script>

<style lang="scss">
.empty-content{
  background: #f8f8f8;
  width: 100%;
  height: calc(100vh - 130px);
  color: #bbb;
}
.empty .empty-icon{
  font-size: 120px;
  display: block;
}
.empty .empty-info{
  font-size: 26px;
  margin-top: 10px;
}
</style>