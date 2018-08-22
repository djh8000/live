<template>
  <div class="spinner-content flex">
    <div class="started flex a-c" v-if="isLive">
      <span class="live-status" :style="{color:isColor}">正在直播</span>
      <p class="spinner clearfix"><span></span><span></span><span></span><span></span></p>
    </div>
    <div class="unstarted" v-else>
      <p class="spinner1 clearfix"><span></span><span></span><span></span><span></span></p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  props: ['isLive', 'isColor'],
  computed: {
  },
  mounted () {
  },
  updated () {
  }
}
</script>

<style lang="scss">
 // 直播动画
.spinner1 {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: end;
  -ms-flex-align: end;
  align-items: flex-end;
}
.spinner1 span {
  display: block;
  width: 2px;
  margin: 0 0.03rem;
  height: 0.13rem;
  background: #a4a4a4;
}
.spinner1 span:nth-child(2n) {
  height: 0.26rem;
}
.spinner {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: end;
  -ms-flex-align: end;
  align-items: flex-end;
  height: 0.26rem;
}
.live-status{
  margin-right: 10px;
}
.spinner span {
  display: block;
  width: 2px;
  margin: 0 0.03rem;
  height: 0.13rem;
  background: $master-color;
  -webkit-animation: bounce 1.2s infinite;
  animation: bounce 1.2s infinite;
}
.spinner span:nth-child(2n) {
  height: 0.26rem;
}
.spinner span:nth-child(1) {
  -webkit-animation-delay: 1s;
  animation-delay: 1s;
}
.spinner span:nth-child(2) {
  -webkit-animation-delay: 0.8s;
  animation-delay: 0.8s;
}
.spinner span:nth-child(3) {
  -webkit-animation-delay: 1s;
  animation-delay: 1s;
}
.spinner span:nth-child(4) {
  -webkit-animation-delay: 0.8s;
  animation-delay: 0.8s;
}
@-webkit-keyframes bounce {
  0%,
  40%,
  100% {
    height: 0.26rem;
  }
  20%,
  60% {
    height: 0.13rem;
  }
}
@keyframes bounce {
  0%,
  40%,
  100% {
    height: 0.26rem;
  }
  20%,
  60% {
    height: 0.13rem;
  }
}
// 直播动画   end
</style>