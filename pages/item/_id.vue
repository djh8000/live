<template>
  <div class="item-content w">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>直播详情</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="item-top flex">
      <div class="left-img">
        <img :src="itemData.img">
      </div>
      <div class="right-detail">
        <h2>{{itemData.name}}</h2>
        <h6>{{itemData.subTitle}}</h6>
        <!-- 直播教师 -->
        <div class="live-teacher flex a-c">
          <div class="left-info">
            <span class="LIVEFONT">&#xe652;</span>
          </div>
          <div class="right-info">
            <div class="right-name" v-if="itemData.teacher" >{{itemData.teacher.name}}</div>
            <div class="right-time">
              直播时间
              <span>{{itemData.newTime}}</span>
            </div>
          </div>
        </div>
        <!-- 直播教师   end -->
        <div class="out-group" v-if="itemData.priceList.status === 1">
          <!-- 组合购买 -->
          <div class="group-content" v-if="priceList.liveList.length > 0">
            <div class="buy-notice">选购本期系列直播（购买全部直播只需要<span>{{itemData.priceList.salePrice}}</span>元)</div>
            <ul class="group-lesson flex">
              <li v-for="(item, index) in liveList" :key="item.id" :class="[item.buy? 'uncanbuy' : '', item.currentLive || item.choossed? 'active' : '']">
                <div class="lesson-top" @click="chooseGroupItem(index, item.id, item.currentLive, item.buy)">
                  <p>{{item.name}}</p>
                  <span class="LIVEFONT">&#xe64f;</span>
                </div>
                <div class="lesson-price">原价：{{item.price}}元</div>
                <div class="more"  v-if="!item.currentLive">
                  <nuxt-link :to="'/item?targetId='+ item.id">
                    【查看详情】
                  </nuxt-link>
                </div>
              </li>
            </ul>
          </div>
          <!-- 组合购买   end -->
          <!-- 加价购 -->
          <div class="group-content" v-if="priceList.extraProduct.length > 0">
            <div class="add-tit">加价购</div>
            <ul class="group-lesson flex">
              <li v-for="(item, index) in extraProduct" :key="item.id" :class="[item.buy? 'uncanbuy' : '', item.choossed? 'active' : '']" >
                <div class="lesson-top"  @click="chooseAddItem(index, item.id, item.buy)">
                  <p>{{item.name}}</p>
                  <span class="LIVEFONT">&#xe64f;</span>
                </div>
                <div class="add-price">仅需加价{{item.price}}元</div>
                <div class="lesson-price">原价：{{item.originPrice}}元</div>
                <div class="more" v-if="item.type == 'course'">
                  <a target="_blank" :href="item.link">
                    【查看详情】
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <!-- 加价购 end   -->
        <div class="price-content">
          <div  class="count">
            <span>价格：</span>
            <em v-if="totalPrice > 0">￥{{totalPrice}}</em>
            <em v-else>免费</em>
          </div>
          <div class="go-buy flex a-c">
              <div v-if="itemData.isLogin === 1" class="out-login">
                <!-- 登陆 -->
                  <!-- 已关闭 -->
                  <button v-if="itemData.status === 5" @click="recommend(99)">已关闭</button>
                  <div v-else-if="itemData.hasBuy === 1" class="out-ifbuy">
                    <!-- 已购买 -->
                    <div v-if="itemData.isEnter === 1" class="isEnter">
                      <!-- 能够进入直播 -->
                      <button v-if="itemData.type === 'liveCourse'" @click="recommend(11)">进入直播</button>
                      <button v-if="itemData.type === 'live'" @click="recommend(2)">进入直播</button>
                    </div>
                    <div v-else class="isEnter">
                      <!-- 不能进入直播 -->
                      <button v-if="itemData.status === 0" @click="recommend(99)">已预约</button>
                      <button v-if="itemData.status === 2" @click="recommend(99)">敬请期待回放</button>
                      <button v-if="itemData.status === 3" @click="recommend(8)">观看回放</button>
                    </div>
                  </div>
                  <div v-else class="out-ifbuy">
                    <!-- 未购买 -->
                    <button @click="recommend(5)">预约</button>
                  </div>
              </div>
              <div v-if="itemData.isLogin === 0" class="out-login">
                <button @click="recommend(3)">进入直播</button>
              </div>
              <div class="number">
                <span class="LIVEFONT">&#xe71e;</span>
                <em>{{itemData.appointNum || 0}}人预约</em>
              </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 详情 -->
    <div class="lesson-detail flex j-s">
      <div class="left-info">
        <ul class="lesson-nav flex">
          <li @click="lessonTab = 1" :class="[lessonTab === 1? 'active' : '']">直播介绍</li>
          <li @click="lessonTab = 2" :class="[lessonTab === 2? 'active' : '']">讲师介绍</li>
          <li v-if="itemData.hasBuy" @click="lessonTab = 3" :class="[lessonTab === 3? 'active' : '']">资料区</li>
        </ul>
        <div class="lesson-introduce" v-show="lessonTab === 1">
          <div class="piece-header">课程介绍</div>
          <div class="lesson-html" v-html="itemData.introduction">
          </div>
        </div>
        <div class="lesson-introduce" v-show="lessonTab === 2">
          <div class="piece-header">讲师介绍</div>
          <div class="lesson-html" v-if="itemData.teacher" v-html="itemData.teacher.introduction">
          </div>
        </div>
        <div v-if="itemData.hasBuy" class="lesson-introduce" v-show="lessonTab === 3">
          <div class="piece-header">资料区</div>
          <div class="lesson-html">
            <ul class="datum-list">
              <li v-for="item in itemData.materials">
                <a target="_blank" :href="item.newFileUri">
                  <div class="datum-top">
                    {{item.title}}
                  </div>
                  <p>{{item.newsize}}KB</p>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="right-page">
        <div class="right-page-top">
          <div class="panel-title">已预约</div>
          <ul class="panel-body flex a-c">
            <li v-for="item in members
" :key="item.userId">
              <a target="_blank" :href="item.link">
                <img v-if="item.mediumAvatar" :src="item.mediumAvatar">
                <img v-else src="../../assets/img/default.png">
              </a>
            </li>
          </ul>
        </div>
        <div class="right-page-bottom">
          <div class="panel-title">推荐课程</div>
          <courseRecommen flexWay="vertical" :courseList="courseData"></courseRecommen>
        </div>
      </div>
    </div>
    <!-- 预约弹框 -->
    <div class="recommendAlert flex a-c j-c" v-if="showAlert">
      <div class="already-subscribe ">
        <div class="modal-header">
          <span @click="showAlert = false" class="close LIVEFONT">&#xe607;</span>
          <div class="modal-title">
            <h4>{{itemData.name}}</h4>
            <p>我们将通过手机短信通知您收看课程直播</p>
          </div>
        </div>
        <div class="modal-body">
          <div class="already">
            <div class="succeed">
              <h4>直播时间</h4>
              <p class="already-live-time">{{itemData.newTime}}</p>
            </div>
            <div class="succeed bottom-succeed">
              <div class="btn btn-primary btn-lg" @click="createAppoint()">确定预约</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 预约弹框   end -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import courseRecommen from '~/components/courseRecommen.vue'
export default {
  data () {
    return {
      liveid: '',
      courseData: [],
      members: [],
      showAlert: false,
      totalPrice: '', // 总价
      lessonTab: Number(this.$route.query.lessonTab) || 1,
      liveIds: [], // 组合购选择组合
      productIds: [], // 附加购组合
      addPrice: 0, // 加价购价格
      ifShowZl: false, // 是否显示资料
      groupPrice: 0, // 组合购价格
      saleToken: this.$route.query.saleToken || '' // 推销员ID
    }
  },
  computed: {
    ...mapState(['url'])
  },
  components: {
    courseRecommen
  },
  watch: {
    '$route' (val) {
      window.location.reload()
    }
  },
  methods: {
    // 组合购选择
    chooseGroupItem (index, id, isNow, isBuy) {
      let priceList = this.itemData.priceList
      let liveList = this.liveList
      let liveIds = this.liveIds // 选中组合购数组
      let groupPrice = this.groupPrice
      if (!isNow && !isBuy) {
        // 不是当前课程且未购买才可以被选择
        liveList[index].choossed = !liveList[index].choossed
        // this.liveList = {...liveList}
        if (liveList[index].choossed) {
          // 选
          liveIds = liveIds.concat(id)
          this.liveIds = liveIds
          // console.log(this.liveIds)
          // 计算价格
          groupPrice = (Number(groupPrice) + Number(liveList[index].price)).toFixed(2)
          this.groupPrice = groupPrice
          if (liveIds.length === liveList.length) {
            this.totalPrice = (Number(priceList.salePrice) + Number(this.addPrice)).toFixed(2)
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
        this.liveList = [
          ...liveList
        ]
      }
    },
    // 加价购选择
    chooseAddItem (index, id, isBuy) {
      let priceList = this.itemData.priceList
      let addPrice = this.addPrice // 加价购总价格
      let extraProduct = this.extraProduct
      let liveList = this.liveList
      let liveIds = this.liveIds // 选中组合购数组
      let productIds = this.productIds // 选中组合购数组
      if (!isBuy) {
        // 不是当前课程且未购买才可以被选择
        extraProduct[index].choossed = !extraProduct[index].choossed
        if (extraProduct[index].choossed) {
          // 选
          productIds = productIds.concat(id)
          this.productIds = productIds
          // 计算价格
          addPrice = (Number(addPrice) + Number(extraProduct[index].price)).toFixed(2)
          this.addPrice = addPrice
          if (liveIds.length === liveList.length) {
            this.totalPrice = (Number(priceList.salePrice) + Number(this.addPrice)).toFixed(2)
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
            this.totalPrice = (Number(priceList.salePrice) + Number(this.addPrice)).toFixed(2)
          } else {
            this.totalPrice = (Number(this.groupPrice) + Number(this.addPrice)).toFixed(2)
          }
        }
        this.extraProduct = {
          ...extraProduct
        }
      }
    },
    // 重新获取商品详情
    getItems () {
      const itemPage = {
        data: {liveId: this.targetId},
        str: 'Live/liveDetail'
      }
      this.$axios.$post('api/' + itemPage.str, itemPage.data).then(res => {
        const { liveList = [], extraProduct = [] } = res.priceList
        this.itemData = {
          ...res
        }
        this.priceList = res.priceList
        this.liveList = liveList
        this.extraProduct = extraProduct
      })
    },
    recommend (status) {
      if (status === 3 || status === 7) {
        // 未登录
        const nowUrl = window.location.href
        window.location.href = this.url.uchttp + '?fromUrl=' + nowUrl
      } else if (status === 2) {
        // 进入直播
        this.$router.push({ path: '/liveRoom/' + this.itemData.liveId })
      } else if (status === 5) {
        // console.log('去预约')
        this.showAlert = true
      } else if (status === 8) {
        // console.log('查看回放')
        this.$router.push({ path: '/video/' + this.targetId })
      } else if (status === 11) {
        // 私播课
        this.$router.push({path: '/liveClassroom/', query: {courseId: this.itemData.courseId, curriculumId: this.itemData.curriculumId, liveId: this.itemData.liveId}})
        // window.open(this.itemData.privateCourseLink)
      } else {
        console.log('其他状态')
      }
    },
    // 创建预约
    createAppoint () {
      let that = this
      let chooseList = {}
      let setOrder = {}
      const href = window.location.href
      let orderInfo = {} // 订单页展示信息
      orderInfo.img = this.itemData.img
      orderInfo.title = this.itemData.name
      orderInfo.id = this.itemData.liveId
      orderInfo.totalPrice = this.totalPrice
      if (this.totalPrice > 0 || this.liveIds.length > 1 || this.productIds.length > 0) {
        // 收费
        if (this.itemData.priceList.status) {
          // 组合购
          setOrder = {
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
          setOrder = {
            targetType: 3, // 组合卖
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
        localStorage.setItem('setOrder', JSON.stringify(setOrder))
        localStorage.setItem('orderInfo', JSON.stringify(orderInfo))
        localStorage.setItem('chooseList', JSON.stringify(chooseList))
        this.$router.push({ path: '/order', query: {targetId: this.targetId} })
      } else {
        // 免费
        const creatPage = {
          data: {
            targetId: this.targetId,
            shouldPay: 0,
            targetType: 3,
            saleToken: this.saleToken
          },
          str: 'order/createLive'
        }
        this.$axios.$post('api/' + creatPage.str, creatPage.data).then(res => {
          if (res.orderId) {
            this.$msg({
              message: '预约成功',
              type: 'success'
            })
            this.getItems()
          } else {
            this.$msg({
              message: '预约失败'
            })
          }
        })
        this.showAlert = false
      }
    }
    // 创建预约   end
  },
  asyncData ({ $axios, query }) {
    const liveid = query.targetId
    let liveIds = [] // 选中组合购数组
    const itemPage = {
      data: {liveId: liveid},
      str: 'Live/liveDetail'
    }
    const coursePage = {
      data: {liveId: liveid},
      str: 'Live/recommendCourse'
    }
    return Promise.all([
      $axios.$post('api/' + itemPage.str, itemPage.data),
      $axios.$post('api/' + coursePage.str, coursePage.data)
    ]).then(([data, courseData]) => {
      const itemData = data
      const { liveList = [], extraProduct = [] } = data.priceList
      if (itemData.priceList.status) {
        liveIds = [liveid]
      }
      return {
        itemData: itemData,
        courseData: courseData.recommandList,
        members: courseData.members,
        totalPrice: itemData.price || 0.00,
        groupPrice: itemData.price || 0.00,
        addPrice: 0,
        priceList: itemData.priceList,
        liveList: liveList, // 组合购列表
        extraProduct: extraProduct, // 加价购列表
        liveIds: liveIds
      }
    })
  },
  mounted () {
    this.targetId = this.$route.query.targetId
  },
  updated () {
  }
}
</script>

<style lang="scss">
.el-breadcrumb{
  line-height: 54px;
  padding-left: 30px;
}
.item-content{
  padding: 0 30px 30px;
}
.item-top{
  background: #fff;
  padding: 20px 0 20px 20px;
  width: 100%;
  .left-img{
    width: 570px;
    flex-shrink: 0;
  }
  .right-detail{
    width: 570px;
    padding-left: 40px;
    h2{
      font-size: 22px;
      font-weight: 500;
      margin: 15px 0 10px;
    }
    h6{
      margin-bottom: 10px;
      padding-right: 20px;
      font-size: 14px;
    }
  }
  img{
    display: block;
    width: 100%;
    height: auto;
  }
  .live-teacher{
    font-size: 14px;
    margin-bottom: 20px;
    .left-info span{
      font-size: 20px;
    }
    .right-info{
      padding-left: 10px;
      span{
        color: $red;
      }
    }
  }
}
// 组合购
.group-content{
  margin-bottom: 20px;
  .buy-notice{
    margin-bottom: 18px;
    span{
      color: $red;
      font-weight: bold;
      padding: 0 5px;
    }
  }
  .group-lesson{
    flex-wrap: wrap;
    li{
      width: 140px;
      flex-shrink: 0;
      margin: 0 30px 20px 0;
      text-align: center;
    }
    li.active .lesson-top{
        border-color: $red;
        span{
          display: block;
        }
    }
    li.uncanbuy .lesson-top{
      border-color: #d2d2d2;
      background: #eee;
      color: #aaa;
    }
    .lesson-top{
      position: relative;
      border: 1px solid #d2d2d2;
      padding: 0px 17px 0 12px;
      height: 42px;
      font-size: 12px;
      text-align: center;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      justify-content: center;
      line-height: 1.2em;
      margin-bottom: 9px;
      overflow: hidden;
      cursor: pointer;
      p{
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      span{
        position: absolute;
        bottom: 0;
        right: -12px;
        color: $red;
        font-size: 40px;
        display: none;
      }
    }
    .lesson-price{
      margin-bottom: 8px;
      color: #777;
    }
  }
}
// 加价购
.add-tit{
  font-size: 14px;
  color: #1e1b1b;
  font-weight: bold;
  margin-bottom: 12px;
}
.add-price{
  color: $red;
}
// 购买
.price-content{
  padding-right: 20px;
  .count{
    span{
      color: #333;
      font-size: 14px;
      vertical-align: middle;
      margin-right: 5px;
    }
    font-size: 18px;
    font-weight: bold;
    color: #cf010e;
    line-height: 1;
  }
  .go-buy{
    margin: 20px 0 10px;
    button{
      outline: none;
      background: $red;
      color: #fff;
      padding: 0 30px;
      line-height: 40px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      &:hover{
        background: #ec0b19;
      }
    }
    .number{
      margin-left: 15px;
      font-size: 16px;
      span{
        margin-right: 5px;
        font-size: 18px;
      }
    }
  }
}
// 课程推荐
.lesson-detail{
  margin-top: 30px;
  .right-page {
    width: 270px;
  }
  .right-page-top{
    background: #fff;
    margin-bottom: 20px;
    padding: 0 20px 20px;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
  }
  .right-page-bottom{
    background: #fff;
    padding: 0 15px 15px;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
  }
  .right-page .panel-title{
    padding: 15px 0;
    font-size: 16px;
    height: 90px;
    color: #333;
    border-bottom: 1px solid #f5f5f5
  }
}
.lesson-detail .left-info{
  width: 850px;
  background: #fff;
  padding: 15px;
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
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
      padding: 5px 10px 10px;
      font-size: 14px;
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
    font-size: 16px;
    line-height: 20px;
  }
  .piece-header:after {
    content: "";
    position: absolute;
    left: 0;
    top: 3px;
    width: 4px;
    height: 16px;
    background-color: #cf010e;
  }
}
.datum-list{
  li{
    font-size: 14px;
    margin-bottom: 20px;
    a {
      color: $red;
    }
    .datum-top{
      line-height: 30px;
    }
    p{
      color: #999;
      font-size: 12px;
    }
  }
}
.panel-body{
  flex-wrap: wrap;
  margin-top: 10px;
  li{
    width: 42px;
    height: 42px;
    margin-bottom: 10px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20px;
    &:nth-child(4n){
      margin-right: 0;
    }
    a{
      display: block;
    }
    img{
      display: block;
      width: 100%;
    }
  }
}
// 弹框
.recommendAlert{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  .close{
    position: absolute;
    right: 15px;
    top: 15px;
    font-size: 20px;
    cursor: pointer;
  }
  .already-subscribe {
    position: relative;
    width: 500px;
    height: 340px;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    .modal-header {
      height: 98px;
      background: #e4393c;
      text-align: center;
      color: #fff;
      padding: 15px;
      border-bottom: 1px solid #e5e5e5;
      min-height: 16.42857143px;
    }
  }
  .modal-title{
    h4{
      font-size: 16px;
      line-height: 20px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      padding: 0 20px;
      margin:12px 0 5px;
    }
    p{
      font-size: 14px;
    }
  }
  .modal-body{
    padding: 15px;
    .succeed {
      text-align: center;
      color: #333;
      font-size: 20px;
      padding: 20px 0px;
      h4{
        font-size: 20px;
        margin: 10px 0;
      }
      p{
        font-size: 24px;
      }
    }
    .btn-primary{
      margin-top: 10px;
      background-color: #cf010e;
      color: #fff;
      font-size: 14px;
      border-radius: 5px;
      padding: 10px 50px;
      display: inline-block;
      cursor: pointer;
    }
    .succeed:first-child {
      border-bottom: 1px solid #ccc;
    }
    .succeed.bottom-succeed{
      padding-top: 30px;
    }
  }
}
</style>