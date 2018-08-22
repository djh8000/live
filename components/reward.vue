<template>
  <div class="rewardAlert flex a-c j-c" v-show="rewardShow">
      <div class="alert-content" :class="[rewardShow? 'active' : '']">
        <div v-if="!code_url">
          <div class="alert-tit">请选择打赏金额：</div>
          <ul class="choose-type flex j-s a-c">
            <li v-for="item in choosedNums" :class="[choosedNum == item?'choosed' : '']" @click="toChoosedNum(item)">
              {{ item < 1 ? item*10+'角' : item+'元'}}
             <span class="LIVEFONT">&#xe64f;</span>
            </li>
          </ul>
        <div class="alert-tit">土豪请随意：</div>
        <input v-model="myNum" @focus="inputNum($event)" class="numMoney" type="Number" placeholder="200.00" maxlength="3">
        <div class="alert-btn flex a-c">
          <el-button type="danger" class="cancel" @click="closeReward(false)" size="mini">取消</el-button>
          <el-button class="comfirm" type="primary" @click="getNum()" size="mini">确认支付</el-button>
        </div>
        </div>
        <div class="ercode-wrap" v-else>
          <div class="ercode-box" >
             <qrcode class="qr-canvas" :value="code_url" :options="{ size: 250 }"></qrcode>
          </div>
          <div class="wx_miao">
              <i class="LIVEFONT">&#xe606;</i>
              <span>请使用微信扫一扫<br>扫描二维码支付
              </span>
          </div>
          <div class="alert-btn flex a-c">
            <el-button type="danger" class="cancel" @click="closeErcode()" size="mini">取消</el-button>
          </div>
        </div>
      </div>
    </div>
  </template>
<script>
import qrcode from '@xkeshi/vue-qrcode'
export default {
  data () {
    return {
      choosedNums: [0.5, 1, 2, 5, 8, 10],
      choosedNum: 5,
      myNum: '',
      order_id: '',
      code_url: '',
      time: 0
    }
  },
  props: ['rewardShow'],
  methods: {
    // 弹框打开关闭
    closeReward (status) {
      this.$emit('childRewardShow', status)
    },
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
      if (this.choosedNum) {
        totalPrice = this.choosedNum
      } else {
        totalPrice = this.myNum
        const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
        if (!reg.test(totalPrice)) {
          this.$msg('金额错误')
          return
        }
      }
      const payload = {
        targetId: this.$route.params.id || null,
        shouldPay: totalPrice
      }
      this.createOrder(payload)
    },
    // 创建订单
    createOrder: function (payload) {
      const make = {
        data: {
          targetType: 'reward',
          returnUrl: window.location.href,
          ...payload
        },
        str: 'order/createReward'
      }
      this.$axios
        .$post('api/' + make.str, make.data)
        .then(res => {
          this.order_id = res.orderId
          const payData = {
            payment: 2,
            order_id: res.orderId,
            return_url: window.location.href
          }
          return this.$axios.$post(
            this.$store.state.url.ucapi + 'api/order/pay',
            payData
          )
        })
        .then(res => {
          console.log('resres', res)
          this.code_url = res.code_url
          this.time = 0
          // this.paytimer && clearInterval(this.paytimer)
          this.paying()
        })
    },
    closeErcode () {
      this.code_url = ''
      this.order_id = ''
      // this.paytimer && clearInterval(this.paytimer)
    },
    paying () {
      // if (this.time >= 150) {
      //   clearInterval(this.payin)
      //   this.code_url = ''
      //   this.order_id = ''
      // } else {
      // this.time++
      this.$axios
        .$post(this.$store.state.url.ucapi + 'api/order/query', {
          order_id: this.order_id
        })
        .then(res => {
          // if (res.status === 'paid') {
          //   // 已打赏付款
          //   const totalPrice = this.choosedNum ? this.choosedNum : this.myNum
          //   this.$emit('rewardSuccessInfo', totalPrice)
          // }
        })
        // this.paytimer = setTimeout(() => {
        //   this.paying()
        // }, 3000)
      // }
    }
  },
  components: {
    qrcode
  }
  // destroyed () {
  //   console.log('destroyed')
  //   // this.paytimer && clearInterval(this.paytimer)
  // }
}
</script>
<style lang="scss">
// 打赏弹框
.rewardAlert {
  z-index: 99999999999999;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  .alert-content {
    width: 310px;
    background: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -200px;
    margin-top: -200px;
    padding: 16px 24px;
    border-radius: 5px;
    &.active {
      -webkit-animation: bounce 0.4s;
      animation: bounce 0.4s;
    }
  }
  .alert-tit {
    line-height: 28px;
    font-size: 18px;
    color: $font-color1;
    margin-bottom: 12px;
  }
  .choose-type {
    flex-wrap: wrap;
    li {
      width: 120px;
      border: 1px solid $border-color1;
      margin-bottom: 16px;
      text-align: center;
      line-height: 32px;
      font-size: 18px;
      position: relative;
      color: $master-color;
      overflow: hidden;
      cursor: pointer;
      span {
        position: absolute;
        right: -18.4px;
        bottom: -6.4px;
        font-size: 64px;
        display: none;
      }
      &.choosed {
        border-color: $master-color;
        span {
          display: block;
        }
      }
    }
  }
  .numMoney {
    color: $master-color;
    text-indent: 10px;
    height: 36px;
    line-height: 36px;
    border: 1px solid $border-color1;
    margin-bottom: 20px;
    display: block;
    width: 100%;
  }
  .alert-btn {
    justify-content: flex-end;
  }
  .ercode-wrap {
    .ercode-box {
      width: 100%;
      display: flex;
      justify-content: center;
      .qr-canvas {
        width: 250px !important;
        height: 250px !important;
      }
    }
    .wx_miao {
      display: flex;
      align-items: center;
      background: $master-color;
      color: #fff;
      padding: 8px 20px;
      margin-top: 10px;
      margin-bottom: 12px;
      i {
        font-size: 24px;
        margin-right: 20px;
      }
    }
  }
}

// 弹框动画
@-webkit-keyframes bounce {
  0% {
    top: -500px;
  }
  100% {
    top: 50%;
  }
}
@keyframes bounce {
  0% {
    top: -500px;
  }
  100% {
    top: 50%;
  }
}
</style>