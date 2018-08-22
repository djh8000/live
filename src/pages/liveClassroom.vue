<template>
  <!-- types 1：老师看到 2 公开看到 -->
  <div class="liveRoom">
    <!-- 加载动画 -->
    <div v-if="!loading" class="loading flex a-c j-c">
      <mt-spinner type="snake" color="#26a2ff"></mt-spinner>
    </div>
    <div id="liveWrap">
      <div id="livePlayer"></div>
    </div>
    <!-- 我的状态 -->
    <div class="my-status flex j-s">
      <mt-button :disabled="disabled" @click="answerlive(0)" type="primary">听懂了！({{count}}s)</mt-button>
      <mt-button :disabled="disabled" @click="answerlive(1)" type="danger">有疑问({{count}}s)</mt-button>
    </div >
    <!-- 我的状态  end -->
    <!-- 头部选项卡 -->
    <nav class="liveNav">
      <mt-navbar v-model="selected">
        <mt-tab-item id="1">提问区</mt-tab-item>
        <mt-tab-item id="2">讨论区</mt-tab-item>
        <mt-tab-item id="3">班级公告</mt-tab-item>
      </mt-navbar>
    </nav>
    <mt-tab-container v-model="selected">
      <!-- 聊天列表部分 -->
      <mt-tab-container-item id="1">
        <div class="class-tit ">
          <span class="LIVEFONT">&#xe756;</span>
          <em>提问区</em>
        </div>
        <ul class="chatList" id="scroll2" ref="chatScrollViewQuse">
          <li v-for="(item,index) in questionList">
            <div class="spack">
              <img v-if="item.avatar" :src="item.avatar" class="avatar">
              <img v-else src="../assets/img/live/members.png" class="avatar">
              <div class="content" :class="{'answer': item.type == 2}">
                <p class="user">
                  <span class="name">
                    <i class="LIVEFONT">&#xe8cd;</i>
                    {{item.nickname}}
                  </span>
                  <span>{{item.time | toTime}}</span>
                </p>
                <p v-html="reface(item.msg)" class="text"></p>
              </div>
            </div>
            <div class="chat-notic" v-if="item.type == 1">
              [你的问题已经提交给助教]
            </div>
          </li>
          <div class="liveStatus">
            <p class="reLine" style="display:none;">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
          </div>
        </ul>
        <div class="inputTool">
          <div class="msgInput">
            <div class="toolBtn" @click.stop="faceShow = !faceShow">
              <img src="../assets/img/live/face.png" slot="icon">
            </div>
            <input maxlength="100" type="text" v-model="questionMsg" @keyup.enter="speak(1)">
            <mt-button class="sendBtn toolBtn" @click="speak(1)">
              发送
            </mt-button>
          </div>
          <div :class="{'face-box1': faceShow}" class="face-box" >
              <face @getface = "getface($event, 'question')"></face>
          </div>
          <div class="chat-tip" v-show="chatTipQuse" @click="chatTipClick(1)">
            <span class="LIVEFONT">&#xe69c;</span>
            <span>新消息</span>
            <!-- 提问 -->
          </div>
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="2">
        <div class="class-tit">
          <span class="LIVEFONT">&#xe618;</span>
          <em>讨论区</em>
        </div>
        <ul class="chatList" id="scroll" ref="chatScrollView">
          <li v-for="(item,index) in chatList">
            <div class="spack">
              <img :src="item.avatar" class="avatar">
              <div class="content">
                <p class="user">
                  <span class="name">
                    {{item.nickname}}
                  </span>
                  <span>{{item.time | toTime}}</span>
                </p>
                <p v-html="reface(item.msg)" class="text"></p>
              </div>
            </div>
          </li>
          <div class="liveStatus">
            <p class="reLine" style="display:none;">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
          </div>
        </ul>
        <!-- 聊天操作部分 -->
        <div class="inputTool">
          <div class="msgInput">
            <div class="toolBtn" @click.stop="faceShow = !faceShow">
              <img src="../assets/img/live/face.png" slot="icon">
            </div>
            <input maxlength="100" type="text" v-model="speckMsg" @keyup.enter="speak(0)">
            <mt-button class="sendBtn toolBtn" @click="speak(0)">
              发送
            </mt-button>
          </div>
          <div :class="{'face-box1': faceShow}" class="face-box" >
              <face @getface = "getface($event, 'talk')"></face>
          </div>
           <div class="chat-tip" v-show="chatTip" @click="chatTipClick(2)">
            <span class="LIVEFONT">&#xe69c;</span>
            <span>新消息</span>
          </div>
          <!-- 讨论 -->
        </div>
      </mt-tab-container-item>
       <mt-tab-container-item id="3">
        <div class="class-tit">
          <span class="LIVEFONT">&#xe679;</span>
          <em>班级公告</em>
        </div>
        <div class="my-class">
          <div class="ifUnderstand flex j-s">
            <!-- 没接入直播中网校心没有资料 -->
            <mt-button v-if="!noDatum" @click="downloadDuc()" type="primary"><i class="LIVEFONT">&#xe683;</i>下载资料</mt-button>
            <!-- 班级作业 网校app方法没写好 -->
            <mt-button v-if="channel != 2" @click="classHomework()" type="danger"><i class="LIVEFONT">&#xe620;</i>班级作业</mt-button>
          </div>
          <div class="class-notice mescroll-touch">
            {{this.pageInfo.annoucement}}
          </div>
        </div>
      </mt-tab-container-item>
    </mt-tab-container>
  </div>
</template>


<script>
import $ from 'jquery'
import face from '../components/face.vue'
import url from '../config/url'
import {homework, eduHomework} from '../config/wbApp'
export default {
  name: 'liveClassroom',
  data () {
    return {
      user_id: this.$cookie.userId(),
      liveId: this.$route.query.liveId || false,
      courseId: this.$route.query.courseId,
      noDatum: this.$route.query.noDatum || false, // 是否从原生app进来
      channel: 0,
      // 除题库以外app进入需要此参数 2：网校
      curriculumId: this.$route.query.curriculumId,
      pageInfo: '',
      player: Object,
      ws: Object,
      timeOut: Object,
      chatTip: false,
      chatTipQuse: false,
      chatList: [],
      questionList: [],
      askTime: 0,
      faceShow: false,
      speckMsg: '',
      popBox: false,
      questionMsg: '',
      loading: true,
      selected: '2',
      disabled: true,
      offsetHeight: '',
      count: 30 // 倒计时
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
      this.$refs.chatScrollViewQuse.addEventListener(
        'scroll',
        this.chatScrollViewDidScrollQuse
      )
    })
    var appPublic = this.$cookie.get('appPublic')
    appPublic = JSON.parse(appPublic)
    if (appPublic) {
      this.channel = Number(appPublic.channel) || 0
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    getRoom: function () {
      var that = this
      let itemPage = {
        data: {
          courseId: this.courseId,
          curriculumId: this.curriculumId
        },
        str: 'Live/privateCurriculum'
      }
      this.http.post('api/' + itemPage.str, itemPage.data)
      .then(res => {
        if (res.code === 1000) {
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
        }
      })
    },
    // 倒计时
    getCode () {
      const TIME_COUNT = 30
      if (!this.timer) {
        this.count = TIME_COUNT
        this.disabled = false
        this.timer = setInterval(() => {
          if (this.count > 0 && this.count <= TIME_COUNT) {
            this.count--
          } else {
            clearInterval(this.timer)
            this.timer = null
            this.count = 30
            this.disabled = true
          }
        }, 1000)
      }
    },
    onLive () {
      this.player = window.polyvObject('#livePlayer').livePlayer({
        'width': '100%',
        'height': '100%',
        'flashvars': {'is_barrage': 'on'},
        'uid': this.pageInfo.uid,
        'vid': this.pageInfo.channel
      })
      window.j2s_setBarrage = function () {
        return true
      }
    },
    unLive () {
      this.player.j2s_pauseVideo()
    },
    wsInit () { // 初始化
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
      $('.reLine').hide()
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
      $('.reLine').show()
      clearTimeout(this.timeOut)
      clearInterval(this.timer)
      this.autoScroll()
      this.autoScrollQuse()
    },
    onMessage (evt) {
      var that2 = this
      var response = JSON.parse(evt.data)
      var data = response.data
      switch (response.prot) {
        // 历史聊天信息
        case 'CHAT_LIST':
          let historyList = data.list
          let chatList = historyList.filter(function (item) {
            return item.type === 0
          })
          this.chatList = chatList
          break
        case 'LIVECOURSE_LIST':
          let historyList2 = data.list
          this.questionList = historyList2
          break
        // 上线成功
        case 'ONLINE_SUCCESS':
          let ndata = {
            prot: 'ENTER_ROOM',
            data: {'room_id': this.roomId, 'type': 'pLive'}
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
          break

        case 'ENTER_ROOM_SUCCESS':
          $('.reLine').hide()
          this.onLive()
          this.heartbeat()
          this.askTime = data.askTimeRate
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
        case 'MY_LIVE_QUESTION':
          // 我自己的问题
          this.questionMsg = ''
          this.questionList.push(data)
          break
        case 'GETQUESTION':
          // 大家都可以看的问题
          this.questionList.push(data)
          break
        case 'SPEAK':
          // 聊天数据
          if (data.type === 0) {
            this.chatList.push(data)
            let liveStr = '[{"msg":"' + data.msg + '","fontSize":"24","fontColor":"0xff0000","fontMode":"roll"}]'
            this.player.j2s_addBarrageMessage(liveStr)
            if (data.user_id === Number(this.user_id)) {
              this.speckMsg = ''
            }
          }
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
          }
          break
        case 'KICK':
          if (data.user_id === Number(this.user_id)) {
            this.$msg('您被踢出房间！')
            this.back()
          }
          break
        case 'SHUTUP_ERROR':
          this.$msg('禁言失败！')
          break
        case 'ASK':
          this.getCode()
          break
        case 'KICK_ERROR':
          this.$msg('踢出失败！')
          break
        case 'LEAVE_ROOM':
          break
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
        'prot': 'HEARTBEAT',
        'data': {}
      }
      this.doSend(ndata)
    },
    speak (type) {
      let ndata = {
        prot: 'SPEAK',
        data: {'msg': this.speckMsg}
      }
      if (type === 1) {
        ndata = {
          prot: 'LIVEQUESTION',
          data: {'msg': this.questionMsg}
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
    //  是否有疑问
    answerlive (ifUnderstand) {
      if (!this.disabled) {
        let ndata = {
          prot: 'ANSWERLIVE',
          data: {
            problem: ifUnderstand
          }
        }
        this.disabled = true
        this.doSend(ndata)
      }
    },
    getface (data, type) {
      if (type === 'question' && this.questionMsg.length < 97) {
        this.questionMsg += data
      } else if (type === 'talk' && this.speckMsg.length < 97) {
        this.speckMsg += data
      }
    },
    reface (str) {
      var emMap = {
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
        '害羞': 21,
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
        '奸笑': 42,
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
        '瓢虫': 63,
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
      str = str.replace(/</g, '&lt;')
      str = str.replace(/>/g, '&gt;')
      str = str.replace(/\n/g, '<br/>')
      str = str.replace(/\[(.*?)\]/g, function (a, b) {
        return '<img src="' + url.faceurl + emMap[b] + '.gif" border="0" />'
      })
      return str
    },
    autoScroll () {
      this.$nextTick(() => {
        const chatScrollView = this.$refs.chatScrollView
        if (chatScrollView) {
          if (this.chatOldScrollHeight === 0) {
            chatScrollView.scrollTop = Math.max(
              0,
              chatScrollView.scrollHeight - chatScrollView.offsetHeight
            )
            this.chatTip = false
          } else {
            const newChatHeight =
              chatScrollView.scrollHeight - this.chatOldScrollHeight
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
    autoScrollQuse () {
      this.$nextTick(() => {
        const chatScrollViewQuse = this.$refs.chatScrollViewQuse
        if (chatScrollViewQuse) {
          if (this.chatOldScrollHeightQuse === 0) {
            chatScrollViewQuse.scrollTop = Math.max(
              0,
              chatScrollViewQuse.scrollHeight - chatScrollViewQuse.offsetHeight
            )
            this.chatTipQuse = false
          } else {
            const newChatHeight =
              chatScrollViewQuse.scrollHeight - this.chatOldScrollHeightQuse
            let behind = parseInt(chatScrollViewQuse.scrollTop) + parseInt(this.offsetHeight)
            let after = parseInt(chatScrollViewQuse.scrollHeight) - parseInt(newChatHeight)
            let difference = after - behind
            if (difference < 6) {
             // {
              // 自动滚动
              chatScrollViewQuse.scrollTop += newChatHeight
              this.chatTipQuse = false
            } else {
              // 三角提示
              this.chatTipQuse = true
            }
          }
        }
      })
    },
    chatTipClick (num) {
      if (num === 2) {
        // 讨论区
        const chatScrollView = this.$refs.chatScrollView
        chatScrollView.scrollTop =
          chatScrollView.scrollHeight - chatScrollView.offsetHeight
        this.chatTip = false
      } else {
        // 提问区
        const chatScrollViewQuse = this.$refs.chatScrollViewQuse
        chatScrollViewQuse.scrollTop =
          chatScrollViewQuse.scrollHeight - chatScrollViewQuse.offsetHeight
        this.chatTipQuse = false
      }
    },
    chatScrollViewDidScroll () {
      this.chatTip = false
    },
    chatScrollViewDidScrollQuse () {
      this.chatTipQuse = false
    },
    // 下载资料
    downloadDuc () {
      this.$router.go(-1)
      // if (this.liveId) {
      //   this.$router.push({path: '/item?targetId=' + this.liveId + '&lessonTab=3'})
      // } else {
      //   this.$router.go(-1)
      // }
    },
    // 班级作业
    classHomework () {
      if (this.channel === 10) {
        homework(this.pageInfo.homework)
      } else {
        // 网校
        eduHomework(this.pageInfo.homework)
      }
    }
  },
  components: {
    face
  },
  filters: {
    toTime (v) {
      var d = new Date(Number(v) * 1000)
      var year = d.getFullYear()
      var month = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : '' + (d.getMonth() + 1)
      var day = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate()
      var hour = d.getHours()
      var minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : '' + d.getMinutes()
      var seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : '' + d.getSeconds()
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
    }
  },
  beforeDestroy () {
    this.ws.close()
    $('#livePlayer').remove()
    this.$refs.chatScrollView.removeEventListener(
      'scroll',
      this.chatScrollViewDidScroll
    )
    this.$refs.chatScrollViewQuse.removeEventListener(
      'scroll',
      this.chatScrollViewDidScrollQuse
    )
    clearTimeout(this.timeOut) // 强制退出定时器
    clearInterval(this.timer) // 是否有疑问定时器
  },
  watch: {
    'chatList': function (val) {
      const chatScrollView = this.$refs.chatScrollView
      this.chatOldScrollHeight = chatScrollView.scrollHeight || 0 // 记录聊天列表位置变更之前的scrollHeight
      this.autoScroll()
    },
    'questionList': function (val) {
      const chatScrollViewQuse = this.$refs.chatScrollViewQuse
      this.chatOldScrollHeightQuse = chatScrollViewQuse.scrollHeight || 0 // 记录聊天列表位置变更之前的scrollHeight
      this.autoScrollQuse()
    },
    'selected': function (val) {
      // 解决提问区初始高度0的问题
      if (val === '1') {
        const chatScrollViewQuse = this.$refs.chatScrollViewQuse
        this.chatOldScrollHeightQuse = chatScrollViewQuse.scrollHeight || 0
        this.autoScrollQuse()
      }
    },
    '$route' (to, from) {
      if (to.name !== 'liveClassroom') {
        this.ws.close()
        $('#livePlayer').remove()
      } else {
        // window.location.reload()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$blue:#1a91d5;
$yellow:#f8800a;
#liveWrap{
  width:100%;
  height:400px;
  background:#666;
}
#livePlayer{
  width:100%;
  height:400px;
  position: relative;
  z-index: 1;
}
.liveNav{
  height:76px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items:center;
  padding:0 20px;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 20px;
  .mint-navbar{
    width:100%;
  }
  .chat{
    line-height: 76px;
    font-size: 28px;
    color:$font-color1;
  }
  .out-shang{
    img{
      height:48px;
      vertical-align: middle;
    }
    .LIVEFONT{
      font-size: 40px;
      vertical-align: middle;
      margin-left: 20px;
    }
  }

}
#scroll, #scroll2{
  margin-top: 12px;
  margin-bottom: 96px;
  height: calc(100vh - 807px);
  overflow-y:scroll;
  background-color: #fff;
  li{
    padding:18px 0;
    .spack{
      display:flex;
    }
    .avatar{
      width:60px;
      height:60px;
      border-radius: 50%;
      margin:0 15px;
    }
    .content{
      width:660px;
      padding-right: 20px;
      .user{
        display: flex;
        justify-content: space-between;
        margin:10px 0 5px;
        .name{
          color:$blue;
          .LIVEFONT{
            font-size: 38px;
            vertical-align: middle;
          }
        }
      }
    }
    .answer{
      .user{
        .name{
          .LIVEFONT{
            color: $yellow;
          }
        }
      }
      .text{
        color: $yellow;
      }
    }
  }
}
.chat-notic{
  color: #f58119;
  text-align: right;
  padding: 0 20px;
}
.inputTool{
  width:750px;
  position: fixed;
  bottom:0;
  z-index:9999;
  .msgInput{
    width:100%;
    height:96px;
    padding:0 10px;
    background-color: #fff;
    display:flex;
    align-items:center;
    border-top:1px solid $border-color1;
    .toolBtn{
      margin:0 10px;
      img{
        display: inline-block;
        height:48px;
        width:auto;
      }
    }
    .mint-button--default{
      box-shadow: none;
    }
    input{
      width:550px;
      height:58px;
      background-color: #eee;
      border: 1px solid $border-color1;
      border-radius: 10px;
      margin:0 10px;
      text-indent: 10px;
    }
    .sendBtn{
      height: auto;
      background-color: $master-color;
      color:#fff;
      font-size: 20px;
      width:80px;
      padding:12px 0;
      margin:0 0 0 5px;
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
.questionBox{
  width:650px;
  padding:10px 20px 20px;
  .boxTop{
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    span{
      color: $font-color1;
      font-size: 28px;
      font-weight: bold;
    }
    img{
      width:38px;
      vertical-align: middle;
      margin:0 5px;
    }
    .LIVEFONT{
      padding:5px 0 5px 5px;
      font-size: 30px;
      color:$font-color2;
      cursor: pointer;
    }
  }
  textarea{
    box-sizing:border-box;
    width:100%;
    height:260px;
    padding:5px;
    line-height: 1.4;
    border: 1px solid #999;
    border-radius: 10px;
    text-indent: 20px;
    color:$font-color2;
  }
  .mint-button{
    margin-top: 10px;
    padding: 0 20px;
    font-size: 22px;
  }
}
.face-box{
  height: 0;
  overflow: hidden;
  transition: all 0.2s;
}
.face-box1{
  height: 372px;
}
.liveHead{
  color: #333;
  height: 80px;
  width: 100%;
  text-align: center;
  line-height: 80px;
  span{
    font-size: 28px;
  }
  .back{
    position: absolute;
    top: 15px;
    span{
      color: #666;
      font-size: 28px;
      text-shadow: none;
    }
  }
}
// 我的状态
.my-status{
  padding: 20px 40px 10px;
  background: #fff;
  button{
    width: 235px;
    border-radius: 10px;
    font-size: 24px;
    color: #fff;
    height: 70px;
  }
}
// 我的状态   end
// 聊天区域
.class-tit{
  line-height: 50px;
  background: #666666;
  color: #fff;
  padding: 0 30px;
  .LIVEFONT{
    font-size: 28px;
  }
}
.mint-navbar .mint-tab-item.is-selected{
  border-bottom: none;
}
// 聊天区域   end
// 班级公告
.my-class{
  padding: 40px;
  button{
    width: 235px;
    border-radius: 10px;
    font-size: 26px;
    color: #fff;
    height: 70px;
    i{
      font-size: 28px;
      margin-right: 10px;
    }
    &.mint-button--primary{
      background: #e7873a;
    }
    &.mint-button--danger{
      background: none;
      border: 2px solid #666;
      color: #666;
    }
  }
}
.mint-tab-container{
  background: #fff;
}
.ifUnderstand {
  padding-bottom: 40px;
}
.class-notice{
  border-top: 4px solid #e5e5e5;
  padding: 20px 0;
  font-size: 26px;
  overflow-y: auto;
  height: calc(100vh - 889px);
}
</style>