<template>
  <div class="order-content w">
    <div class="order-tit flex j-s">
      <span>直播课程</span>
      <span class="price-tit">价格</span>
    </div>
    <!-- 组合购买 -->
    <ul class="order-list" v-if="orderLiveList.length > 1">
      <li  v-for=" item in orderLiveList " :key="item.id">
        <nuxt-link class='flex a-c j-s' :to="'/item?targetId='+ item.id">
          <div class="left-info flex a-c">
            <div class="left-img">
              <img :src="item.img">
            </div>
            <div class="left-name elis">{{item.name}}</div>
          </div>
          <div class="right-info">
            <span class="price">￥{{item.price}}</span>
          </div>
        </nuxt-link>
      </li>
    </ul>
    <ul class="order-list" v-else>
      <li>
        <nuxt-link class='flex a-c j-s' :to="'/item?targetId='+ orderInfo.id">
          <div class="left-info flex a-c">
            <div class="left-img">
              <img :src="orderInfo.img">
            </div>
            <div class="left-name elis">{{orderInfo.title}}</div>
          </div>
          <div class="right-info">
            <span class="price">￥{{orderInfo.totalPrice}}</span>
          </div>
        </nuxt-link>
      </li>
    </ul>
    <div class="order-tit flex j-s" v-if="orderProductIds.length > 0">
      <span>加价购</span>
      <span class="price-tit">价格</span>
    </div>
    <ul class="add-order">
      <li v-for="(item, index) in orderProductIds" :key="index">
        <nuxt-link class="flex a-c j-s" to="">
          <div class="left-info flex a-c">
            <div class="left-name">
              <span>产品名称:</span>
              <em>{{item.name}}</em>
            </div>
            <div class="left-name second-name">
              <span>类型:</span>
              <em v-if="item.type === 'course'">课程</em>
              <em v-else>资料</em>
            </div>
          </div>
          <div class="right-info">
            <span class="price">￥{{item.price}}</span>
          </div>
        </nuxt-link>
      </li>
    </ul>
    <!-- 优惠券 -->
    <div class="coupon-content flex j-s a-c" v-if="getOrderInfo.liveIds && getOrderInfo.liveIds.length < 2">
      <div class="left-info flex a-c">
        <span class="LIVEFONT">&#xe63f;</span>
        <em>优惠码</em>
        <i v-if="useable != 'yes'">（没有使用优惠码）</i>
      </div>
      <div class="center-info">
        <el-form :model="mycoupon"  ref="mycoupon" class="formContant">
          <div class="code-input">
            <div class="choose-code flex a-c" v-if="!showInput">
              <!-- 优惠码选择 -->
              <el-select v-if="couponList" v-model="mycoupon.selectChoose" placeholder="请选择" >
                <el-option  v-for="item in couponList" :key="item.id" :label="item.title" :value="item.code">
                </el-option>
                <el-option label="不使用优惠券" value="">
                </el-option>
              </el-select>
              <!-- 优惠码选择   end -->
              <div class="input-button" @click="showInput = true, useable = false">输入优惠码</div>
            </div>
            <div class="code-write flex a-c" v-if="showInput">
              <el-input v-model="mycoupon.couponNum" placeholder="请输入优惠码"></el-input>
              <div class="input-button" @click="inputNumCheck()">使用</div>
              <div class="cancel-btn" @click="unUse('input')">取消</div>
            </div>
          </div>
          <div :class="[useable === 'yes'? '' : 'coupon-notice-no']" class="coupon-notice " v-if="useable">
            {{checkData}}
          </div>
        </el-form>
      </div>
      <div class="right-info">
        抵扣<span>￥{{downPrice}}</span>
      </div>
    </div>
    <!-- 付款 -->
    <div class="pay-content">
      <div class="pay-num">
        <span>应付金额:</span>
        <em>￥{{needPay}}</em>
      </div>
      <div class="out-pay">
        <button @click="trueOrder()">提交订单</button>
      </div>
    </div>
    <!-- 付款   end -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      couponList: [],
      ifHave: false, // 是否有优惠券
      useable: false, // 优惠券是否可用
      showSelect: false, // 显示下拉选择优惠券
      showInput: false, // 显示输入优惠码框
      useCode: '', // 使用优惠码号
      needPay: '',
      downPrice: '0.00', // 优惠券抵扣金额
      mycoupon: {
        selectChoose: '',
        couponNum: ''
      }, // 优惠券表单
      orderInfo: {},
      getOrderInfo: {}, // 订单选择信息
      orderLiveList: [], // 组合购选中产品列表
      orderProductIds: [] // 加价购选中产品列表
    }
  },
  computed: {
    ...mapState(['url'])
  },
  mounted () {
    const { targetId = '' } = this.$route.query
    this.targetId = targetId
    this.orderList()
  },
  updated () {
  },
  watch: {
    'mycoupon.selectChoose' (val) {
      // 选择优惠码
      if (val) {
        // 选择优惠券
        this.useCode = val
        this.check()
      } else {
        this.useCode = '' // 清空优惠码
        this.downPrice = '0.00'
        this.needPay = this.getOrderInfo.totalPrice
        this.useable = false // 关闭优惠券提示信息
      }
    }
  },
  methods: {
    orderList () {
      // 获取缓存订单信息
      if (!localStorage.getItem('setOrder')) {
        this.$router.go(-1)
      }
      let orderInfo = localStorage.getItem('orderInfo')
      orderInfo = JSON.parse(orderInfo)
      let getOrderInfo = localStorage.getItem('setOrder') || false
      getOrderInfo = JSON.parse(getOrderInfo)
      let chooseList = localStorage.getItem('chooseList') || false
      chooseList = JSON.parse(chooseList)
      let { orderLiveList = [], orderProductIds = [] } = chooseList
      this.orderInfo = orderInfo
      this.getOrderInfo = getOrderInfo
      this.addPrice = getOrderInfo.addPrice
      this.needPay = getOrderInfo.totalPrice
      this.orderLiveList = orderLiveList
      this.orderProductIds = orderProductIds
      if (orderLiveList.length < 2) {
        // 单个购买，以及组合购只选择一个商品是 check优惠券
        this.setDefalutCoupon()
      }
    },
    // 优惠券号码check
    inputNumCheck () {
      this.useCode = this.mycoupon.couponNum
      this.check()
    },
    // 优惠券check
    check () {
      const checkPage = {
        data: {
          targetId: this.targetId || 0,
          targetType: 3,
          targetCode: this.useCode
        },
        str: 'order/usableCoupon'
      }
      this.$axios.$post('api/' + checkPage.str, checkPage.data).then(res => {
        if (res.coupon) {
          let couponInfo = { ...res.coupon[0] }
          this.needPay = this.couponUsed(couponInfo.type, couponInfo.rate) // 应付金额
          this.downPrice = (this.getOrderInfo.totalPrice - this.needPay).toFixed(2)
          this.checkData = this.couponType(couponInfo.type, couponInfo.rate)
          this.useable = 'yes'
        } else {
          this.checkData = res.msg
          this.downPrice = '0.00'
          this.needPay = this.getOrderInfo.totalPrice
          this.useable = 'no'
          this.useCode = ''
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
    // 提交订单
    trueOrder () {
      let that = this
      let creatPage = {
        data: {
          ...this.getOrderInfo,
          liveIds: JSON.stringify(this.getOrderInfo.liveIds),
          productIds: JSON.stringify(this.getOrderInfo.productIds),
          shouldPay: this.needPay,
          coupon: this.useCode
        },
        str: 'order/createLive'
      }
      this.$axios.$post('api/' + creatPage.str, creatPage.data).then(res => {
        if (this.needPay <= 0 && res.orderId) {
          this.$msg({
            message: '预约成功',
            type: 'success'
          })
          setTimeout(function () {
            that.$router.go(-1)
          }, 500)
        } else if (res.orderId) {
          window.location.href = `${this.url.uchttp}/pay.html?#/pay1/cash/${res.orderId}?channel=2&coinPay=0`
        }
      })
    },
    // 不使用优惠券
    unUse (type) {
      if (type === 'input') {
        // 输入框不显示
        this.showInput = false
        this.useable = false // 关闭优惠券提示信息
        this.setDefalutCoupon()
      }
    },
    // 设置默认优惠券
    setDefalutCoupon () {
      if (this.couponList.length > 0) {
        let mycoupon = this.mycoupon
        mycoupon.selectChoose = this.couponList[0].code
        this.useCode = mycoupon.selectChoose
        this.mycoupon = {
          ...mycoupon
        }
        this.check()
      }
    }
  },
  asyncData ({ $axios, query }) {
    const liveid = query.targetId
    const couponPage = {
      data: {
        targetId: liveid,
        targetType: 3
      },
      str: 'order/usableCoupon'
    }
    return Promise.all([
      $axios.$post('api/' + couponPage.str, couponPage.data)
    ]).then(([couponData]) => {
      let couponList = couponData.coupon || []
      return {
        couponList
      }
    })
  }
}
</script>

<style lang="scss">
.order-content{
  background: #fff;
  padding: 30px;
  padding-top: 10px;
  margin-top: 30px;
  .order-tit{
     line-height: 40px;
     font-size: 14px;
     span{
      font-size: 14px;
     }
  }
  .price-tit{
    width: 120px;
  }
  span.price{
    color: #f35050;
    font-weight: bold;
    font-size: 16px;
    display: block;
    width: 100px;
  }
}
.order-list{
  li{
    border: 1px solid $border-color1;
    background: #fafafa;
    margin-bottom: 10px;
    height: 115px;
    padding: 15px 30px;
    color: #333;
    .left-info{
      .left-img{
        width: 130px;
        height: 73.1px;
        overflow: hidden;
        flex-shrink: 0;
        border-radius: 5px;
        img{
          display: block;
          height: 100%;
          width: 100%;
        }
      }
      .left-name{
        padding-left: 15px;
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
}
.add-order{
  li{
    border: 1px solid $border-color1;
    background: #fafafa;
    margin-bottom: 10px;
    height: 60px;
    padding: 15px 30px;
    color: #333;
    line-height: 28px;
    .left-info{
      font-size: 14px;
      span{
        font-weight: bold;
      }
      em{
        font-weight: bold;
        color: #f35050;
        font-style: normal;
        margin-left: 10px;
      }
      .second-name{
        margin-left: 20px;
      }
    }
  }
}
.pay-content{
  text-align: right;
  .pay-num{
    line-height: 30px;
    color: #333;
    font-weight: bold;
    font-size: 16px;
    margin: 20px 0 15px;
    span{
      font-size: 16px;
    }
    em{
      font-style: normal;
      font-size: 18px;
      margin-left: 10px;
      color: #f35050;
    }
  }
  .out-pay{
    button{
      padding: 7px 20px;
      background: #f35050;
      color: #fff;
      cursor: pointer;
      transition: all 0.5s;
      &:hover{
        background-color: #ff3b3b;
      }
    }
  }
}
.coupon-content{
  color: #333;
  padding: 0 20px;
  margin-top: 30px;
  .left-info{
    span{
      font-size: 34px;
      color: #ff5000;
    }
    em{
      margin-left: 10px;
      font-size: 20px;
    }
    i{
      color: #999;
      font-size: 14px;
      margin-left: 10px;
    }
  }
  .right-info{
    font-size: 16px;
    color: #666;
    span{
      font-size: 20px;
      margin-left: 10px;
      color: #333;
    }
  }
}

.input-button{
  margin-left: 10px;
  margin-right: 10px;
  color: #fff;
  background-color: #ff3b3b;
  padding: 10px 15px;
  border-radius: 3px;
  flex-shrink: 0;
  cursor: pointer;
}
.cancel-btn{
  flex-shrink: 0;
  cursor: pointer;
}
.center-info{
  position: relative;
}
.coupon-notice{
  position: absolute;
  bottom: -42px;
  left: 0;
  border: 1px solid #cddfb4;
  background-color: #f2fae3;
  color: #659f13;
  font-size: 12px;
  line-height: 20px;
  padding: 5px 10px;
}
.coupon-notice-no{
  border-color: #f0c7bd;
  background-color: #fff1f0;
  color: #e74c3c;
}
</style>