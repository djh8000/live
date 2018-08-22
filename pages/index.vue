<template>
  <div class="direct-index">
    <!-- banner -->
    <div class="banner-content rel">
      <div v-swiper:mySwiper="swiperOptionBanner" ref="bannerSwiper">
        <!-- slides -->
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-for="(item, index) in indexData.bannerList" :key="index">
            <div class="banner-link" @click="jumbBanner(item.href)">
              <img :src="item.src">
            </div>
          </div>
        </div>
        <div class="swiper-pagination"  slot="pagination"></div>
      </div>
    </div>
    <!-- banner end -->
      <!-- 近期直播 -->
    <div class="recently-direct bg">
      <div class="w">
        <div class="direct-tit flex j-c">
          <div class="direct-tit-border flex a-c">
            <img src="~assets/img/curr.png">
            <span>近期直播</span>
          </div>
          <div class="all-direct">
            <router-link to="/list/0" class="flex">
               <span class="LIVEFONT">&#xe61f;</span>
               <em>全部直播</em>
            </router-link>
          </div>
        </div>
        <div class="information-list rel">
          <div v-swiper:mySwiperq="swiperNews" ref="newsSwiper" class="information-content">
            <div class="swiper-wrapper">
              <div class="swiper-slide slide_item rel"  v-for="item in indexData.nearlyLive" :key="item.createTime">
                <nuxt-link :to="'/item?targetId='+ item.id">
                  <div class="out-img">
                    <img :src="item.img">
                  </div>
                  <div class="cover-text flex j-s a-c">
                    <div class="left-info flex a-c" v-if="item.started">
                      <div class="teacherHead">
                        <img class="pictrue" :src="item.teacher.img">
                      </div>
                      <div class="teacherName">{{item.teacher.name}}</div>
                    </div>
                    <div class="left-info flex a-c" v-else>
                      <div class="time">{{item.newtime}}</div>
                    </div>
                    <div class="rightInfo flex a-c">
                      <spinner :isLive="item.started"></spinner>
                    </div>
                  </div>
                </nuxt-link>
              </div>
            </div>
          </div>
          <div class="swiper-button-prev">
            <span class="LIVEFONT">&#xe60c;</span>
          </div>
          <div class="swiper-button-next">
            <span class="LIVEFONT">&#xe611;</span>
          </div>
        </div>
      </div>
    </div>
      <!-- 近期直播  end -->
      <!-- 热门直播 -->
    <div class="hot-direct">
      <div class="w">
        <div class="direct-tit flex j-c">
          <div class="direct-tit-border flex a-c">
            <em class="tit-font LIVEFONT">&#xe631;</em>
            <span>热门直播</span>
          </div>
        </div>
        <ul class="hot-content flex">
          <li v-for="item in indexData.hotLive" :key="item.createTime">
            <nuxt-link  :to="'/item?targetId='+ item.id">
              <div class="less-img">
                <img class="pictrue" :src="item.img">
              </div>
            </nuxt-link>
            <div class="less-txt flex j-s a-c">
              <div class="left-info">
                <div class="hot-tit elis">{{item.name}}</div>
                <div class="hot-txt">
                    <em class="price" v-if="item.price > 0">￥{{item.price}}</em>
                    <em class="price" v-else>免费</em>
                  <em>预约{{item.appointNum}}人次</em>
                </div>
              </div>
              <div class="right-info">
                <img class="pictrue" :src="item.teacher.img">
              </div>
            </div>
          </li>
        </ul>
        <nuxt-link class="more" to="/list/0">查看更多</nuxt-link>
      </div>
    </div>
    <!-- 热门直播   end -->
    <!-- 栏目 -->
    <div class="column-direct">
      <div class="w">
        <div class="direct-tit flex j-c">
          <div class="direct-tit-border flex a-c">
            <em class="tit-font tit-font2 LIVEFONT">&#xe624;</em>
            <span>栏目</span>
          </div>
        </div>
        <ul class="flex j-s">
          <li v-for="(item, index) in topCate"  :key="item.createdTime">
            <nuxt-link  :to="'/list/' + item.id">
              <div class="column-ph flex a-c j-c">
                <div>
                  <img class="last" :src="require('../assets/img/l'+index +'-' +index +'.png')">
                  <img :src="require('../assets/img/l'+index +'.png')">
                </div>
              </div>
              <p>{{item.name}}</p>
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import spinner from '~/components/spinner.vue'
import {mapState} from 'vuex'
export default {
  layout: 'home',
  data () {
    return {
      swiperOptionBanner: {
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        // notNextTick: true,
        autoHeight: true,
        pagination: {
          clickable: true,
          el: '.swiper-pagination'
        }
      },
      swiperNews: {
        speed: 800,
        observeParents: true,
        freeMode: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        slidesPerView: 3
      }
    }
  },
  asyncData ({ $axios }) {
    const indexPage = {
      data: {
      },
      str: 'Live/liveHeadPage'
    }
    return $axios
      .$post('api/' + indexPage.str, indexPage.data)
      .then(data => {
        return {
          indexData: data
        }
      })
  },
  mounted () {
  },
  components: {
    spinner
  },
  computed: {
    ...mapState([
      'url', 'topCate'
    ])
  },
  methods: {
    jumbBanner (myurl) {
      let mateUrl = this.url.http
      if (myurl.indexOf(mateUrl) >= 0) {
        let start = mateUrl.length - 1
        myurl = myurl.substring(start, myurl.length)
        this.$router.push({path: myurl})
      } else {
        window.open(myurl)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
// banner
.banner-content {
  width: 100%;
  min-width: 1200px;
  min-height: 310px;
  cursor: pointer;
  .swiper-container{
    height: 100%;
  }
  img {
    display: block;
    width: 100%;
    margin: 0 auto;
  }
}
// banner end

.direct-tit{
  width: 100%;
  text-align: center;
  position: relative;
  .all-direct{
    position: absolute;
    right: 70px;
    top: 22px;
    a{
      // height: 40px;
      line-height: 30px;
      color: #333;
      font-weight: bold;
      font-size: 14px;
    }
    span{
      margin-right: 5px;
      font-size: 22px;
      color: $master-color;
      align-items: flex-end;
      font-weight: normal;
    }
  }
  .tit-font{
    font-size: 36px;
    color: $master-color;
  }
  .tit-font{
    font-size: 30px;
  }
  .direct-tit-border{
    width: auto;
    text-align: center;
    border-bottom: 1px solid $master-color;
    line-height: 50px;
    height: 50px;
    span{
      font-size: 20px;
      font-weight: bold;
      color: $font-color1;
      margin-left: 10px;
    }
  }
}
// 近期直播
.recently-direct{
  padding: 20px 0;
}

.information-list {
  .swiper-container{
    padding: 75px 8px 50px;
    margin: 0 60px;
  }
  .information-content {
    .slide_item {
      max-width: 355px;
      transition: 1s all;
      transform: scale(0.86);
      -webkit-transform: scale(0.86);
      -moz-transform: scale(0.86);
      a {
        display: block;
        border-radius: 10px;
        overflow: hidden;
        transition: 1s all;
        position: relative;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        border: solid 1px #d2d2d2;
        .cover-text {
          color: #fff;
          padding: 0 14px;
          height: 42px;
          line-height: 42px;
          color: #333;
          background: #fff;
          width: 100%;
          font-size: 14px;
          text-align: center;
        }
        .out-img{
          width: 100%;
          height: 198px;
        }
        .teacherHead{
          width: 28px;
          height: 28px;
          overflow: hidden;
          border-radius: 50%;
          margin-right: 10px;
        }
      }
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
      &.swiper-slide-active {
        transform: scale(1);
        -webkit-transform: scale(1);
        -moz-transform: scale(1);
        margin-top: -17px;
      }
      &.swiper-slide-next{
        margin-left: 26px;
      }
    }
  }
  .swiper-button-next,
  .swiper-button-prev {
    background: none;
    span {
      font-size: 30px;
      color: $master-color;
      &:hover {
        color: $master-color;
      }
    }
  }
  .swiper-button-next {
    right: 10px;
  }
  .swiper-button-prev {
    left: 10px;
  }
  .swiper-button-next.swiper-button-disabled, .swiper-button-prev.swiper-button-disabled{
    span{
      color: #999;
    }
  }
}
// 热门直播
  .hot-direct{
    overflow: hidden;
    color: #fff;
    background: url('~/assets/img/hotBg.png') center;
    padding: 20px;
  }
  .hot-direct .direct-tit .direct-tit-border span{
    color: #fff;
  }
  .hot-content{
    flex-wrap: wrap;
    width: 996px;
    margin: 18px auto 0;
    li{
      margin: 0 15px 34px;
      width: 300px;
      transition: all 0.2s ease;
      -webkit-transition: all 0.2s ease;
      -o-transition: all 0.2s ease;
      background: #fff;
      color: #474747;
      a{
        padding: 5px 6px 0;
        display: block;
      }
      .less-img{
        height: 162px;
        width: 100%;
        overflow: hidden;
      }
      .less-img:hover{
      img{
        -webkit-animation: spinScale 0.6s linear;
        -moz-animation: spinScale 0.6s linear;
        animation: spinScale 0.6s linear;
        animation-fill-mode: forwards;
        -webkit-animation-fill-mode: forwards;
        -moz-animation-fill-mode: forwards;
       }
      }
      .less-txt{
        padding: 5px 7px 6px 18px;
        .left-info{
          width: 230px;
        }
        .hot-tit{
          line-height: 2em;
          font-weight: bold;
          height: 2em;
          font-size: 14px;
        }
        .hot-txt{
          .price{
            color: $master-color;
            font-size: 13px;
            font-weight: bold;
            margin-right: 24px;
          }
        }
        .right-info{
          width: 40px;
          height: 40px;
          overflow: hidden;
          border-radius: 50%;
          flex-shrink: 0;
          img{
            display: block;
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
  // 放大
@-webkit-keyframes spinScale {
  from {
    transform:scale(1);
  }
  to {
    transform:scale(1.05);
  }
}
@-moz-keyframes spinScale {
  from {
    transform:scale(1);
  }
  to {
    transform:scale(1.05);
  }
}
@keyframes spinScale {
  from {
    transform:scale(1);
  }
  to {
    transform:scale(1.05);
  }
}
  // 查看更多
  .hot-direct .more {
  color: #22d3b7;
  width: 160px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 4px;
  border: solid 1px #22d3b7;
  display: block;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  overflow: hidden;
  -webkit-transition: border-color 0.3s, color 0.3s;
  transition: border-color 0.3s, color 0.3s;
  -webkit-transition-timing-function: cubic-bezier(0.2, 1, 0.3, 1);
  transition-timing-function: cubic-bezier(0.2, 1, 0.3, 1);
}
.hot-direct .more:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 150%;
  height: 100%;
  background: #22d3b7;
  z-index: -1;
  -webkit-transform: rotate3d(0, 0, 1, -45deg) translate3d(0, -3em, 0);
  transform: rotate3d(0, 0, 1, -45deg) translate3d(0, -3em, 0);
  -webkit-transform-origin: 0% 100%;
  transform-origin: 0% 100%;
  -webkit-transition: -webkit-transform 0.3s, opacity 0.3s, background-color 0.3s;
  transition: transform 0.3s, opacity 0.3s, background-color 0.3s;
}
.hot-direct .more:hover {
  color: #fff;
}
.hot-direct .more:hover::before {
  opacity: 1;
  background-color: #22d3b7;
  -webkit-transform: rotate3d(0, 0, 1, 0deg);
  transform: rotate3d(0, 0, 1, 0deg);
  -webkit-transition-timing-function: cubic-bezier(0.2, 1, 0.3, 1);
  transition-timing-function: cubic-bezier(0.2, 1, 0.3, 1);
}
// 栏目
.column-direct{
  background-color:#fff;
  padding: 20px 0;
  ul{
    padding: 0 100px;
    margin: 78px 0 112px;
  }
  ul li{
    text-align: center;
    a{
      display: block;
    }
    p{
      font-weight: bold;
      font-size: 14px;
      color: #474747;
    }
  }
  ul li a .column-ph {
    position: relative;
    width: 122px;
    height: 122px;
    border: 6px solid #e4e4e4;
    border-radius: 50%;
    box-sizing: border-box;
    margin-bottom: 16px;
    transition: border-color 0.3s, transform 0.4s;
    div{
      position: relative;
      height: 100%;
      width: 100%;
      -webkit-transition: all 0.3s ease;
      -o-transition: all 0.3s ease;
      transition: all 0.3s ease;
      -webkit-transform-style: preserve-3d;
      transform-style: preserve-3d;
    }
    img{
      position: absolute;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      -ms-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      -webkit-transition: all .3s ease;
      -o-transition: all .3s ease;
      transition: all .3s ease;
      &.last{
        opacity: 0;
        -webkit-transform: translate(-50%, -50%) rotateY(-180deg);
        transform: translate(-50%, -50%) rotateY(-180deg);
      }
    }
  }
  ul li a:hover p{
    color: #000;
  }
  ul li a:hover .column-ph{
    border-color: #313447;
  }
  ul li a:hover .column-ph div{
    transform: rotateY(180deg);
  }
  ul li a:hover .column-ph img:last-child {
    opacity: 0;
  }
  ul li a:hover .column-ph .last {
    opacity: 1;
  }
}
// 栏目   end
</style>