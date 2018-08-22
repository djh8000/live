<template>
  <div id="app">
    <transition :name="transitionName">
      <navigation>
        <router-view class="Router">
        </router-view>
      </navigation>
    </transition>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'app',
  data () {
    return {
      transitionName: ''
    }
  },
  created () {
    this.$navigation.on('forward', (to, from) => {
      if (to.route.name !== 'home') {
        this.transitionName = 'slide-left'
      }
    })
    this.$navigation.on('back', (to, from) => {
      this.transitionName = 'slide-right'
    })
    this.$navigation.on('replace', (to, from) => {
      this.transitionName = ''
    })
    // 配置文件
    this.getTopCate()
  },
  methods: {
    ...mapActions(['getTopCate'])
  }
}
</script>

<style lang="scss">
  #app{
    width:750px;
    margin:0 auto;
    height:100%;
    position: relative;
  }
  .Router {
    position: absolute;
    width: 100%;
    transition: all .4s ease;
  }

  .slide-left-enter,
  .slide-right-leave-active {
    opacity: 0;
    -webkit-transform: translate(100%, 0);
    transform: translate(100%, 0);
  }
  .slide-right-enter,
  .slide-left-leave-active{
    opacity: 0;
    -webkit-transform: translate(-100%, 0);
    transform: translate(-100% 0);
  }
  html,body{
    height:100%;
  }
  .msg{
    .mint-toast-text{
      font-size: 24px;
    }
  }
  .cropper-view-box img{
    max-width: none;
  }
  // 头部公共样式
  // .mint-header{
  //   .mint-button{
  //     height:80px;
  //     .mint-button-text{
  //       display:inline-block;
  //       vertical-align: middle;
  //       margin-left: -5px;
  //     }
  //   }
  // }
  .mint-field-clear{
    i{
      font-size: 30px;
    }
  }
</style>
