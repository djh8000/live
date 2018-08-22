<template>
  <div class="list">
    <div v-if="loadingMask" class="loading flex a-c j-c">
      <mt-spinner type="snake" color="#26a2ff"></mt-spinner>
    </div>
    <div class="inList">
      <div class="top">
        <swiper :options="swiperOption" ref="mySwiper">
          <!-- slides -->
          <swiper-slide @click.native="changes (0)" id="0" :class="[getDt.top == 0? 'topActive' : '']">全部</swiper-slide>
          <swiper-slide @click.native ="changes(item.id)" :class="[getDt.top == item.id? 'topActive' : '']" v-for="(item,index) in topCate" :id="item.id" :key="item.id">{{item.name}}</swiper-slide>
        </swiper>
        <nav class="navlist">
          <span v-for="(item,index) in navList1" :class="{'active': item.key == getDt.sort}" @click="navEvent(1,item.key)">{{item.name}}</span>
        </nav>
        <nav class="navlist">
          <span v-for="(item,index) in navList2" :class="{'active': item.key == getDt.price}" @click="navEvent(2,item.key)">{{item.name}}</span>
        </nav>
      </div>

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
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import spinner from '../components/spinner.vue'
import { mapState } from 'vuex'
export default {
  name: 'list',
  data () {
    return {
      swiperOption: {
        speed: 600,
        slideToClickedSlide: true,
        spaceBetween: 10,
        slidesPerView: 'auto',
        normalizeSlideIndex: false,
        slidesOffsetBefore: 20,
        resistanceRatio: 0
      },
      getDt: {
        top: 0,
        sort: '1',
        price: '0',
        page: 0,
        pagenum: 10
      },
      navList1: [
        {
          name: '最新',
          key: '1'
        },
        {
          name: '推荐',
          key: '2'
        },
        {
          name: '热门',
          key: '3'
        }
      ],
      navList2: [
        {
          name: '全部',
          key: '0'
        },
        {
          name: '公开课',
          key: '1'
        },
        {
          name: '精品课',
          key: '2'
        }
      ],
      lives: Array,
      loading: false,
      allLoaded: false,
      loadingMask: true // 显示遮罩
    }
  },
  computed: {
    swiper () {
      return this.$refs.mySwiper.swiper
    },
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
    this.getDt.top = this.$route.query.top || 0
    this.configMescroll()
  },
  components: {
    swiper,
    swiperSlide,
    spinner
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
      this.http.post('api/live/liveListPage', this.getDt)
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
    changes (id) {
      if (this.getDt.top === id) {
        return
      }
      this.getDt.top = id
      this.mescroll.triggerDownScroll()
      $('.list-main').scrollTop(0)
    },
    navEvent (type, id) {
      if (type === 1) {
        this.getDt.sort = id
      } else {
        this.getDt.price = id
      }
      this.mescroll.triggerDownScroll()
      $('.list-main').scrollTop(0)
    }
  }
}
</script>

<style lang="scss" scoped>
.topActive{
  color:$master-color !important;
  border-bottom: 4px solid $master-color;
}
.swiper-container{
  box-sizing:border-box;
  border-bottom:1px solid $border-color1;
  height: 80px;
  .swiper-slide{
    width: auto;
    padding:0 10px;
    font-size: 30px;
    line-height: 80px;
    text-align: center;
    color: $font-color1;
    box-sizing: border-box;
  }
  .swiper-slide-active{
  }
}
.top{
  background-color: #fff;
  padding-bottom: 10px;
}
.navlist{
  padding-left: 36px;
  font-size: 28px;
  margin-top: 20px;
  span{
    margin-right: 40px;
    font-weight: bold;
  }
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
  // height: 100%;
  // -webkit-overflow-scrolling: touch;
  // ::-webkit-scrollbar {
  //   display: none;
  // }
  &.mescroll{
    height: calc(100vh - 200px);
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