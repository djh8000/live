<template>
  <div class="home">
    <div v-if="loadingMask" class="loading flex a-c j-c">
      <mt-spinner type="snake" color="#26a2ff"></mt-spinner>
    </div>
    <div id="index-mescroll" class="mescroll in-home mescroll-hardware"  :class="{inApp: appPublic}">
      <mt-swipe :auto="4000" class="swiper" v-if="iosBuy != 0">
        <mt-swipe-item v-for="(item, index) in bannerList" :key="index">
          <div class="banner-link" @click="jumpBanner(item.href)">
            <img :src="item.src">
          </div>
        </mt-swipe-item>
      </mt-swipe>
      <!-- iosBuy -->
      <img src="../assets/img/home/banner-demo.jpg" v-if="iosBuy == 0">
      <!-- 近期直播 -->
      <div class="recently-live">
        <div class="home-tit flex j-s">
          <div class="left-tit">
            <span class="LIVEFONT">&#xe604;</span>
            <em>近期直播</em>
          </div>
          <div class="right-tit" v-if="iosBuy != 0">
            <router-link v-if="channel === 17" to="/list?top=1">
               <span class="LIVEFONT">&#xe61f;</span>
               <em>全部直播</em>
            </router-link>
            <router-link v-else to="/list">
               <span class="LIVEFONT">&#xe61f;</span>
               <em>全部直播</em>
            </router-link>
          </div>
        </div>
        <div class="recently-content">
          <swiper :options="swiperNews" ref="newsSwiper" class="recently-ul">
            <swiper-slide class="slide_item rel"  v-for="item in nearlyLive" :key="item.id + item.createTime">
              <router-link :to="'/item?targetId='+ item.id">
                <div class="recently-banner">
                  <img :src="item.img">
                </div>
                <div class="recently-info flex j-s">
                  <div class="left-info flex a-c" v-if="item.started">
                    <div class="live-teacher">
                      <img :src="item.teacher.img">
                    </div>
                    <span class="name elis">{{item.teacher.name}}</span>
                  </div>
                  <div class="left-info flex a-c" v-else>
                    <div class="time">{{item.newtime}}</div>
                  </div>
                  <div class="right-info flex a-c">
                    <spinner :isLive="item.started"></spinner>
                  </div>
                </div>
              </router-link>
            </swiper-slide>
            </swiper>
        </div>
      </div>
      <!-- 近期直播    end-->
      <div class="hot-live">
        <div class="home-tit">
          <div class="left-tit">
            <span class="LIVEFONT">&#xe631;</span>
            <em>热门直播</em>
          </div>
        </div>
        <div class="hot-ul">
            <div class="hot-li" v-for="item in hotLive" :key="item.createTime">
              <router-link class="flex a-c" :to="'/item?targetId='+ item.id">
                <div class="hot-left">
                  <img :src="item.img">
                </div>
                <div class="hot-right">
                  <div class="hot-tit elis">
                    {{item.name}}
                  </div>
                  <div class="right-detail flex j-s a-c">
                    <span>预约{{item.appointNum}}人次</span>
                    <em class="price" v-if="item.price > 0">￥{{item.price}}</em>
                    <em class="price" v-if="item.price <= 0 && iosBuy != 0">免费</em>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
          <div class="hot-more" v-if="iosBuy != 0">
            <router-link  v-if="channel === 17" to="/list?top=1">查看更多</router-link>
            <router-link  v-else to="/list">查看更多</router-link>
          </div>
      </div>
      <!-- 栏目 -->
      <div class="column-content" v-if="iosBuy != 0">
        <div class="home-tit">
          <div class="left-tit">
            <span class="LIVEFONT">&#xe624;</span>
            <em>栏目</em>
          </div>
        </div>
          <div class="column-ul flex j-c" >
            <div class="column-li" v-for="(item, index) in topCate" v-if="index < 2" :key="item.createdTime">
               <router-link :to="'/list?top=' + item.id">
                <div class="column-img">
                  <img :src="require('../assets/img/home/lanmu'+index +'.png')">
                </div>
                <p>{{item.name}}</p>
                <!-- {{topCate[0].id}} -->
               </router-link>
            </div>
          </div>
          <div class="column-ul flex j-c">
            <div class="column-li" v-for="(item, index) in topCate" v-if="index > 1" :key="item.createdTime">
               <router-link :to="'/list?top=' + item.id">
                <div class="column-img">
                 <img :src="require('../assets/img/home/lanmu'+index +'.png')">
                </div>
                <p>{{item.name}}</p>
               </router-link>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>
<script>
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import spinner from '../components/spinner.vue'
import { jumpType } from '../config/wbApp'
import { mapState } from 'vuex'
export default {
  name: 'home',
  data () {
    return {
      swiperNews: {
        notNextTick: true,
        observeParents: true,
        autoplayDisableOnInteraction: false,
        paginationClickable: true,
        slidesPerView: 'auto'
      },
      bannerList: [], // 轮播
      hotLive: '', // 热门直播
      nearlyLive: '', // 最近直播
      recommendCourse: '', // 推荐课程,
      appPublic: JSON.parse(this.$cookie.get('appPublic')) || 0,
      loadingMask: true, // 显示遮罩
      channel: ''
    }
  },
  created: function () {
  },
  mounted () {
    this.configMescroll()
    // 列表默认筛选项目 channel = 17（CFA app） channel = 10 (CPA app)  channel = 2 (网校 app)
    if (this.appPublic) {
      this.channel = Number(this.appPublic.channel) || 0
    }
  },
  components: {
    swiper,
    swiperSlide,
    spinner
  },
  computed: {
    ...mapState([
      'topCate'
    ])
  },
  methods: {
    jumpBanner (url) {
      if (!url) {
        return
      }
      let jumbStatus = jumpType(url)
      if (jumbStatus.ifOut) {
        // 外部跳转
        if (jumbStatus.myurl) {
          window.location.href = jumbStatus.myurl
        }
      } else {
        // 内部跳转
        this.$router.push({path: jumbStatus.myurl})
      }
    },
    // 下拉加载
    configMescroll () {
      const that = this
      this.mescroll = new this.MeScroll('index-mescroll', {
        up: {
          callback: that.loadMore,
          // isBounce: false,
          noMoreSize: 1
        }
      })
    },
    loadMore () {
      this.http.post('api/live/liveHeadPage')
      .then(res => {
        let { bannerList, hotLive, nearlyLive, recommendCourse } = res.data
        this.loadingMask = false // 关闭遮罩
        this.bannerList = bannerList
        this.hotLive = hotLive
        this.nearlyLive = nearlyLive
        this.recommendCourse = recommendCourse
        this.mescroll.endSuccess(hotLive.length, false)
      })
      .catch(() => {
        this.mescroll.endErr()
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
$color: #c41b1f;
$master-color: #ff0000;
$notice-color: #ffc000 ;
$background-color1: #ebebeb;
$border-color1: #e5e5e5;
$font-color1: #333333;
$font-color2: #666666;
$font-color3: #999999;
.home{
  background: #fff;
  // width: 750px;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  .in-home{
    &.inApp {
      padding-bottom: 112px;
    }
  }
  .swiper{
    height: 410px;
    color:red;
    font-size:28px;
    text-align:center;
    img{
      width: 750px;
      height: 410px;
      display: block;
    }
  }
  .home-tit{
    background: #fff;
    line-height: 70px;
    padding: 0 30px;
    .left-tit{
      font-size: 30px;
      color: $font-color1;
      display: flex;
      align-items:center;
      span{
        color: $master-color;
        font-size: 38px;
        margin-right: 15px;
      }
      em{
        font-weight: bold;
      }
    }
    .right-tit{
      color: $font-color2;
      font-size: 24px;
      span{
        font-size: 30px;
        vertical-align: middle;
      }
      em{
        vertical-align: middle;
      }
    }
  }
  // 近期直播
.recently-content{
  width: 100%;
  overflow: hidden;
  padding-left: 30px;
  background: #fff;
}
.swiper-container{
    height: 440px;
    overflow: visible;
  }
.recently-ul{
  padding-left: 40px;
  a{
    color: $font-color1;
  }
  .slide_item{
    width: 592px;
    height: 410px;
    padding: 10px 10px 0 10px;
    border:1px solid $border-color1;
    -webkit-transition: 1s all;
    transition: 1s all;
    transform: scale(0.9);
    -webkit-transform: scale(0.9);
    -moz-transform: scale(0.9);
    margin-right: 20px;
    &.swiper-slide-active{
      transform:scale(1);
      -webkit-transform:scale(1);
      -moz-transform:scale(1);
      box-shadow: 0 23px 40px -12px rgba(153, 153, 153, 0.4);
    }
    .recently-banner img{
      width: 570px;
      height: 320px;
      display: block;
    }
    .recently-info{
      height: 80px;
      padding: 0 10px 0 30px;
      .left-info{
        .live-teacher{
          width: 55px;
          height: 55px;
          overflow: hidden;
          border-radius: 50%;
          margin-right: 30px;
        }
        .time{
          font-weight: bold;
        }
        .name{
          max-width: 200px;
          height: 80px;
          line-height: 80px;
          font-weight: bold;
        }
        img{
          display: block;
          width: 100%;
          height: 100%;
        }
      }
      .right-info{
        .live-status{
          margin-right: 20px;
        }
      }
    }
  }
}
// 热门课程
.hot-ul{
  padding: 25px 30px;
  background: $background-color1;
  .hot-li{
    margin-bottom: 30px;
    background: #fff;
    padding: 10px;
    border-radius: 8px;
    overflow: hidden;
    &:last-child{
      margin-bottom: 0;
    }
    .hot-left{
      width: 250px;
      height: 141px;
      flex-shrink:0;
      img{
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .hot-right{
      width: 420px;
      padding: 0 20px 0 30px;
      .hot-tit{
        font-size: 28px;
        color: $font-color1;
        font-weight: bold;
        width: 100%;
        line-height: 40px;
        height: 40px;
        margin-bottom: 30px;
      }
      .right-detail{
        color: $font-color3;
        line-height: 50px;
        .price{
          color: $master-color;
          font-size: 28px;
          font-weight: bold;
        }
      }
    }
  }
}
  .hot-more{
    text-align: center;
    font-size: 26px;
    line-height: 60px;
    margin-top: 10px;
    a{
      color: $font-color2;
      display: block;
    }
  }
  // 推荐课程
  .recommend-course{
    display: none;
    margin-bottom: 10px;
    .course-ul{
      padding: 0 40px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .course-li{
      width: 320px;
      margin-right: 30px;
      margin-bottom: 20px;
      &:nth-child(2n){
        margin-right: 0;
      }
      .course-cover{
        display: block;
        width: 100%;
        height: 180px;
      }
      .course-tit{
        width: 100%;
        padding: 0 10px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        border: 1px solid $border-color1;
        border-top: 0;
        color: $font-color1;
        font-size: 24px;
      }
    }
  }
  // 栏目
  .column-content{
    .column-ul{
      margin-top: 20px;
    }
   .column-li{
    width: 210px;
    margin-bottom: 50px;
    .column-img{
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #606060;
      width: 126px;
      margin: 0 auto 20px;
      img{
        display: block;
        width: 120px;
        height: 120px;
      }
    }
    p{
      text-align: center;
      color: #606060;
      font-size: 24px;
      line-height: 38px;
    }
   }
  }
}
</style>
