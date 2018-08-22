<template>
  <div class="download">
    <div class="download-content">
      <!-- <ul class="download-type flex">
        <li @click="chooseType(1)" :class="[type === 1? 'active': '']">课程资料</li>
        <li @click="chooseType(2)" :class="[type === 2? 'active': '']">直播资料</li>
      </ul> -->
      <div class="download-list">
        <ul v-if="download.length > 0" class="download-ul">
          <li v-for="item in download" :key="item.materailId">
            <a class="flex j-s" :href="item.fileUri" :download="item.title">
              <div class="left-info">{{item.title}}</div>
              <div class="right-info">
                <div class="download-stadus LIVEFONT">&#xe667;</div>
                <div class="download-num">{{(item.sizeKb).toFixed(1)}}kb</div>
              </div>
            </a>
          </li>
        </ul>
        <empty v-else :emptyInfo="emptyInfo"></empty>
      </div>
    </div>
  </div>
</template>

<script>
import empty from '../components/empty.vue'
export default {
  name: 'download',
  data () {
    return {
      download: [],
      emptyInfo: '暂无数据'
    }
  },
  computed: {
  },
  methods: {
    chooseGroupItem () {
      var that = this
      let midea = {
        data: {
        },
        str: 'live/myMaterial'
      }
      this.http.post('api/' + midea.str, midea.data)
      .then(res => {
        let list = res.data
        if (list.length > 0) {
          that.download = list
        }
        console.log(that.download)
      })
    }
  },
  components: {
    empty
  },
  mounted () {
    this.chooseGroupItem()
  },
  updated () {
  }
}
</script>


<style lang="scss">
.download{
  .download-type{
    height: 80px;
    line-height: 80px;
    text-align: center;
    font-size: 26px;
    color: $font-color1;
    li{
      flex: 1;
      &.active{
        background: #fff;
      }
    }
  }
  .download-list{
    background: #fff;
    .download-ul{
      li{
        border-bottom: 1px solid $border-color1;
        padding: 15px 30px;
        a{
          color: $font-color1;
          font-size: 26px;
        }
        .right-info{
          padding-left: 10px;
          .download-stadus{
            font-size: 40px;
            text-align: center;
          }
          .download-num{
            color: $sliver-color;
            font-size: 24px;
            margin-top: 10px;
          }
        }
      }
    }
  }
}
</style>