<template>
  <div class="item">
    <div v-if="loadingMask" class="loading flex a-c j-c">
      <mt-spinner type="snake" color="#26a2ff"></mt-spinner>
    </div>
    <div class="remove-transition">
    <!-- 回退按钮 -->
      <div class="inItem mescroll-touch">
      <!--   <div class="back fix" @click="back()">
          <span class="LIVEFONT">&#xe682;</span>
        </div> -->
        <!-- 封面 -->
        <div v-if="!showVideo" class="item-cover">
          <img :src="itemDetail.img">
        </div>
        <!-- 封面   end -->
        <!-- 视屏 -->
        <div v-else class="video-wrap myvdPlayer" id="vdPlayer"></div>
        <!-- 视屏end    -->
        <div class="item-content">
          <div class="empty"></div>
          <div class="live-info">
            <h2 class="live-tit">直播介绍</h2>
            <div class="live-introduce flex j-s">
              <div class="live-introduce-text">
                {{itemDetail.name}}
              </div>
              <div class="live-kind">{{itemDetail.categoryname}}</div>
            </div>
            <div class="sub-tit">{{itemDetail.subTitle}}</div>
          </div>
          <div class="item-info-content">
            <div class="item-info flex" v-if="itemDetail.teacher">
              <span class="label">讲师姓名:</span>
              <div class="item-info-right">{{itemDetail.teacher.name}}</div>
            </div>
            <div class="item-info flex" v-if="iosBuy != 0">
              <span class="label">购买人数:</span>
              <div class="item-info-right">{{itemDetail.appointNum}}</div>
            </div>
            <div class="item-info flex">
              <span class="label">直播时间:</span>
              <div class="item-info-right">{{itemDetail.newTime}}</div>
            </div>
            <div class="item-info flex" v-if="iosBuy != 0">
              <span class="label">课程价格:</span>
              <div class="item-info-right price" >{{itemDetail.price > 0 ? '￥'+itemDetail.price:'免费'}}</div>
            </div>
          </div>
        </div>
        <!-- 组合购  -->
        <div class="out-group" v-if="priceList.status === 1">
          <div class="group-content" v-if="priceList.liveList.length > 0">
            <h2 class="live-tit">组合购</h2>
            <div class="buy-notice">选购被其系列直播 (购买全部直播仅需<span>{{priceList.salePrice}}元</span>)</div>
            <div class="buy-ul">
              <div v-for="(item, index) in priceList.liveList" :key="item.id" :class="[item.buy? 'uncanbuy' : '', item.currentLive || item.choossed? 'active' : '']" class="buy-li flex j-s a-c">
                <div class="left-choose flex j-s a-c"  @click="chooseGroupItem(index, item.id, item.currentLive, item.buy)">
                  <span class="course-name elis">{{item.name}}</span>
                  <span>原价:{{item.price}}元</span>
                </div>
                <!-- 已在当前课程 -->
                <div v-if="item.currentLive" class="right-choose" @click="showToast('已在当前课程')"></div>
                <!-- 不再当前课程 -->
                <router-link v-else class="right-choose" :to="'/item?targetId='+ item.id">
                  <span class="LIVEFONT">&#xe605;</span>
                </router-link>
              </div>
            </div>
          </div>
          <!-- 组合购   end -->
           <!-- 加价购 -->
          <div class="group-content addprice" v-if="priceList.extraProduct.length > 0">
            <h2 class="live-tit">加价购</h2>
            <div class="buy-ul">
              <div v-for="(item, index) in priceList.extraProduct" :key="item.id" :class="[item.buy? 'uncanbuy' : '', item.choossed? 'active' : '']" class="buy-li flex j-s a-c">
                <div class="left-choose flex j-s a-c" @click="chooseAddItem(index, item.id, item.buy)">
                  <span class="course-name elis">{{item.name}}</span>
                  <span>
                    <em class="add">仅需加价{{item.price}}元</em><del>{{item.originPrice}}元</del>
                  </span>
                </div>
                <!-- 以购买的资料可以跳转 -->
                <router-link v-if="item.buy && item.type === 'material'" class="right-choose" to="/download" >
                  <span class="LIVEFONT">&#xe605;</span>
                </router-link>
                <div v-else-if="item.type === 'material'" class="right-choose" @click="showToast('没有购买，无法跳转')"></div>
                <div v-else class="right-choose"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 加价购   end -->
        <!-- 直播介绍 -->
        <div class="item-tab">
          <ul class="lesson-nav flex">
            <li @click="lessonTab = 1" :class="[lessonTab === 1? 'active' : '']">直播介绍</li>
            <li @click="lessonTab = 2" :class="[lessonTab === 2? 'active' : '']">讲师介绍</li>
            <li v-if="itemDetail.hasBuy" @click="lessonTab = 3" :class="[lessonTab === 3? 'active' : '']">资料区</li>
          </ul>
          <div class="lesson-introduce" v-show="lessonTab === 1">
            <div class="piece-header">课程介绍</div>
            <div class="lesson-html" v-html="itemDetail.introduction">
            </div>
          </div>
          <div class="lesson-introduce" v-show="lessonTab === 2">
            <div class="piece-header">讲师介绍</div>
            <div v-if="itemDetail.teacher" class="lesson-html" v-html="itemDetail.teacher.introduction">
            </div>
          </div>
          <div v-if="itemDetail.hasBuy" class="lesson-introduce" v-show="lessonTab === 3">
            <div class="piece-header">资料区</div>
            <div class="lesson-html">
              <ul class="datum-list">
                <li v-for="item in itemDetail.materials">
                   <div class="link-mat"  @click="download(item.newFileUri)">
                    <div class="datum-top">
                      {{item.title}}
                    </div>
                    <p>{{item.newsize}}KB</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- 直播介绍   end -->
      </div>
       <!-- 底部 -->
      <div class="item-foot fix out-login">
      <!--   <div v-if="liveState === 0" @click="goLogin()" class="foot-common preparation-content">进入直播</div> -->
        <div v-if="liveState === 1" class="appointment-content flex">
          <div class="left-info" v-if="totalPrice > 0">￥{{totalPrice}}</div>
          <div class="left-info" v-if="totalPrice <= 0 && iosBuy != 0">免费</div>
          <div class="right-info" @click="appointment()">预约</div>
        </div>
        <div v-if="liveState === 2" class="foot-common preparation-content">已预约</div>
        <div v-if="liveState === 3 ||  liveState === 0" class="foot-common entry-live">
          <router-link v-if="itemDetail.type === 'liveCourse'" :to="'/liveClassroom?courseId=' + itemDetail.courseId +'&curriculumId='+itemDetail.curriculumId">进入直播</router-link>
            <router-link v-if="itemDetail.type === 'live'" :to="'/liveRoom/'+itemDetail.liveId">进入直播</router-link>
        </div>
        <div v-if="liveState === 4 " class="foot-common preparation-content">敬请期待回放</div>
        <div v-if="liveState === 5 " class="out-play">
            <div v-if="!showVideo" class="foot-common ready-content" @click="showMyid()">观看回放</div>
            <div v-else class="foot-common live-content">正在观看</div>
        </div>
        <div v-if="liveState === 6 " class="foot-common preparation-content">已关闭</div>
      </div>
      <!-- new   end -->
    </div>
      <!-- 底部   end -->
      <span class="toRreshen">{{totalPrice}}</span>
  </div>
</template>

<script>
import url from '../config/url'
import {materialDownload} from '../config/wbApp'
export default {
  name: 'item',
  data () {
    return {
      targetId: '', // 当前id
      showVideo: false,
      itemDetail: {},
      priceList: {}, // 组合购，加价购数据
      liveIds: [], // 组合购选择组合
      productIds: [], // 附加购组合
      totalPrice: '', // 总价
      addPrice: 0, // 加价购价格
      groupPrice: 0, // 组合购价格
      loadingMask: true,
      lessonTab: 1,
      liveState: '', // 直播状态
      ifShowZl: false, // 是否显示资料
      orderInfo: {}, // 订单返回信息
      saleToken: this.$route.query.saleToken || '' // 推销员ID
    }
  },
  computed: {
  },
  mounted () {
    let targetId = this.$route.query.targetId
    if (this.$route.query.lessonTab) {
      this.lessonTab = Number(this.$route.query.lessonTab)
    }
    this.targetId = targetId
    this.getItem(this.targetId)
  },
  watch: {
    // 路由变化
    '$route' (val) {
      let path = this.$route.path
      if (path === '/item') {
        this.targetId = this.$route.query.targetId
        this.getItem(this.targetId)
        this.players && this.players.destroy()
        this.showVideo = false
      }
    }
  },
  methods: {
    // 显示提示框
    showToast: function (message) {
      this.$msg(message)
    },
    // 数据获取
    getItem: function (targetId) {
      let itemPage = {
        data: {
          liveId: targetId
        },
        str: 'Live/liveDetail'
      }
      this.http.post('api/' + itemPage.str, itemPage.data)
      .then(res => {
        let itemDetail = res.data
        this.itemDetail = { ...itemDetail }
        this.liveState = this.liveStatus(itemDetail.isLogin, itemDetail.hasBuy, itemDetail.status, itemDetail.isEnter)
        this.totalPrice = itemDetail.price
        this.groupPrice = itemDetail.price
        this.addPrice = 0
        if (itemDetail.priceList.status) {
          let priceList = itemDetail.priceList
          this.priceList = { ...priceList }
          this.liveIds = [this.targetId]
          this.productIds = []
        }
        this.loadingMask = false
      })
    },
    // 判断直播状态
    liveStatus: function (isLogin, hasBuy, status, isEnter) {
      if (!isLogin) {
        // 未登录
        return 0
      }
      if (status === 5) {
        // 已关闭
        return 6
      }
      if (hasBuy === 0) {
        // 已登未购买
        return 1
      }
      if (isEnter === 1) {
        return 3
      }
      if (status === 0) {
        // 已登已预约
        return 2
      }
      // if (status === 1) {
      //   // 已登正在直播
      //   return 3
      // }
      if (status === 2) {
        // 回放准备中
        return 4
      }
      if (status === 3) {
        // 观看回放
        return 5
      }
    },
        // 视屏播放
    showMyid: function () {
      this.showVideo = true
      this.players && this.players.destroy()
      let video = {
        data: {
          liveId: this.targetId
        },
        str: 'Live/getPlayback'
      }
      this.http.post('api/' + video.str, video.data)
      .then(res => {
        if (res) {
          console.log(res)
          // this.getVideo(res.data.vid, res.data.newVid)
          this.getWebPolyToken(res.data.vid)
        } else {
          this.$msg('视屏出错')
        }
      })
    },
    getWebPolyToken: function (vid, playsafe) {
      let vidData = {
        data: {
          vid: vid
        },
        str: 'course/getWebPolyToken'
      }
      this.http.post('api/' + vidData.str, vidData.data)
      .then(res => {
        if (res) {
          this.getVideo(vid, res.data.playsafe, res.data.sign, res.data.ts)
        } else {
          this.$msg('视屏出错')
        }
      })
    },
    getVideo (vid, playsafe, sign, ts) {
      this.players = window.polyvPlayer({
        wrap: '.myvdPlayer',
        width: '100%',
        height: '100%',
        vid: vid,
        playsafe: playsafe,
        sign: sign,
        ts: ts,
        forceH5: true
      })
    },
    // 视屏播放   end
    // 组合购选择
    chooseGroupItem (index, id, isNow, isBuy) {
      let liveList = this.priceList.liveList
      let liveIds = this.liveIds // 选中组合购数组
      let groupPrice = this.groupPrice
      if (!isNow && !isBuy) {
        // 不是当前课程且未购买才可以被选择
        liveList[index].choossed = !liveList[index].choossed
        this.priceList = {
          ...this.priceList,
          liveList
        }
        if (liveList[index].choossed) {
          // 选
          liveIds = liveIds.concat(id)
          this.liveIds = liveIds
          // 计算价格
          groupPrice = (Number(groupPrice) + Number(liveList[index].price)).toFixed(2)
          this.groupPrice = groupPrice
          if (liveIds.length === liveList.length) {
            this.totalPrice = (Number(this.priceList.salePrice) + Number(this.addPrice)).toFixed(2)
          } else {
            this.totalPrice = (Number(this.groupPrice) + Number(this.addPrice)).toFixed(2)
          }
        } else {
          // 不选
          let idIndex = liveIds.indexOf(id)
          if (idIndex > -1) {
            liveIds.splice(idIndex, 1)
          }
          this.liveIds = liveIds
          // 计算价格
          groupPrice = (groupPrice - liveList[index].price).toFixed(2)
          this.groupPrice = groupPrice
          this.totalPrice = (Number(this.groupPrice) + Number(this.addPrice)).toFixed(2) // 总价格
        }
      }
    },
    // 加价购选择
    chooseAddItem (index, id, isBuy) {
      let extraProduct = this.priceList.extraProduct
      let addPrice = this.addPrice // 加价购总价格
      let liveList = this.priceList.liveList
      let liveIds = this.liveIds // 选中组合购数组
      let productIds = this.productIds // 选中组合购数组
      if (!isBuy) {
        // 未购买才可以被选择
        extraProduct[index].choossed = !extraProduct[index].choossed
        this.priceList = {
          ...this.priceList,
          extraProduct
        }
        if (extraProduct[index].choossed) {
          // 选
          productIds = productIds.concat(id)
          this.productIds = productIds
          // 计算价格
          addPrice = (Number(addPrice) + Number(extraProduct[index].price)).toFixed(2)
          this.addPrice = addPrice // 加价购价格
          if (liveIds.length === liveList.length) {
            this.totalPrice = (Number(this.priceList.salePrice) + Number(this.addPrice)).toFixed(2)
          } else {
            this.totalPrice = (Number(this.groupPrice) + Number(this.addPrice)).toFixed(2)
          }
        } else {
          // 不选
          let idIndex = productIds.indexOf(id)
          if (idIndex > -1) {
            productIds.splice(idIndex, 1)
          }
          this.productIds = productIds
          // 计算价格
          addPrice = (addPrice - extraProduct[index].price).toFixed(2)
          this.addPrice = addPrice
          if (liveIds.length === liveList.length) {
            this.totalPrice = (Number(this.priceList.salePrice) + Number(this.addPrice)).toFixed(2)
          } else {
            this.totalPrice = (Number(this.groupPrice) + Number(this.addPrice)).toFixed(2)
          }
        }
      }
    },
    // 预约
    appointment () {
      let that = this
      let make = {}
      let chooseList = {}
      const href = window.location.href
      let orderInfo = {} // 订单页展示信息
      orderInfo.img = this.itemDetail.img
      orderInfo.title = this.itemDetail.name
      orderInfo.totalPrice = this.totalPrice
      if (this.totalPrice > 0 || this.liveIds.length > 1 || this.productIds.length > 0) {
      // 收费
        if (this.itemDetail.priceList.status) {
          // 组合
          if (this.liveIds.length > 1) {
            // 组合购选择多个商品显示组合包名称
            orderInfo.title = this.priceList.liveCategoryName
          }
          make = {
            targetType: 4, // 组合卖
            targetId: this.targetId,
            returnUrl: href,
            totalPrice: this.totalPrice,
            shouldPay: this.totalPrice,
            liveIds: this.liveIds,
            productIds: this.productIds,
            addPrice: this.addPrice,
            saleToken: this.saleToken
          }
          // 组合购，加价购所有数据
          let { liveList = [], extraProduct = [] } = this.priceList
          // 组合购,加价购展示信息
          let orderLiveList = []
          let orderProductIds = []
          liveList.map(function (item, index) {
            for (let i = 0; i < that.liveIds.length; i++) {
              let id = that.liveIds[i]
              if (id === item.id) {
                orderLiveList.push(item)
              }
            }
          })
          extraProduct.map(function (item, index) {
            for (let i = 0; i < that.productIds.length; i++) {
              let id = that.productIds[i]
              if (id === item.id) {
                orderProductIds.push(item)
              }
            }
          })
          chooseList = {
            orderLiveList: orderLiveList,
            orderProductIds: orderProductIds
          }
          // 组合购,加价购展示信息   end
        } else {
          // 单卖
          make = {
            targetType: 3, // 单卖
            targetId: this.targetId,
            returnUrl: href,
            totalPrice: this.totalPrice,
            shouldPay: this.totalPrice,
            liveIds: [],
            productIds: [],
            addPrice: this.addPrice,
            saleToken: this.saleToken
          }
        }
        localStorage.setItem('setOrder', JSON.stringify(make))
        localStorage.setItem('orderInfo', JSON.stringify(orderInfo))
        localStorage.setItem('chooseList', JSON.stringify(chooseList))
        this.$router.push({ path: '/orderSure', query: {targetId: this.targetId} })
      } else {
      // 免费
        let make = {
          data: {
            targetId: this.targetId,
            shouldPay: 0,
            targetType: 3,
            saleToken: this.saleToken
          },
          str: 'order/createLive'
        }
        this.http.post('api/' + make.str, make.data)
        .then(res => {
          that.getItem(this.targetId)
          if (res) {
            this.$msg(res.msg)
          }
        })
      }
    },
    // 预约   end
    // 去登录
    goLogin: function () {
      window.location.href = url.uchttp + '?fromUrl=' + url.http
    },
    // app 端资料下载
    download: function (URL) {
      materialDownload(URL)
    }
  }
}
</script>

<style lang="scss" scoped>
.inItem{
  height:100vh;
  overflow-y: scroll;
  padding-bottom: 90px;
}
.item .remove-transition{
  transition: none;
}
.item{
  height:100vh;
  overflow: hidden;
  transition: none;
  // 课程封面
  .item-cover{
    width: 100%;
    height: 422px;
    img{
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .video-wrap{
    width: 100%;
    height: 422px;
  }
  .live-tit{
    color: $sliver-color;
    font-size: 30px;
    line-height: 30px;
    margin-bottom: 36px;
  }
  .sub-tit{
    color: #999;
    margin-top: 24px;
  }
  // 课程封面   end
  .item-content{
    background: #fff;
    .empty{
      height: 32px;
      background: #ebebeb;
      border-bottom: 1px solid $border-color1;
    }
    .live-info{
      padding: 30px;
      min-height: 235px;
      .live-introduce{
        color: $font-color1;
        font-size: 28px;
      }
      .live-introduce-text{
        word-wrap: break-word;
        word-break: normal;
      }
      .live-kind{
        color: $sliver-color;
        width: 180px;
        flex-shrink: 0;
        text-align: right;
      }
    }
    .item-info-content{
      border-top: 1px solid $border-color1;
      padding: 30px;
      .item-info{
        line-height: 48px;
        font-size: 24px;
        .label{
          color: $font-color2;
          margin-right: 30px;
        }
        .item-info-right{
          color: $font-color1;
        }
        .price{
          color: $sliver-color;
          font-weight: bold;
        }
      }
    }
  }
  // 组合购
  .group-content{
    background: #fff;
    padding: 30px;
    .buy-notice{
      color: #777;
      font-size: 24px;
      span{
        color: $sliver-color;
      }
    }
    .buy-ul{
      .buy-li{
        margin-top: 20px;
        .left-choose{
          width: 630px;
          height: 65px;
          border: 3px solid #333333;
          padding: 14px;
          color: #333;
          span{
            width: 195px;
            text-align: right;
            &.course-name{
              text-align: left;
              width: 400px;
              height: 100%;
            }
          }
        }
        &.active .left-choose{
          border-color: $sliver-color;
          color: $sliver-color;
        }
        &.uncanbuy .left-choose{
          border-color: #888;
          color: #888;
        }
        .right-choose{
          width: 50px;
          height: 65px;
          line-height: 67px;
          text-align: right;
          span{
            font-size: 40px;
            color: #999;
          }
        }
      }
    }
  }
  // 加价购
  .addprice{
    .buy-ul .buy-li .left-choose span.course-name{
      width: 350px;
      color: #333;
    }
    .buy-ul .buy-li .left-choose span{
      width: 390px;
      color: #999;
      // background: red;
    }
    .buy-ul .buy-li .left-choose span .add{
      color: $sliver-color;
      margin-right: 10px;
    }
    .buy-ul .buy-li.active .left-choose{
      border-color: $sliver-color;
      color: $sliver-color;
      span.course-name{
        color: $sliver-color;
      }
    }
    .buy-ul .buy-li.uncanbuy .left-choose span .add{
      color: #f999a7;
    }
  }
  .item-foot{
    width: 100%;
    height: 90px;
    line-height: 90px;
    -webkit-transform: translateZ(0);
    position: fixed;
    bottom: 0px;
    left: 0px;
    .appointment-content{
      text-align: center;
      font-size: 30px;
      .left-info{
        width: 285px;
        background: #fff;
        color: $sliver-color;
        font-weight: bold;
        font-size: 32px;
      }
      .right-info{
        width: 465px;
        background: $master-color;
        color: #fff;
      }
    }
    .foot-common{
      width: 100%;
      text-align: center;
      background: $master-color;
      color: #fff;
      font-size: 30px;
      word-spacing: 1px;
      letter-spacing: 2px;
      a{
        color: #fff;
        display: block;
        width: 100%;
        height: 100%;
      }
      &.unlogin{
        background: #999;
      }
    }
  }
}
// 详情tab
.item-tab{
  background-color: #fff;
  margin-top: 30px;
  padding: 20px;
}
  .lesson-nav{
    position: relative;
    padding-right: 80px;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 20px;
    li{
      border: none;
      background: none;
      color: #313131;
      -webkit-transition: all 0.3s ease;
      -moz-transition: all 0.3s ease;
      -o-transition: all 0.3s ease;
      transition: all 0.3s ease;
      padding: 5px 20px 10px;
      font-size: 26px;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      &.active{
        border-bottom: 2px solid $red;
        color: $red;
      }
    }
  }
  .piece-header{
    position: relative;
    margin: 5px auto 20px auto;
    padding: 0 30px 0 15px;
    color: #313131;
    font-size: 26px;
    line-height: 30px;
  }
  .piece-header:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0px;
    width: 4px;
    height: 28px;
    background-color: #cf010e;
  }
.datum-list{
  ul{
    margin-top: 20px;
  }
  li{
    font-size: 26px;
    margin-bottom: 20px;
    a, .link-mat {
      color: $red;
      display: block;
    }
    .datum-top{
      line-height: 36px;
    }
    p{
      color: #999;
      font-size: 24px;
    }
  }
}
.toRreshen{
  opacity: 0;
  position: absolute;
  z-index: 0;
  bottom: 0;
  left: 0;
}
</style>