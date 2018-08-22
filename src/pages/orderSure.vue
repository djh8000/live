<template>
  <div class="orderSure">
    <div class="order-info flex a-c" v-if="orderInfo.title">
      <div class="left-info">
        <img :src="orderInfo.img">
      </div>
      <div class="right-info">
        <div class="live-tit">{{orderInfo.title}}</div>
        <div class="live-price">
          订单价格<span>{{orderInfo.totalPrice}}</span>元
        </div>
      </div>
    </div>
    <!-- 选中商品列表 -->
    <div class="choose-list">
      <div class="group-content" v-if="orderLiveList.length > 1">
        <h2 class="live-tit">组合购</h2>
        <div class="buy-ul">
          <div v-for="(item, index) in orderLiveList" :key="item.id" class="buy-li">
            <div class="left-choose elis flex j-s">
              <span class="course-name elis">{{item.name}}</span>
              <span>原价:{{item.price}}元</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 组合购   end -->
      <!-- 加价购 -->
      <div class="group-content addprice" v-if="orderProductIds.length > 0">
        <h2 class="live-tit">加价购</h2>
        <div class="buy-ul">
          <div v-for="(item, index) in orderProductIds" :key="item.id"  class="buy-li flex j-s a-c">
            <div class="left-choose flex j-s a-c">
              <span class="course-name elis">{{item.name}}</span>
              <span>
                <em class="add">仅需加价{{item.price}}元</em>{{item.originPrice}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 选中商品列表   end -->
    <div class="coupon-tit left-info flex a-c" v-if="getOrderInfo.liveIds && getOrderInfo.liveIds.length < 2">
        <span class="LIVEFONT">&#xe63f;</span>
        <em>优惠码</em>
        <i v-if="useable != 'yes'">（没有使用优惠码）</i>
      </div>
    <div class="coupon-content flex j-s a-c" v-if="getOrderInfo.liveIds && getOrderInfo.liveIds.length < 2">
      <div class="center-info">
          <div class="code-input">
            <div class="choose-code flex a-c" v-if="!showInput">
              <input @click="popupVisible = true" readonly="readonly" class="choose-coupon" type="couponChoose" :value="choose">
              <mt-popup
                v-model="popupVisible"
                position="bottom">
                <div class="choose-couponbox">
                  <mt-picker :slots="slots" @change="onValuesChange" valueKey= "title"></mt-picker>
                </div>
              </mt-popup>
              <!-- 优惠码选择   end -->
              <div class="input-button" @click="showInput = true, useable = false">输入优惠码</div>
            </div>
            <div class="code-write flex a-c" v-if="showInput">
              <input v-model="mycoupon.couponNum" class="choose-coupon" placeholder="请输入优惠码">
              <div class="input-button" @click="inputNumCheck()">使用</div>
              <div class="cancel-btn" @click="unUse('input')">取消</div>
            </div>
          </div>
          <div :class="[useable === 'yes'? '' : 'coupon-notice-no']" class="coupon-notice " v-if="useable">
            {{checkData}}
          </div>
      </div>
    </div>
    <div class="out-price">
      <div class="dc-num" v-if="getOrderInfo.liveIds && getOrderInfo.liveIds.length < 2">
        抵扣<span>￥{{downPrice}}</span>
      </div>
      <div class="pay-content">
        <span>应付金额:</span>
        <em>￥{{needPay}}</em>
      </div>
    </div>
    <div class="go-pay" @click="creatOrder">提交订单</div>
  </div>
</template>

<script>
import url from '../config/url'
export default {
  name: 'orderSure',
  data () {
    return {
      orderInfo: {},
      getOrderInfo: {},
      ifHave: false, // 是否有优惠券
      useable: false, // 优惠券是否可用
      showSelect: false, // 显示下拉选择优惠券
      showInput: false, // 显示输入优惠码框
      useCode: '', // 使用优惠码号
      needPay: '',
      choose: '不使用优惠券', // 选中优惠券名称
      mycoupon: {
        selectChoose: '',
        couponNum: ''
      }, // 优惠券表单
      couponList: [],
      downPrice: '0.00', // 优惠券抵扣金额
      slots: [
        {
          flex: 1,
          defaultIndex: 0,
          values: [
          ],
          className: 'slot1',
          textAlign: 'center'
        }
      ],
      popupVisible: false,
      addPrice: 0,
      orderLiveList: [], // 组合购选中产品列表
      orderProductIds: [] // 加价购选中产品列表
    }
  },
  methods: {
    // 优惠券选择信息
    onValuesChange (picker, values) {
      if (!values[0]) {
        return
      }
      let id = values[0].code || ''
      if (id) {
        // 选择优惠券
        this.choose = values[0].title
        this.useCode = id
      } else {
        this.choose = values[0].title
        this.useCode = '' // 清空优惠码
        this.downPrice = '0.00'
        this.needPay = this.getOrderInfo.totalPrice
        this.useable = false // 关闭优惠券提示信息
      }
    },
    // 优惠券check
    check () {
      const checkPage = {
        data: {
          targetId: this.targetId,
          targetType: 3,
          targetCode: this.useCode
        },
        str: 'order/usableCoupon'
      }
      this.http.post('api/' + checkPage.str, checkPage.data).then(res => {
        // 优惠券是否可用
        if (res) {
          let couponInfo = { ...res.data.coupon[0] }
          this.needPay = this.couponUsed(couponInfo.type, couponInfo.rate) // 应付金额
          this.downPrice = (this.getOrderInfo.totalPrice - this.needPay).toFixed(2) // 减去多少钱
          this.checkData = this.couponType(couponInfo.type, couponInfo.rate)
          this.useable = 'yes'
        } else {
          this.checkData = '优惠券不可用'
          this.useable = 'no' // 优惠券是否可用
          this.downPrice = '0.00'
          this.useCode = ''
          this.needPay = this.getOrderInfo.totalPrice
        }
      })
    },
    // 判断优惠券类型
    couponType (type, rate) {
      if (type === 'free') {
        return '优惠码可用 您使用的是全免优惠码'
      } else if (type === 'discount') {
        return '优惠码可用 当前已打' + rate + '折'
      } else {
        return '优惠码可用 当前已抵扣' + this.downPrice + '元'
      }
    },
    // 优惠券后价格
    couponUsed (type, rate) {
      let shouldRate = (this.getOrderInfo.totalPrice - this.addPrice).toFixed(2) // 参与打折价格
      var nowPice = 0 // 打折后的直播价格不包括加价购
      var shouldPay = 0 // 应付金额
      if (type === 'free') {
        nowPice = 0
      } else if (type === 'discount') {
        nowPice = (shouldRate * rate * 0.1).toFixed(2)
      } else {
        if (Number(shouldRate) > Number(rate)) {
          nowPice = (shouldRate - rate).toFixed(2)
        } else {
          nowPice = 0
        }
      }
      shouldPay = (Number(nowPice) + Number(this.addPrice)).toFixed(2)
      return shouldPay
    },
    // 优惠券号码check
    inputNumCheck () {
      this.useCode = this.mycoupon.couponNum
      this.check()
    },
    // 不使用优惠券
    unUse (type) {
      if (type === 'input') {
        // 输入框不显示
        this.showInput = false
        this.useable = false // 关闭优惠券提示信息
        if (this.useCode) {
        // 选择优惠券
          this.check()
        } else {
          // 重新获取优惠码
          this.getCoupon()
          this.downPrice = '0.00'
          this.needPay = this.getOrderInfo.totalPrice
          this.useable = false // 关闭优惠券提示信息
        }
      }
    },
    // 获取优惠券信息
    getCoupon () {
      let slots = this.slots
      slots[0].values = []
      const couponPage = {
        data: {
          targetId: this.targetId,
          targetType: 3
        },
        str: 'order/usableCoupon'
      }
      this.http.post('api/' + couponPage.str, couponPage.data)
      .then(res => {
        let nochoose = {
          id: 0,
          title: '不使用优惠券',
          truePrice: 0.00,
          code: ''
        }
        if (res.data.coupon) {
          this.couponList = res.data.coupon
          for (var i = 0; i < this.couponList.length; i++) {
            slots[0].values.push(this.couponList[i])
          }
        }
        slots[0].values.push(nochoose)
        slots[0].defaultIndex = 0
        this.slots = slots
      })
    },
    creatOrder () {
      let make = ''
      let that = this
      make = {
        data: {
          ...this.getOrderInfo,
          liveIds: JSON.stringify(this.getOrderInfo.liveIds),
          productIds: JSON.stringify(this.getOrderInfo.productIds),
          coupon: this.useCode, // 优惠券码
          shouldPay: this.needPay // 应付金额
        },
        str: 'order/createLive'
      }
      this.http.post('api/' + make.str, make.data)
      .then(res => {
        if (this.needPay <= 0 && res.code === 1000) {
          this.$msg('预约成功')
          setTimeout(function () {
            that.$router.go(-1)
          }, 500)
        } else if (res.code === 1000) {
          let urlNum = window.history.length - 1 || 0
          window.location.href = `${url.uchttp}pay.html?#/pay1/cash/${res.data.orderId}?channel=2&coinPay=0&len=${urlNum}`
        }
      })
    },
    // 页面信息初始化
    getLiveDtetail () {
      let orderInfo = localStorage.getItem('orderInfo')
      orderInfo = JSON.parse(orderInfo)
      let getOrderInfo = localStorage.getItem('setOrder') || false
      getOrderInfo = JSON.parse(getOrderInfo)
      let chooseList = localStorage.getItem('chooseList') || false
      chooseList = JSON.parse(chooseList)
      let { orderLiveList = [], orderProductIds = [] } = chooseList
      this.orderInfo = orderInfo // 订单顶部展示信息
      this.getOrderInfo = getOrderInfo // 订单提交信息
      this.needPay = getOrderInfo.totalPrice
      this.addPrice = getOrderInfo.addPrice
      this.orderLiveList = orderLiveList // 组合选择信息
      this.orderProductIds = orderProductIds // 加价选择信息
    }
  },
  mounted () {
    const { targetId = '' } = this.$route.query
    this.targetId = targetId
    // 订单信息
    this.getLiveDtetail()
    this.getCoupon()
  },
  watch: {
    // 路由变化
    '$route' (val) {
      let path = this.$route.path
      if (path === '/orderSure') {
        let getOrderInfo = localStorage.getItem('orderInfo')
        getOrderInfo = JSON.parse(getOrderInfo)
        this.orderInfo = {
          ...getOrderInfo
        }
      }
    },
    'choose' (val) {
      // 选择优惠码
      if (this.useCode) {
        // 选择优惠券
        this.check()
      } else {
        this.useCode = '' // 清空优惠码
        this.downPrice = '0.00'
        this.needPay = this.getOrderInfo.totalPrice
        this.useable = false // 关闭优惠券提示信息
      }
    }
  },
  updated () {
  }
}
</script>


<style lang="scss">
.orderSure{
  padding-bottom: 90px;
  min-height: 100vh;
}
.order-info{
  background: #fff;
  padding: 20px 25px;
  .left-info{
    width: 320px;
    height: 180px;
    flex-shrink: 0;
    img{
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .right-info{
    padding-left: 20px;
    .live-tit{
      font-size: 30px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      line-height: 36px;
      height: 72px;
      color: $font-color1;
      margin-bottom: 50px;
    }
    .live-price{
      color: $font-color2;
      font-size: 26px;
      span{
        color: $sliver-color;
        margin: 0 5px;
      }
    }
  }
}
.order-notice{
  font-size: 28px;
  color: $sliver-color;
  padding: 0 30px;
  margin-top: 20px;
}
.go-pay{
  background: $master-color;
  color: #fff;
  text-align: center;
  height: 90px;
  line-height: 90px;
  font-size: 30px;
  bottom: 0;
  left: 0;
  position: fixed;
  width: 100%;
}
// 优惠券
.coupon-tit{
  color: #333;
  padding: 0 20px;
  margin-top: 30px;
  line-height: 30px;
    span{
      font-size: 38px;
      color: #ff5000;
      margin-right: 10px;
    }
    em{
      font-size: 28px;
    }
    i{
      color: #999;
      font-size: 28px;
      margin-left: 10px;
    }
}
.coupon-content{
  color: #333;
  padding: 0 20px;
  margin-top: 30px;
}
.out-price{
  margin-top: 50px;
  text-align: right;
  font-size: 28px;
  color: #333;
  padding: 0 30px;
}
.pay-content{
  margin-top: 30px;
  text-align: right;
  font-size: 28px;
  font-weight: bold;
  em{
    color: $master-color;
  }
}
.dc-num{
  span{
    margin-left: 10px;
    color: #333;
  }
}
.input-button{
  margin-left: 10px;
  margin-right: 10px;
  color: #fff;
  background-color: #ff3b3b;
  padding: 10px 20px;
  border-radius: 3px;
  flex-shrink: 0;
  cursor: pointer;
  height: 60px;
  font-size: 26px;
  line-height: 40px;
}
.cancel-btn{
  flex-shrink: 0;
  font-size: 26px;
  margin-left: 10px;
  cursor: pointer;
}
.center-info{
  position: relative;
}
.coupon-notice{
  position: absolute;
  bottom: -72px;
  left: 0;
  border: 1px solid #cddfb4;
  background-color: #f2fae3;
  color: #659f13;
  font-size: 24px;
  line-height: 40px;
  padding: 5px 10px;
}
.coupon-notice-no{
  border-color: #f0c7bd;
  background-color: #fff1f0;
  color: #e74c3c;
}
.choose-coupon{
  height: 60px;
  color: #666;
  padding: 0 20px;
  width: 400px;
  font-size: 26px;
  margin-right: 10px;
  outline: none;
  border-radius: 3px;
  border: 1px solid #e5e5e5;
  -webkit-appearance: none;
}
// 优惠券选择弹框
.choose-couponbox{
  height: 300px;
  width: 750px;
  .picker-item{
    font-size: 24px;
  }
}
.picker-item.picker-selected{
  color: $master-color;
  background: #eee;
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
          width: 100%;
          overflow: hidden;
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
</style>