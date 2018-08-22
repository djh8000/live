<template>
  <!-- types 1：老师看到 2 公开看到 -->
  <div class="liveClassroom">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{roomInfo.title}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="live-main">
      <div class="livePlayer">
        <div id="player"></div>
      </div>
      <div class="liveChat">
        <el-tabs type="border-card" class="chatContent">
          <el-tab-pane label="提问区" class="chat-pane">
            <ul id="scroll2" ref="chatScrollViewQuse">
              <li v-for="(item,index) in questionList">
                <div class="liveStatus" v-if="item.type == 4">
                  <p v-html="reface(item.msg)"></p>
                </div>
                <div class="speak" v-else>
                  <img v-if="item.avatar" :src="item.avatar" class="avatar">
                  <img v-else src="../assets/img/members.png" class="avatar">
                  <div class="content" :class="{'answer': item.type == 2}">
                    <p class="user">
                      <span class="name">
                        <i class="LIVEFONT">&#xe8cd;</i>
                        {{item.nickname}}
                      </span>
                      <span>{{item.time | toTime}}</span>
                    </p>
                    <p v-html="reface('@'+item.q_nickname+': '+item.question)" class="text" v-if="item.type == 2"></p>
                    <p v-html="reface('答: ' + item.msg)" class="text" v-if="item.type == 2"></p>
                    <p v-html="reface(item.msg)" class="text" v-else></p>
                  </div>
                </div>
                <div class="chat-notic" v-if="item.type == 1">
                  [你的问题已经提交给助教]
                </div>
              </li>
              <div class="liveStatus" v-show="!onLine">
                <p id="reLine">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
              </div>
            </ul>
            <div class="chat-tip" v-show="chatTipQuse" @click="chatTipClick(1)">
              <span class="LIVEFONT">&#xe69c;</span>
              <span>新消息</span>
            </div>
            <div class="chatTools">
              <div class="chatInput">
                <div class="out-inpput flex a-c">
                  <span class='isFace' title="表情">
                  <el-popover
                    ref="popFace"
                    placement="top"
                    width="312"
                    trigger="click">
                    <elFace @getface="getface($event, 'question')"></elFace>
                  </el-popover>
                  <img src="../assets/img/face.png" v-popover:popFace>
                </span>
                <el-input v-model="questionMsg" :maxlength="100" placeholder="请输入内容" class="speakInput" @keyup.enter.native="speak(1)"></el-input>
                <el-button class="speakBtn" @click="speak(1)">发送问题</el-button>
                </div>
                <p>(最多只能输入 {{100 - questionMsg.length}} 字)</p>
              </div>
            </div>
            <div class="have-question">
              <el-button :disabled="disabled" @click="answerlive(0)" type="primary">听懂了！({{count}}s)</el-button>
              <el-button :disabled="disabled" @click="answerlive(1)" type="danger">有疑问({{count}}s)</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="班级公告">
          <div class="my-class">
            <div class="ifUnderstand flex j-s">
              <el-button @click="download" class="download" type="primary"><i class="LIVEFONT">&#xe683;</i>下载资料</el-button>
              <el-button @click="classHomework" class="homework" type="danger"><i class="LIVEFONT">&#xe620;</i>班级作业</el-button>
            </div>
            <div class="class-notice">
              {{roomInfo.annoucement}}
            </div>
          </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <!-- 讨论区 -->
    <div class="discuss-content flex j-s">
      <div class="discuss-box">
        <div class="classRoom-tit">
          <span class="LIVEFONT">&#xe601;</span>
          讨论区
        </div>
        <div class="discuss-ul">
          <ul id="scroll" ref="chatScrollView">
            <li v-for="(item,index) in chatList">
              <div class="speak">
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
            <div class="liveStatus" v-show="!onLine">
              <p id="reLine">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
            </div>
          </ul>
          <div class="chat-tip" v-show="chatTip" @click="chatTipClick(2)">
            <span class="LIVEFONT">&#xe69c;</span>
            <span>新消息</span>
          </div>
          <div class="chatTools">
            <div class="chatInput">
              <div class="out-inpput flex a-c">
                  <span class='isFace' title="表情">
                  <el-popover
                    ref="popFace"
                    placement="top"
                    width="312"
                    trigger="click">
                    <elFace @getface="getface($event, 'talk')"></elFace>
                  </el-popover>
                  <img src="../assets/img/face.png" v-popover:popFace>
                </span>
                <el-input v-model="speakMsg" :maxlength="100" placeholder="请输入内容" class="speakInput" @keyup.enter.native="speak(0)"></el-input>
                <el-button class="speakBtn" @click="speak(0)">发送</el-button>
              </div>
              <p>(最多只能输入 {{100 - speakMsg.length}} 字)</p>
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-banner">
        <div v-swiper:mySwiper="swiperOptionBanner" ref="bannerSwiper">
          <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="(item, index) in roomInfo.bannerList" :key="index">
              <a class="banner-link" :href="item.link" target="_blank">
                <img onerror="this.src='http://cdn.zejicert.cn/public/zejicert/assets/img/course/default.jpg'" v-if="item.src" :src="item.src">
              </a>
            </div>
          </div>
          <div class="swiper-pagination"  slot="pagination"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import elFace from '~/components/face.vue'
import {mapState} from 'vuex'
export default {
  name: 'liveClassroom',
  data () {
    return {
      roomInfo: '',
      onLine: true,
      roomId: '',
      user_id: this.$store.state.user_id,
      courseId: this.$route.query.courseId,
      curriculumId: this.$route.query.curriculumId,
      liveId: this.$route.query.liveId || false,
      player: Object,
      ws: Object,
      timeOut: Object,
      chatTip: false,
      chatTipQuse: false,
      chatList: [],
      questionList: [],
      questionMsg: '',
      speakMsg: '',
      askTime: 0,
      isMaster: 1,
      btn: {
        type: 1,
        msg: '发送'
      },
      disabled: true,
      count: 30,
      swiperOptionBanner: {
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        autoHeight: true,
        pagination: {
          clickable: true,
          el: '.swiper-pagination'
        }
      }
    }
  },
  asyncData ({$axios, query}) {
    return Promise.all([
      $axios.$post('api/Live/privateCurriculum', {courseId: query.courseId, curriculumId: query.curriculumId})
    ]).then(([data]) => {
      return {
        roomInfo: data,
        roomId: data.room_id
      }
    })
  },
  components: {
    elFace
  },
  computed: {
    ...mapState([
      'url'
    ])
  },
  mounted () {
    var that = this
    if (this.roomInfo.code) {
      this.$msg(this.roomInfo.msg || '进入失败')
    }
    if (this.roomInfo.status === 2) {
      this.$msg('直播已结束')
      setTimeout(function () {
        that.back()
      }, 800)
    } else {
      this.wsInit()
    }
    this.$nextTick(() => {
      this.$refs.chatScrollView.addEventListener('scroll', this.chatScrollViewDidScroll)
      this.$refs.chatScrollViewQuse.addEventListener(
        'scroll',
        this.chatScrollViewDidScrollQuse
      )
    })
  },
  beforeDestroy () {
    this.$refs.chatScrollView.removeEventListener('scroll', this.chatScrollViewDidScroll)
    this.$refs.chatScrollViewQuse.removeEventListener(
      'scroll',
      this.chatScrollViewDidScrollQuse
    )
    this.ws.close()
    this.unLive()
    clearTimeout(this.timeOut)
    clearInterval(this.timer)
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    onLive () {
      this.player = window.polyvObject('#player').livePlayer({
        'width': '100%',
        'height': '100%',
        'flashvars': {
          'is_barrage': 'on',
          'banWebBtn': 'on'
        },
        'uid': this.roomInfo.uid,
        'vid': this.roomInfo.channel
      })
    },
    unLive () {
      this.player = window.polyvObject('#player').livePlayer({
        'width': '100%',
        'height': '100%',
        'uid': '000000',
        'vid': '000000'
      })
    },
    wsInit () { // 初始化
      this.ws = new window.WebSocket(this.$store.state.url.ws)
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
    },
    onOpen (evt) {
      let ndata = {
        prot: 'ONLINE',
        data: this.$sign.prodata({}, 'live')
      }
      this.doSend(ndata)
    },
    onClose (evt) {
      this.onLine = false
      this.unLive()
      clearTimeout(this.timeOut)
      clearInterval(this.timer)
      this.autoScrollCommon()
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
          this.onLine = true
          break

        case 'OFFLINE':
          this.$msg('您已下线！')
          break

        case 'ONLINE_FAIL':
          if (data.reason === 'TOKEN_ERROR') {
            this.$msg({message: '登录信息失效，请重新登录！', type: 'warning'})
          }
          break

        case 'ENTER_ROOM':
          console.log(data.nickname + '进入直播间！')
          break

        case 'ENTER_ROOM_SUCCESS':
          this.onLive()
          this.heartbeat()
          this.askTime = data.askTimeRate
          this.isMaster = data.roles
          this.$msg({message: '已进入直播间！', type: 'success'})
          break

        case 'ENTER_ROOM_ERROR':
          if (data.reason === 'KICKED') {
            this.$msg({message: '您已被踢出直播间，进入直播间失败！', type: 'warning'})
            this.back()
          } else if (data.reason === 'USER_HAS_ENTER_ROOM') {
            this.$msg({message: '不可重复进入直播间，进入直播间失败！', type: 'warning'})
            setTimeout(function () {
              that2.back()
            }, 1000)
          } else {
            this.$msg.error('进入直播间失败！')
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
            let liveStr = '[{"msg":"' + data.msg + '","fontSize":"24","fontColor":"0xffffff","fontMode":"roll"}]'
            this.player.j2s_addBarrageMessage(liveStr)
            if (Number(data.user_id) === Number(this.user_id)) {
              this.speakMsg = ''
            }
          }
          break

        case 'SPEAK_ERROR':
          if (data.reason === 'SHUTUPED') {
            this.$msg({message: '您已被禁言2分钟，发言失败！', type: 'warning'})
          } else if (data.reason === 'SAY_TOO_FAST') {
            this.$msg({message: '您的发言太快', type: 'warning'})
          } else if (data.reason === 'ASK_TOO_FAST') {
            this.$msg({message: '您的提问太快,请于' + this.askTime + '秒后再次提问！', type: 'warning'})
          } else {
            this.$msg.error('发言失败！')
          }
          break

        case 'SHUTUP':
          if (data.user_id === Number(this.user_id)) {
            this.$msg({message: '已被禁言两分钟', type: 'warning'})
          } else if (this.isMaster === 2) {
            this.$msg({message: '用户【' + data.nickname + '】已被禁言两分钟!', type: 'success'})
          }
          break
        case 'KICK':
          if (data.user_id === Number(this.user_id)) {
            this.$msg({message: '您被踢出房间！', type: 'warning'})
            this.back()
          }
          break
        case 'SHUTUP_ERROR':
          this.$msg.error('禁言失败！')
          break
        case 'ASK':
          this.getCode()
          break
        case 'KICK_ERROR':
          this.$msg.error('踢出失败！')
          break
        case 'LEAVE_ROOM':
          console.log(data.nickname + '离开房间')
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
      let ifIe = localStorage.getItem('ifIe') || -1
      ifIe = Number(ifIe)
      if (ifIe > 0) {
        // ie 兼容处理
        this.timeOut = setTimeout(() => {
          _this.heartbeat()
        }, 29000)
      } else {
        this.timeOut = setTimeout(() => {
          _this.heartbeat()
        }, 60000)
      }
      let ndata = {
        'prot': 'HEARTBEAT',
        'data': {}
      }
      this.doSend(ndata)
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
    speak (type) {
      if (type === 1) {
        if (this.questionMsg === '') {
          this.$msg({message: '内容不能为空！', type: 'warning'})
          return false
        }
        let ndata = {
          prot: 'LIVEQUESTION',
          data: {'msg': this.questionMsg}
        }
        this.doSend(ndata)
      } else {
        if (this.speakMsg === '') {
          this.$msg({message: '内容不能为空！', type: 'warning'})
          return false
        }
        let ndata = {
          prot: 'SPEAK',
          data: {'msg': this.speakMsg}
        }
        this.doSend(ndata)
      }
    },
    getface (data, type) {
      if (type === 'question' && this.questionMsg.length < 97) {
        this.questionMsg += data
      } else if (type === 'talk' && this.speakMsg.length < 97) {
        this.speakMsg += data
      }
    },
    reface (str) {
      if (!this.emMap) {
        this.emMap = {
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
      }
      str = str.replace(/</g, '&lt;')
      str = str.replace(/>/g, '&gt;')
      str = str.replace(/\n/g, '<br/>')
      str = str.replace(/\[(.*?)\]/g, (a, b) => {
        return this.emMap.hasOwnProperty(b) ? '<img src="' + this.url.faceurl + this.emMap[b] + '.gif" border="0" />' : str
      })
      return str
    },
    autoScrollCommon (role) {
      // role: 1:讨论区， 2：公开区
      this.$nextTick(() => {
        let chatScrollViewCommon = {}
        let chatOldScrollHeightCommon = {}
        let chatTip = false
        if (role === 1) {
          chatScrollViewCommon = this.$refs.chatScrollView
          chatOldScrollHeightCommon = this.chatOldScrollHeight // 老的高度
        } else if (role === 2) {
          chatScrollViewCommon = this.$refs.chatScrollViewQuse
          chatOldScrollHeightCommon = this.chatOldScrollHeightQuse
        }
        if (chatScrollViewCommon) {
          if (chatOldScrollHeightCommon === 0) {
            chatScrollViewCommon.scrollTop = Math.max(
              0,
              chatScrollViewCommon.scrollHeight - chatScrollViewCommon.offsetHeight
            )
            chatTip = false
          } else {
            const newChatHeight = chatScrollViewCommon.scrollHeight - chatOldScrollHeightCommon
            let behind = parseInt(chatScrollViewCommon.scrollTop) + parseInt(chatScrollViewCommon.offsetHeight)
            let after = parseInt(chatScrollViewCommon.scrollHeight) - parseInt(newChatHeight)
            let difference = after - behind
            if (difference < 5) {
              // 自动滚动
              chatScrollViewCommon.scrollTop += newChatHeight
              chatTip = false
            } else {
              // 三角提示
              chatTip = true
            }
          }
        }
        if (role === 1) {
          this.chatTip = chatTip
        } else if (role === 2) {
          this.chatTipQuse = chatTip
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
    // 班级作业
    classHomework () {
      window.open(this.roomInfo.homework)
    },
    // 下载资料
    download () {
      if (this.liveId) {
        let routeData = this.$router.resolve({path: '/item', query: {targetId: this.liveId, lessonTab: 3}})
        window.open(routeData.href, '_blank')
      } else {
        window.open(this.url.school + '/course/' + this.courseId + '/material.html', '_blank')
      }
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
    }
  },
  filters: {
    toTime (v) {
      var d = new Date(Number(v) * 1000)
      var hour = d.getHours()
      var minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : '' + d.getMinutes()
      var seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : '' + d.getSeconds()
      return hour + ':' + minutes + ':' + seconds
    }
  },
  watch: {
    'chatList': function (val) {
      const chatScrollView = this.$refs.chatScrollView
      this.chatOldScrollHeight = chatScrollView.scrollHeight || 0 // 记录聊天列表位置变更之前的scrollHeight
      this.autoScrollCommon(1)
    },
    'questionList': function (val) {
      const chatScrollViewQuse = this.$refs.chatScrollViewQuse
      this.chatOldScrollHeightQuse = chatScrollViewQuse.scrollHeight || 0 // 记录聊天列表位置变更之前的scrollHeight
      this.autoScrollCommon(2)
    }
  }
}
</script>
<style lang="scss" scoped>
$blue:#1a91d5;
$yellow:#f8800a;
span.isFace{
  width: 30px;
  height: 30px;
  line-height: 30px;
  margin-right: 5px;
  cursor: pointer;
}
span.isFace img{
  width: 28px;
}
.chatTools{
  height:80px;
  border-top: 1px solid $border-color1;
  .chatInput{
    padding:15px 0 0 14px;
    p{
      color:$font-color3;
      text-indent: 2px;
      margin-top: 4px;
    }
    .speakInput{
      width:190px;
    }
    .speakBtn{
      padding:13px 0;
      width:72px;
      margin-left: -1px;
      background-color: $sliver-color;
      color:#fff;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
.chat-tip {
  position: absolute;
  top: 274px;
  left: 50%;
  margin-left: -30px;
  width: 80px;
  height: 20px;
  background-color: #959595;
  border-radius: 12.5px;
  color: #fefefe;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor:pointer;
  span {
    line-height: 12px;
    font-size: 12px;
    &:nth-child(2) {
      margin-left: 5px;
    }
  }
}
.live-main{
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  .livePlayer{
    width:860px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
    #player{
      width:100%;
      height:512px;
    }
  }
  .liveChat{
    width:320px;
    height:512px;
    background-color: #fff;
    .chatContent{
      height:100%;
      .chat-pane {
        position: relative;
      }
      .chat-notic{
        color: $sliver-color;
        text-align: right;
        padding: 0 .266667rem;
      }
      #scroll2::-webkit-scrollbar,.userList::-webkit-scrollbar{
       width: 8px;
      }
      #scroll2::-webkit-scrollbar-track,.userList::-webkit-scrollbar-track{
       background-color:none;
       -webkit-border-radius: 2em;
       -moz-border-radius: 2em;
       border-radius:2em;
      }
      #scroll2::-webkit-scrollbar-thumb,.userList::-webkit-scrollbar-thumb{
       background-color:#e3e3e3;
       -webkit-border-radius: 2em;
       -moz-border-radius: 2em;
       border-radius:2em;
      }
      #scroll2{
        height: 300px;
        overflow-y:auto;
        padding:0 10px;
        li{
          margin-bottom: 10px;
          .speak{
            display: flex;
            .avatar{
              width:28px;
              height:28px;
              border-radius: 50%;
            }
            .content{
              width:270px;
              padding-left:10px;
              .user{
                display: flex;
                justify-content: space-between;
                margin:3px 0 5px;
                .name{
                  color:$blue;
                  .LIVEFONT{
                    font-size: 18px;
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
      }
    }
  }
}
.classRoom-tit{
  background: #535353;
  color: #fff;
  line-height: 20px;
  padding: 0 15px;
  span{
    vertical-align: middle;
  }
}
.discuss-content{
  margin: 20px 0;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
  .discuss-box{
    width: 842px;
    border: 1px solid #e5e5e5;
    border-top: 0;
    .discuss-ul{
      position: relative;
    }
    .chat-tip {
      top: 165px;
    }
     #scroll::-webkit-scrollbar,.userList::-webkit-scrollbar{
       width: 8px;
      }
      #scroll::-webkit-scrollbar-track,.userList::-webkit-scrollbar-track{
       background-color:none;
       -webkit-border-radius: 2em;
       -moz-border-radius: 2em;
       border-radius:2em;
      }
      #scroll::-webkit-scrollbar-thumb,.userList::-webkit-scrollbar-thumb{
       background-color:#e3e3e3;
       -webkit-border-radius: 2em;
       -moz-border-radius: 2em;
       border-radius:2em;
      }
      #scroll{
        height: 191px;
        overflow-y:auto;
        padding:10px;
        li{
          margin-bottom: 10px;
          .speak{
            display: flex;
            .avatar{
              width:28px;
              height:28px;
              border-radius: 50%;
            }
            .content{
              width:790px;
              padding-left:10px;
              .user{
                display: flex;
                justify-content: space-between;
                margin:3px 0 5px;
                .name{
                  color:$blue;
                  .LIVEFONT{
                    font-size: 18px;
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
      }
      .chatTools{
        height:80px;
        border-top: 1px solid $border-color1;
        .chatInput{
          padding-top: 10px;
        }
        .chatInput .speakInput{
          width:700px;
        }
      }
  }
 .classRoom-tit{
    line-height: 25px;
  }
  .swiper-banner {
    width: 298px;
    height: 298px;
    overflow: hidden;
    cursor: pointer;
    .swiper-slide, .banner-link{
      width: 298px;
      height: 298px;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}

  // 班级公告
  .my-class{
    padding: 10px 20px;
    button{
      width: 120px;
      border-radius: 5px;
      font-size: 14px;
      color: #fff;
      height: 30px;
      padding: 0;
      border-radius: 3px;
      i{
        font-size: 16px;
        margin-right: 10px;
      }
      &.el-button--primary{
        background: #e7873a;
        border: 1px solid #e7873a;
      }
      &.el-button--danger{
        background: none;
        border: 1px solid #666;
        color: #666;
      }
    }
  }
  .mint-tab-container{
    background: #fff;
  }
  .ifUnderstand {
    padding: 10px 0 20px;
  }
  .class-notice{
    border-top: 2px solid #e5e5e5;
    padding: 15px 0;
    font-size: 14px;
    overflow-y: auto;
    height: 400px;
  }
  // 是否听懂
  .have-question{
    padding: 20px;
    button{
      width: 120px;
      height: 38px;
      padding: 0;
      &.el-button--primary{
        background: #30ba78;
        border-color: #30ba78;
      }
      &.el-button--danger{
        background: #e83700;
        border-color: #e83700;
        margin-left: 37px;
      }
      &.is-disabled {
        opacity: 1;
        background: #a0a0a0;
        border-color: #a0a0a0;
      }
    }
  }
</style>