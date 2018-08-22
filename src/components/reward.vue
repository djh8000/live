
<template>
  <div ref="chatRewardAlert" class="rewardAlert flex a-c j-c" v-show="rewardShow">
      <div class="alert-content" :class="[rewardShow? 'active' : '']">
        <div class="alert-tit">请选择打赏金额：</div>
        <ul class="choose-type flex j-s a-c">
          <li :class="[choosedNum == 0.5?'choosed' : '']" @click="toChoosedNum(0.5)">
            5角
            <span class="LIVEFONT">&#xe64f;</span>
          </li>
          <li :class="[choosedNum == 1?'choosed' : '']" @click="toChoosedNum(1)">
            1元
            <span class="LIVEFONT">&#xe64f;</span>
          </li>
          <li :class="[choosedNum == 2?'choosed' : '']" @click="toChoosedNum(2)">
            2元
            <span class="LIVEFONT">&#xe64f;</span>
          </li>
          <li :class="[choosedNum == 5?'choosed' : '']" @click="toChoosedNum(5)">
            5元
            <span class="LIVEFONT">&#xe64f;</span>
          </li>
          <li :class="[choosedNum == 8?'choosed' : '']" @click="toChoosedNum(8)">
            8元
            <span class="LIVEFONT">&#xe64f;</span>
          </li>
          <li :class="[choosedNum == 10?'choosed' : '']" @click="toChoosedNum(10)">
            10元
            <span class="LIVEFONT">&#xe64f;</span>
          </li>
        </ul>
        <div class="alert-tit">土豪请随意：</div>
        <input v-model="myNum" @focus="inputNum($event)" class="numMoney" type="Number" placeholder="200.00" maxlength="3">
        <div class="alert-btn flex a-c">
          <span class="cancel" @click="closeReward(false)">取消</span>
          <span class="comfirm" @click="getNum()">确认支付</span>
        </div>
      </div>
    </div>
  </template>

<script>
import url from '../config/url'
export default {
  data () {
    return {
      choosedNum: 5,
      myNum: '',
      order_id: ''
      // time: 0,
    }
  },
  props: ['rewardShow'],
  methods: {
    // 弹框打开关闭
    closeReward (status) {
      this.$emit('childRewardShow', status)
    },
    // 打赏失去焦点
    // 金额选择
    toChoosedNum (num) {
      this.choosedNum = num
    },
    // 输入框获取焦点事件
    inputNum (e) {
      this.choosedNum = false
      if (!this.myNum) {
        // 如果input框内没输入值
        this.myNum = '200.00'
      }
    },
    getNum () {
      let totalPrice = ''
      this.closeReward(false)
      if (this.choosedNum) {
        totalPrice = this.choosedNum
      } else {
        totalPrice = this.myNum
        let reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
        if (!reg.test(totalPrice)) {
          this.$msg('金额错误')
          return
        }
      }
      let payload = {
        targetId: this.$route.params.id || null,
        shouldPay: totalPrice
      }
      this.createOrder(payload)
    },
     // 创建订单
    createOrder: function (payload) {
      let make = {
        data: {
          targetType: 'reward',
          returnUrl: window.location.href,
          ...payload
        },
        str: 'order/createReward'
      }
      this.http.post('api/' + make.str, make.data)
      .then(res => {
        this.order_id = res.data.orderId
        this.WEIXINpay()
      })
    },
    // 去支付
    WEIXINpay: function () {
      // 判断是否是微信浏览器内打开，（微信公共号支付）
      var agent = navigator.userAgent.toLowerCase()
      if (agent.match(/MicroMessenger/i)) {
        if (agent.match(/MicroMessenger/i)[0] === 'micromessenger') {
          let urlNum = window.history.length || 0
          window.location.href = `${url.uchttp}pay.html?#/pay1/cash/${this.order_id}?channel=2&coinPay=0&payment=2&len=${urlNum}`
        }
      } else {
        let payData = {
          payment: 2,
          order_id: this.order_id,
          return_url: window.location.href
        }
        this.http.post(url.uc + 'api/order/pay', payData)
        .then(res => {
          // localStorage.setItem('routerNum', true)
          window.location.href = res.data.pay_url
        })
      }
    }
  }
}
</script>

<style lang="scss">
// 打赏弹框
.rewardAlert{
  z-index: 99999999999999;
  background: rgba(0,0,0,0.5);
  position: fixed;
  bottom: auto;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  .alert-content{
    width: 500px;
    height: 500px;
    background: #fff;
    padding: 20px 30px;
  }
  .alert-tit{
    line-height: 40px;
    font-size: 28px;
    color: $font-color1;
    margin-bottom: 15px;
  }
  .choose-type{
    flex-wrap: wrap;
    li{
      width: 200px;
      border: 1px solid $border-color1;  /*no*/
      margin-bottom: 20px;
      text-align: center;
      line-height: 50px;
      font-size: 30px;
      position: relative;
      color: $sliver-color;
      overflow: hidden;
      span{
        position: absolute;
        right: -23px;
        bottom: -8px;
        font-size: 80px;
        display: none;
      }
      &.choosed{
        border-color: $sliver-color;
        span{
          display: block;
        }
      }
    }
  }
  .numMoney{
    color: $sliver-color;
    padding: 0 20px;
    height: 50px;
    line-height: 50px;
    border: 1px solid $border-color1; /*no*/
    margin-bottom: 30px;
    display: block;
    width: 100%;
  }
  .alert-btn{
    justify-content: flex-end;
    span{
      line-height: 50px;
      padding: 0 30px;
      background: #7c7c7c;
      display: block;
      border-radius: 5px;
      margin-left: 20px;
      color: #fff;
      &.comfirm{
        background: $sliver-color;
      }
    }
  }
}
</style>