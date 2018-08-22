<template>
  <div class="liveRoom">
    <!-- 加载动画 -->
    <div v-if="!loading" class="loading flex a-c j-c">
      <mt-spinner type="snake" color="#26a2ff"></mt-spinner>
    </div>
    <div id="liveWrap">
      <div id="livePlayer"></div>
    </div>
    <!-- 头部选项卡 -->
    <nav class="liveNav">
      <mt-navbar v-model="selected">
        <mt-tab-item id="1">聊天栏</mt-tab-item>
        <mt-tab-item id="2" v-if="isMaster == 2">用户列表</mt-tab-item>
      </mt-navbar>
      <div class="out-shang" v-if="iosBuy != 0">
        <img src="../assets/img/live/shang.png" @click="myRewardShow = !myRewardShow">
        <i class="LIVEFONT" onclick="location.reload()">&#xe65e;</i>
      </div>
    </nav>
    <mt-tab-container v-model="selected">
      <!-- 聊天列表部分 -->
      <mt-tab-container-item id="1">
        <ul class="chatList" id="scroll" ref="chatScrollView" >
          <li v-for="(item,index) in chatList">
            <div class="liveStatus" v-if="item.type == 4">
              <p v-html="reface(item.msg)"></p>
            </div>
            <div class="spack" v-else>
              <img :src="item.avatar" class="avatar">
              <div class="content" :class="{'answer': item.type == 2}">
                <p class="user">
                  <span class="name">
                    <i class="LIVEFONT" v-if="item.type == 1">&#xe8cd;</i>
                    <i class="LIVEFONT" v-if="item.type == 2">&#xe889;</i>
                    {{item.nickname}}
                  </span>
                  <span>{{item.time | toTime}}</span>
                </p>
                <p v-html="reface('@'+item.q_nickname+': '+item.question)" class="text" v-if="item.type == 2"></p>
                <p v-html="reface(item.msg)" class="text"></p>
              </div>
            </div>
          </li>
          <div class="liveStatus">
            <p id="reLine" style="display:none;">已断开连接,
              <a href="javascript:void(0)" onclick="location.reload()">重新连接</a>
            </p>
          </div>
        </ul>
        <!-- 聊天操作部分 -->
        <div class="inputTool">
          <div class="msgInput">
            <div class="toolBtn" @click="popBox = !popBox">
              <img src="../assets/img/live/question.png" slot="icon">
            </div>
            <div class="toolBtn" @click.stop="faceShow = !faceShow">
              <img src="../assets/img/live/face.png" slot="icon">
            </div>
            <input maxlength="100" type="text" v-model="speckMsg" @keyup.enter="speak(0)">
            <mt-button class="sendBtn toolBtn" @click="speak(0)">
              发送
            </mt-button>
          </div>
          <div :class="{'face-box1': faceShow}" class="face-box">
            <face @getface="getface"></face>
          </div>
          <div class="chat-tip" v-show="chatTip" @click="chatTipClick">
            <span class="LIVEFONT">&#xe69c;</span>
            <span>新消息</span>
          </div>
        </div>
      </mt-tab-container-item>
      <!-- 人数列表部分 -->
      <mt-tab-container-item id="2">
        <ul class="userList">
          <p class="peopleCount">
            <span>{{userList.length}}人</span>、
          </p>
          <li v-for="(item,index) in userList">
            <div class="user">
              <img :src="item.avatar">
              <span>{{item.nickname}}</span>
              <span v-if="item.hasCourse == 1">(学员)</span>
            </div>
            <div class="btns" v-if="user_id != item.user_id">
              <mt-button type="danger" class="shutBtn" @click="shutup(item.user_id)">
                禁言
              </mt-button>
              <mt-button type="danger" class="shutBtn" @click="kick(item.user_id)">
                踢出
              </mt-button>
            </div>
          </li>
        </ul>
      </mt-tab-container-item>
    </mt-tab-container>
    <!-- 问题弹窗部分 -->
    <mt-popup ref="chatRewardAlert2" v-model="popBox">
      <div class="questionBox clearfix">
        <div class="boxTop">
          <span>
            <img src="../assets/img/live/question.png"> 我的提问
          </span>
          <i class="LIVEFONT" @click="popBox = false">&#xe632;</i>
        </div>
        <textarea maxlength="100" placeholder="请输入您的问题" v-model="questionMsg"></textarea>
        <mt-button class="questionBtn fr" type="primary" slot="right" @click="speak(1)">
          提问
        </mt-button>
      </div>
    </mt-popup>
    <!-- 弹框 -->
    <reward :rewardShow="myRewardShow" v-on:childRewardShow="rewardTK($event)"></reward>
  </div>
</template>


<script>
import $ from 'jquery'
import face from '../components/face.vue'
import reward from '../components/reward.vue'
import url from '../config/url'
export default {
  name: 'liveRoom',
  data () {
    return {
      user_id: this.$cookie.userId(),
      roomId: '',
      player: Object,
      ws: Object,
      timeOut: Object,
      chatTip: false,
      chatList: [],
      userList: [],
      askTime: 0,
      isMaster: 1,
      faceShow: false,
      speckMsg: '',
      popBox: false,
      questionMsg: '',
      loading: true,
      selected: '1',
      myRewardShow: false,
      offsetHeight: 0
    }
  },
  created () {
    this.getRoom()
    var that = this
    $(document).click(function () {
      that.faceShow = false
    })
  },
  mounted () {
    const chatScrollView = this.$refs.chatScrollView
    let offsetHeight = chatScrollView.offsetHeight
    this.offsetHeight = offsetHeight
    this.$nextTick(() => {
      this.$refs.chatScrollView.addEventListener(
        'scroll',
        this.chatScrollViewDidScroll
      )
    })
  },
  methods: {
    // 提问框
    back () {
      this.$router.go(-1)
      // let weixinPay = localStorage.getItem('routerNum')
      // // this.$router.go(-1)
      // if (weixinPay) {
      //   // 回退两格
      //   localStorage.removeItem('routerNum')
      //   this.$router.go(-2)
      // } else {
      //   localStorage.removeItem('routerNum')
      //   this.$router.go(-1)
      // }
    },
    getRoom: function () {
      var that = this
      let itemPage = {
        data: {
          liveId: this.$route.params.id
        },
        str: 'live/enterRoom'
      }
      this.http.post('api/' + itemPage.str, itemPage.data)
      .then(res => {
        if (res.data.status === 2) {
          // 直播已经结束
          this.$msg('直播已结束')
          setTimeout(function () {
            that.back()
          }, 800)
        } else {
          this.roomId = res.data.room_id
          this.pageInfo = res.data
          this.wsInit()
        }
      })
    },
    onLive (uid, vid) {
      this.player = window.polyvObject('#livePlayer').livePlayer({
        width: '100%',
        height: '100%',
        flashvars: { is_barrage: 'on' },
        uid: this.pageInfo.uid,
        vid: this.pageInfo.channel
      })
      window.j2s_setBarrage = function () {
        return true
      }
    },
    unLive () {
      this.player.j2s_pauseVideo()
    },
    wsInit () {
      // 初始化
      this.ws = new window.WebSocket(url.ws)
      this.ws.onopen = evt => {
        this.onOpen(evt)
      }
      this.ws.onclose = evt => {
        this.onClose(evt)
      }
      this.ws.onmessage = evt => {
        this.onMessage(evt)
      }
      this.ws.onerror = evt => {
        this.onError(evt)
      }
      $('#reLine').hide()
    },
    onOpen (evt) {
      let ndata = {
        prot: 'ONLINE',
        data: this.http.prodata({}, 'live')
      }
      this.doSend(ndata)
    },
    onClose (evt) {
      this.unLive()
      $('#reLine').show()
      clearInterval(this.timeOut)
      this.autoScroll()
    },
    onMessage (evt) {
      var that2 = this
      var response = JSON.parse(evt.data)
      var data = response.data
      switch (response.prot) {
        // 历史聊天信息
        case 'CHAT_LIST':
          this.chatList = data.list
          break

        // 房间用户列表
        case 'ROOM_USER':
          this.userList = data.list
          break

        // 上线成功
        case 'ONLINE_SUCCESS':
          let ndata = {
            prot: 'ENTER_ROOM',
            data: { room_id: this.roomId, type: 'live' }
          }
          this.doSend(ndata)
          console.log('您已上线！')
          this.loading = true
          break

        case 'OFFLINE':
          this.$msg('您已下线！')
          break

        case 'ONLINE_FAIL':
          if (data.reason === 'TOKEN_ERROR') {
            this.$msg('登录信息失效，请重新登录！')
            this.$cookie.del('ssotoken')
            this.$router.push('/')
          }
          break

        case 'ENTER_ROOM':
          console.log(data.nickname + '进入直播间！')
          this.userList.push(data)
          break

        case 'ENTER_ROOM_SUCCESS':
          $('#reLine').hide()
          this.onLive()
          this.heartbeat()
          this.askTime = data.askTimeRate
          this.isMaster = data.roles
          this.$msg('已进入直播间！')
          break

        case 'ENTER_ROOM_ERROR':
          if (data.reason === 'KICKED') {
            this.$msg('您已被踢出直播间，进入直播间失败！')
            this.back()
          } else if (data.reason === 'USER_HAS_ENTER_ROOM') {
            this.$msg('不可重复进入直播间，进入直播间失败！')
            setTimeout(function () {
              that2.back()
            }, 1000)
          } else {
            this.$msg('进入直播间失败！')
          }
          break

        case 'SPEAK':
          // 聊天数据
          this.chatList.push(data)
          if (data.user_id === Number(this.user_id)) {
            if (data.type === 0) {
              this.speckMsg = ''
            } else if (data.type === 1) {
              this.questionMsg = ''
            }
          }
          let liveStr =
            '[{"msg":"' +
            data.msg +
            '","fontSize":"24","fontColor":"0xff0000","fontMode":"roll"}]'
          this.player.j2s_addBarrageMessage(liveStr)
          break

        case 'SPEAK_ERROR':
          if (data.reason === 'SHUTUPED') {
            this.$msg('您已被禁言2分钟，发言失败！')
          } else if (data.reason === 'SAY_TOO_FAST') {
            this.$msg('您的发言太快')
          } else if (data.reason === 'ASK_TOO_FAST') {
            this.$msg('您的提问太快,请于' + this.askTime + '秒后再次提问！')
          } else {
            this.$msg('发言失败！')
          }
          break

        case 'SHUTUP':
          if (data.user_id === Number(this.user_id)) {
            this.$msg('已被禁言两分钟')
          } else if (this.isMaster === 2) {
            this.$msg('用户【' + data.nickname + '】已被禁言两分钟!')
          }
          break
        case 'KICK':
          if (data.user_id === Number(this.user_id)) {
            this.$msg('您被踢出房间！')
            this.back()
          } else if (this.isMaster === 2) {
            let leaveIndex = this.userList.findIndex(item => {
              return item.user_id === data.user_id
            })
            this.userList.splice(leaveIndex, 1)
          }
          break
        case 'SHUTUP_ERROR':
          this.$msg('禁言失败！')
          break
        case 'KICK_ERROR':
          this.$msg('踢出失败！')
          break
        case 'LEAVE_ROOM':
          let leaveIndex = this.userList.findIndex(item => {
            return item.user_id === data.user_id
          })
          this.userList.splice(leaveIndex, 1)
          break
        // case 'REWARD':
        //   // 打赏
        //   this.chatList.push({
        //     type: 'reward',
        //     msg: '[玫瑰]' + data.nickname + ' 打赏主播' + data.gift + '元！'
        //   })
        //   let rewStr =
        //     '[{"msg":"' +
        //     data.nickname +
        //     ' 打赏主播' +
        //     data.gift +
        //     '元！","fontSize":"24","fontColor":"0xff0000","fontMode":"roll"}]'
        //   this.player.j2s_addBarrageMessage(rewStr)
        //   break
      }
    },
    onError (evt) {
      console.log(evt)
    },
    doSend (message) {
      let jsona = JSON.stringify(message)
      this.ws.send(jsona)
    },
    heartbeat () {
      let _this = this
      this.timeOut = setTimeout(() => {
        _this.heartbeat()
      }, 60000)
      let ndata = {
        prot: 'HEARTBEAT',
        data: {}
      }
      this.doSend(ndata)
    },
    speak (type) {
      let ndata = {
        prot: 'SPEAK',
        data: { msg: this.speckMsg }
      }
      if (type === 1) {
        ndata = {
          prot: 'QUESTION',
          data: { msg: this.questionMsg }
        }
        if (this.questionMsg === '') {
          this.$msg('内容不能为空！')
          return false
        }
        this.doSend(ndata)
        this.popBox = false
      } else {
        if (this.speckMsg === '') {
          this.$msg('内容不能为空！')
          return false
        }
        this.doSend(ndata)
      }
    },
    // 禁言
    shutup (userId) {
      let ndata = {
        prot: 'SHUTUP',
        data: {
          room_id: this.roomId,
          target_id: userId,
          type: 'live'
        }
      }
      this.doSend(ndata)
    },
    kick (userId) {
      let ndata = {
        prot: 'KICK',
        data: {
          room_id: this.roomId,
          target_id: userId,
          type: 'live'
        }
      }
      this.doSend(ndata)
    },
    getface (data) {
      this.speckMsg += data
    },
    reface (str) {
      var emMap = {
        呲牙: 1,
        调皮: 2,
        汗: 3,
        偷笑: 4,
        拜拜: 5,
        打你: 6,
        擦汗: 7,
        猪头: 8,
        玫瑰: 9,
        流泪: 10,
        快哭了: 11,
        嘘: 12,
        酷: 13,
        抓狂: 14,
        委屈: 15,
        屎: 16,
        炸弹: 17,
        菜刀: 18,
        可爱: 19,
        色: 20,
        害羞: 21,
        得意: 22,
        吐: 23,
        微笑: 24,
        发火: 25,
        尴尬: 26,
        惊恐: 27,
        冷汗: 28,
        心: 29,
        嘴唇: 30,
        白眼: 31,
        傲慢: 32,
        难过: 33,
        惊讶: 34,
        疑问: 35,
        睡: 36,
        亲亲: 37,
        憨笑: 38,
        爱情: 39,
        衰: 40,
        撇嘴: 41,
        奸笑: 42,
        奋斗: 43,
        发呆: 44,
        右哼哼: 45,
        抱抱: 46,
        坏笑: 47,
        企鹅亲: 48,
        鄙视: 49,
        晕: 50,
        大兵: 51,
        拜托: 52,
        强: 53,
        垃圾: 54,
        握手: 55,
        胜利: 56,
        抱拳: 57,
        枯萎: 58,
        米饭: 59,
        蛋糕: 60,
        西瓜: 61,
        啤酒: 62,
        瓢虫: 63,
        勾引: 64,
        哦了: 65,
        手势: 66,
        咖啡: 67,
        月亮: 68,
        匕首: 69,
        发抖: 70,
        菜: 71,
        拳头: 72,
        鼓掌: 73,
        抠鼻: 74
      }
      str = str.replace(/</g, '&lt;')
      str = str.replace(/>/g, '&gt;')
      str = str.replace(/\n/g, '<br/>')
      str = str.replace(/\[(.*?)\]/g, function (a, b) {
        return '<img src="' + url.faceurl + emMap[b] + '.gif" border="0" />'
      })
      return str
    },
    // 弹框
    rewardTK (status) {
      this.myRewardShow = status
    },
    autoScroll () {
      this.$nextTick(() => {
        const chatScrollView = this.$refs.chatScrollView
        if (chatScrollView) {
          if (this.chatOldScrollHeight === 0) {
            chatScrollView.scrollTop = Math.max(
              0,
              chatScrollView.scrollHeight - this.offsetHeight
            )
            this.chatTip = false
          } else {
            const newChatHeight =
              chatScrollView.scrollHeight - this.chatOldScrollHeight // 新所有高度 -和旧所有高度 = 差
            let behind = parseInt(chatScrollView.scrollTop) + parseInt(this.offsetHeight)
            let after = parseInt(chatScrollView.scrollHeight) - parseInt(newChatHeight)
            let difference = after - behind
            if (difference < 6) {
              // 自动滚动
              chatScrollView.scrollTop += newChatHeight
              this.chatTip = false
            } else {
              // 三角提示
              this.chatTip = true
            }
          }
        }
      })
    },
    chatTipClick () {
      const chatScrollView = this.$refs.chatScrollView
      chatScrollView.scrollTop =
        chatScrollView.scrollHeight - this.offsetHeight
      this.chatTip = false
    },
    chatScrollViewDidScroll () {
      this.chatTip = false
    }
  },
  components: {
    face,
    reward
  },
  filters: {
    toTime (v) {
      var d = new Date(Number(v) * 1000)
      var year = d.getFullYear()
      var month =
        d.getMonth() + 1 < 10
          ? '0' + (d.getMonth() + 1)
          : '' + (d.getMonth() + 1)
      var day = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate()
      var hour = d.getHours()
      var minutes =
        d.getMinutes() < 10 ? '0' + d.getMinutes() : '' + d.getMinutes()
      var seconds =
        d.getSeconds() < 10 ? '0' + d.getSeconds() : '' + d.getSeconds()
      return (
        year +
        '-' +
        month +
        '-' +
        day +
        ' ' +
        hour +
        ':' +
        minutes +
        ':' +
        seconds
      )
    }
  },
  beforeDestroy () {
    this.ws.close()
    $('#livePlayer').remove()
    this.$refs.chatScrollView.removeEventListener(
      'scroll',
      this.chatScrollViewDidScroll
    )
  },
  watch: {
    chatList: function (val) {
      const chatScrollView = this.$refs.chatScrollView
      this.chatOldScrollHeight = chatScrollView.scrollHeight || 0 // 记录聊天列表位置变更之前的scrollHeight
      this.autoScroll()
    },
    $route (to, from) {
      if (to.name !== 'liveRoom') {
        this.ws.close()
        $('#livePlayer').remove()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$blue: #1a91d5;
$yellow: #f8800a;
.liveRoom{
  overflow: hidden;
  height: 100vh;
}
#liveWrap {
  width: 100%;
  height: 400px;
  background: #666;
  position: relative;
  z-index: 2;
}
#livePlayer {
  width: 100%;
  height: 400px;
  position: relative;
  z-index: 1;
}
.liveNav {
  height: 76px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  .mint-navbar {
    width: 280px;
  }
  .chat {
    line-height: 76px;
    font-size: 28px;
    color: $font-color1;
  }
  .out-shang {
    img {
      height: 48px;
      vertical-align: middle;
    }
    .LIVEFONT {
      font-size: 40px;
      vertical-align: middle;
      margin-left: 20px;
    }
  }
}
#scroll {
  margin-top: 12px;
  margin-bottom: 96px;
  height: calc(100vh - 584px);
  overflow-y: scroll;
  background-color: #fff;
  li {
    padding: 18px 0;
    .spack {
      display: flex;
    }
    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin: 0 15px;
    }
    .content {
      width: 660px;
      padding-right: 20px;
      .user {
        display: flex;
        justify-content: space-between;
        margin: 10px 0 5px;
        .name {
          color: $blue;
          .LIVEFONT {
            font-size: 38px;
            vertical-align: middle;
          }
        }
      }
    }
    .answer {
      .user {
        .name {
          .LIVEFONT {
            color: $yellow;
          }
        }
      }
      .text {
        color: $yellow;
      }
    }
  }
}
.userList {
  margin-top: 12px;
  height: calc(100vh - 490px);
  overflow-y: scroll;
  background-color: #fff;
  .peopleCount {
    text-align: right;
    padding-right: 20px;
    margin-top: 10px;
  }
  li {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    margin: 20px 0;
    .user {
      img {
        display: inline-block;
        height: 60px;
        width: 60px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 10px;
      }
    }
    .btns {
      display: flex;
      align-items: center;
      .mint-button {
        margin-left: 15px;
      }
    }
  }
}
.inputTool {
  width: 750px;
  position: fixed;
  bottom: 0;
  z-index: 9999;
  .msgInput {
    width: 100%;
    height: 96px;
    padding: 0 10px;
    background-color: #fff;
    display: flex;
    align-items: center;
    border-top: 1px solid $border-color1;
    .toolBtn {
      margin: 0 10px;
      img {
        display: inline-block;
        height: 48px;
        width: auto;
      }
    }
    .mint-button--default {
      box-shadow: none;
    }
    input {
      width: 480px;
      height: 58px;
      background-color: #eee;
      border: 1px solid $border-color1;
      border-radius: 10px;
      margin: 0 10px;
      text-indent: 10px;
    }
    .sendBtn {
      height: auto;
      background-color: $master-color;
      color: #fff;
      font-size: 20px;
      width: 80px;
      padding: 12px 0;
      margin: 0 0 0 5px;
    }
  }
  .chat-tip {
    position: absolute;
    top: -45px;
    left: 50%;
    margin-left: -70px;
    width: 140px;
    height: 40px;
    line-height: 40px;
    background-color: #959595;
    border-radius: 25px;
    color: #fefefe;
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    span {
      line-height: 40px;
      font-size: 20px;
      &:nth-child(2) {
        margin-left: 5px;
      }
    }
  }
}
.mint-popup {
  border-radius: 10px;
  border: 3px solid $blue;
  z-index: 99999999999999 !important;
  // transform: translate3d(-50%, 0, 0);
  // -webkit-transform: translate3d(-50%, 0, 0);
  // max-height: calc(100vh - 480px);
  // &.ansFocused {
  //   top: 20px !important;
  // }
}
.v-modal {
  z-index: 99999999999998 !important;
}
.questionBox {
  width: 650px;
  padding: 10px 20px 20px;
  .boxTop {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    span {
      color: $font-color1;
      font-size: 28px;
      font-weight: bold;
    }
    img {
      width: 38px;
      vertical-align: middle;
      margin: 0 5px;
    }
    .LIVEFONT {
      padding: 5px 0 5px 5px;
      font-size: 30px;
      color: $font-color2;
      cursor: pointer;
    }
  }
  textarea {
    box-sizing: border-box;
    width: 100%;
    height: 260px;
    padding: 5px;
    line-height: 1.4;
    border: 1px solid #999;
    border-radius: 10px;
    text-indent: 20px;
    color: $font-color2;
  }
  .mint-button {
    margin-top: 10px;
    padding: 0 20px;
    font-size: 22px;
  }
}
.face-box {
  height: 0;
  overflow: hidden;
  transition: all 0.2s;
}
.face-box.face-box1 {
  height: 372px;
}
// 头部
// .liveHead {
//   color: #333;
//   height: 80px;
//   width: 100%;
//   text-align: center;
//   // top: 0;
//   // left: 0;
//   line-height: 80px;
//   span {
//     font-size: 28px;
//   }
//   .back {
//     position: absolute;
//     top: 15px;
//     span {
//       color: #666;
//       font-size: 28px;
//       text-shadow: none;
//     }
//   }
// }
</style>