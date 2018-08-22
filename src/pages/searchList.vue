<template>
  <div class="list">
    <div v-if="loadingMask" class="loading flex a-c j-c">
      <mt-spinner type="snake" color="#26a2ff"></mt-spinner>
    </div>
    <div class="inList">
      <div class="main">
        <div class="list-main mescroll mescroll-hardware " ref="scrollWrap"  id="list-mescroll">
          <ul>
            <li v-for="(item,index) in lives">
              <router-link class="flex" :to="'/item?targetId='+ item.id">
                <div class="cover">
                  <img :src="item.img">
                  <div class="living" v-if="item.started == 1">
                    <spinner :isLive="true" :isColor="'#fff'"></spinner>
                  </div>
                </div>
                <div class="text">
                  <p class="name">{{item.name}}</p>
                  <p v-if="item.price == '0.00'">免费</p>
                  <p v-else>￥{{item.price}}</p>
                  <p>预约{{item.appointNum}}次</p>
                    <div v-if="item.isLogin === 1" class="out-login">
                      <!-- 登陆 -->
                      <mt-button v-if="item.status === 5 " class="live-btn btnColor1">已关闭</mt-button>
                      <div v-else-if="item.hasBuy === 1" class="out-ifbuy">
                        <!-- 已购买 -->
                        <div v-if="item.isEnter === 1" class="isEnter">
                          <mt-button class="live-btn btnColor3">去上课</mt-button>
                        </div>
                        <div v-else class="isEnter">
                          <mt-button v-if="item.status === 0 " class="live-btn btnColor1">已预约</mt-button>
                          <mt-button v-if="item.status === 2 " class="live-btn btnColor1">回放准备中</mt-button>
                          <mt-button v-if="item.status === 3 " class="live-btn btnColor2">查看回放</mt-button>
                        </div>
                      </div>
                      <div v-else class="out-ifbuy">
                        <!-- 未购买 -->
                         <mt-button class="live-btn btnColor2">预约</mt-button>
                      </div>
                    </div>
                    <div v-if="item.isLogin === 0" class="out-login">
                      <!-- 未登陆 -->
                      <mt-button v-if="item.status === 1" class="live-btn btnColor1">预约</mt-button>
                      <mt-button v-else class="live-btn btnColor1">进入直播</mt-button>
                    </div>
                </div>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import spinner from '../components/spinner.vue'
import { mapState } from 'vuex'
export default {
  name: 'searchList',
  data () {
    return {
      getDt: {
        page: 0,
        pagenum: 10,
        couponId: this.$route.query.couponId
      },
      lives: Array,
      clientHeight: '',
      loading: false,
      allLoaded: false,
      loadingMask: true // 显示遮罩
    }
  },
  computed: {
    ...mapState([
      'topCate'
    ])
  },
  activated () {
    this.$refs.scrollWrap.scrollTop = this.$store.state.pageYOffset
  },
  deactivated () {
    this.$store.commit('setPageYOffset', this.$refs.scrollWrap.scrollTop)
  },
  mounted () {
    this.initHeight() // 高度初始化
    this.configMescroll()
  },
  components: {
    spinner
  },
  watch: {
    clientHeight: function () {
      this.changeFixed(this.clientHeight)
    }
  },
  methods: {
    configMescroll () {
      const that = this
      this.mescroll = new this.MeScroll('list-mescroll', {
        up: {
          callback: that.loadMoretop,
          // isBounce: false,
          noMoreSize: 1
        }
      })
    },
    loadMoretop (page) {
      this.getDt.page = page.num
      this.http.post('api/coupon/getLiveCoupon', this.getDt)
      .then(res => {
        this.loadingMask = false
        const { lives = [] } = res.data
        if (page.num === 1) {
          this.lives = lives
        } else {
          this.lives = [...this.lives, ...lives]
        }
        let hasNext = false
        if (this.getDt.page >= Math.ceil(res.data.total / 10)) {
          // 没有下一页
          hasNext = false
        } else {
          hasNext = true
        }
        this.mescroll.endSuccess(lives.length, hasNext)
      })
        .catch(() => {
          this.mescroll.endErr()
        })
    },
    changeFixed (clientHeight) {
      this.$refs.scrollWrap.style.height = clientHeight + 'px'
    },
    initHeight () {
      this.clientHeight = $(document).height()
      window.onresize = () => {
        this.clientHeight = $(document).height()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.inList{
  height: 100%;
}
.main{
  box-sizing:border-box;
}
.active{
  color: $master-color;
}
.list-main{
  padding: 0 30px;
  overflow-y: auto;
  &.mescroll{
    // height: 100vh;
    height: 100%;
  }
  ul{
    li{
      display:flex;
      padding:10px 8px;
      margin: 15px 0;
      background-color: #fff;
      border-radius: 10px;
      position: relative;
      .cover{
        width: 272px;
        height: 152px;
        margin-right: 20px;
        position: relative;
        img{
          display: block;
          width: 100%;
          height: 100%;
        }
        .living{
          width:100%;
          height:100%;
          position: absolute;
          top:0;
          left:0;
          display:flex;
          justify-content: center;
          align-items:center;
          background-color: rgba(0,0,0,0.75);
          .live-status{
            color:#fff!important;
          }
        }
      }
      .text{
        p{
          max-width: 380px;
          line-height: 45px;
          color: $font-color3;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .name{
          font-size: 28px;
          color:$font-color1;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .btnColor1{
          background-color: #A0A0A0;
        }
        .btnColor2{
          background-color: #ff0000;
        }
        .btnColor3{
          background-color: #ffc000;
        }
      }
    }
  }
}
</style>