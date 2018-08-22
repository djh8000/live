<template>
  <div class="face-wrap">
    <mt-swipe class="swiper1" :auto="0" :continuous="false">
      <mt-swipe-item v-for = "(item, index) in faceData" class="clearfix" :key="index">
        <img :src="url.faceurl+face+'.gif'" v-for = "(face, key, index) in item" :alt="key" @click.stop="speak(key)">
      </mt-swipe-item>
      </mt-swipe-item>
    </mt-swipe>
  </div>
</template>

<script>
import url from '../config/url'
export default {
  data () {
    return {
      url: url,
      faceData: [
        {
          '呲牙': 1,
          '调皮': 2,
          '汗': 3,
          '偷笑': 4,
          '拜拜': 5,
          '打你': 6,
          '擦汗': 7,
          '猪头': 8,
          '玫瑰': 9,
          '流泪': 10,
          '快哭了': 11,
          '嘘': 12,
          '酷': 13,
          '抓狂': 14,
          '委屈': 15,
          '屎': 16,
          '炸弹': 17,
          '菜刀': 18,
          '可爱': 19,
          '色': 20,
          '害羞': 21
        },
        {
          '得意': 22,
          '吐': 23,
          '微笑': 24,
          '发火': 25,
          '尴尬': 26,
          '惊恐': 27,
          '冷汗': 28,
          '心': 29,
          '嘴唇': 30,
          '白眼': 31,
          '傲慢': 32,
          '难过': 33,
          '惊讶': 34,
          '疑问': 35,
          '睡': 36,
          '亲亲': 37,
          '憨笑': 38,
          '爱情': 39,
          '衰': 40,
          '撇嘴': 41,
          '奸笑': 42
        },
        {
          '奋斗': 43,
          '发呆': 44,
          '右哼哼': 45,
          '抱抱': 46,
          '坏笑': 47,
          '企鹅亲': 48,
          '鄙视': 49,
          '晕': 50,
          '大兵': 51,
          '拜托': 52,
          '强': 53,
          '垃圾': 54,
          '握手': 55,
          '胜利': 56,
          '抱拳': 57,
          '枯萎': 58,
          '米饭': 59,
          '蛋糕': 60,
          '西瓜': 61,
          '啤酒': 62,
          '瓢虫': 63
        },
        {
          '勾引': 64,
          '哦了': 65,
          '手势': 66,
          '咖啡': 67,
          '月亮': 68,
          '匕首': 69,
          '发抖': 70,
          '菜': 71,
          '拳头': 72,
          '鼓掌': 73,
          '抠鼻': 74
        }
      ]
    }
  },
  mounted () {
  },
  methods: {
    speak (name) {
      this.$emit('getface', '[' + name + ']')
    }
  }
}
</script>

<style lang="scss">
.mint-swipe{
  height: 372px;
}
.face-wrap{
  background-color: #fff;
}
.face-wrap .mint-swipe-indicator{
  width: 12px;
  height: 12px;
  background: #aaa;
  margin: 0 8px;
  opacity: 0.5;
  border-radius: 50%;
}
.face-wrap .mint-swipe-indicator.is-active {
  background: #7c7c7c;
  opacity: 0.8;
}
.face-wrap .mint-swipe-items-wrap > div{
  padding:20px;
  box-sizing: border-box;
  img{
    height: 56px;
    display: block;
    float: left;
    margin: 22px;
  }
}
.face-wrap .mint-swipe-indicators{
  bottom: 20px;
}
</style>