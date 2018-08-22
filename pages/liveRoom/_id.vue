<template>
  <div class="liveRoom">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{roomInfo.name}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="live-main">
      <div class="livePlayer">
        <div id="player"></div>
        <div class="reward" @click="myRewardShow = !myRewardShow">
          <span id="shang">
            <img src="../../assets/img/shang.png">
          </span>
        </div>
      </div>
      <div class="liveChat">
        <el-tabs type="border-card" class="chatContent">
          <el-tab-pane label="聊天栏" class="chat-pane">
            <ul id="scroll" ref="chatScrollView">
              <li v-for="(item,index) in chatList">
                <div class="liveStatus" v-if="item.type == 4">
                  <p v-html="reface(item.msg)"></p>
                </div>
                <div class="speak" v-else>
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
                    <p v-html="reface('答: ' + item.msg)" class="text" v-if="item.type == 2"></p>
                    <p v-html="reface(item.msg)" class="text" v-else></p>
                  </div>
                </div>
              </li>
              <div class="liveStatus" v-show="!onLine">
                <p id="reLine">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
              </div>
            </ul>
            <div class="chat-tip" v-show="chatTip" @click="chatTipClick">
              <span class="LIVEFONT">&#xe69c;</span>
              <span>新消息</span>
            </div>
            <div class="chatTools">
              <div class="toolBtn">
                <span title="表情">
                  <el-popover
                    ref="popFace"
                    placement="top"
                    width="312"
                    trigger="click">
                    <elFace @getface="getface"></elFace>
                  </el-popover>
                  <img src="../../assets/img/face.png" v-popover:popFace>
                </span>
                <span :class="{active: btn.type == 1}" title="聊天" @click="() => {btn = {type: 1, msg: '发送'}}">
                  <img src="../../assets/img/chat.png">
                </span>
                <span :class="{active: btn.type == 2}" title="提问" @click="() => {btn = {type: 2, msg: '发送问题'}}">
                  <img src="../../assets/img/question.png">
                </span>
              </div>
              <div class="chatInput">
                <el-input v-model="speakMsg" :maxlength="100" placeholder="请输入内容" class="speakInput" @keyup.enter.native="speak"></el-input>
                <el-button class="speakBtn" @click="speak">{{btn.msg}}</el-button>
                <p>(最多只能输入 {{100 - speakMsg.length}} 字)</p>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="用户列表" v-if="isMaster == 2" >
            <ul class="userList">
              <p class="peopleCount">
                <span>在线 {{userList.length}} 人</span>
              </p>
              <li v-for="(item,index) in userList">
                <div class="user">
                  <img :src="item.avatar">
                  <span>{{item.nickname}}</span>
                  <span v-if="item.hasCourse == 1">(学员)</span>
                </div>
                <div class="btns" v-if="user_id != item.user_id">
                  <el-button type="warning" size="mini" class="shutBtn" @click="shutup(item.user_id)">
                    禁言
                  </el-button>
                  <el-button type="danger" size="mini" class="shutBtn" @click="kick(item.user_id)">
                    踢出
                  </el-button>
                </div>
              </li>
            </ul>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 直播问题列表 -->
    <div class="question-main" v-if="isMaster == 2">
      <el-dialog :visible.sync="ansBox.show"
        :title="ansBox.title"
        width="400px"
        top="40vh"
        :modal="false">
        <el-input
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          :maxlength="100"
          v-model="ansBox.msg">
        </el-input>
        <span slot="footer" class="box-footer">
          <el-popover
            ref="ansFace"
            placement="bottom"
            width="312"
            trigger="click">
            <elFace @getface="getface1"></elFace>
          </el-popover>
          <img src="../../assets/img/face.png" v-popover:ansFace>
          <el-button type="primary" @click="answer" size="mini">回 复</el-button>
        </span>
      </el-dialog>
      <h1>直播提问收集区</h1>
      <ul class="questionList">
        <li v-for="(item, index) in questionList">
          <div class="q-top">
            <div class="user">
              <img :src="item.avatar">
              <span class="name">{{item.nickname}}</span>
              <p v-html="reface(item.msg)"></p>
            </div>
            <div class="q-btn" @click=" () => {ansBox = {show: true, title: '@'+item.nickname+':'+item.msg, msg: '', id: item.q_id}}">
              <i class="LIVEFONT">&#xe66a;</i>
              <span>回复</span>
            </div>
          </div>
          <div class="q-ans" v-for="(ans, index) in item.answers">
            <div class="user">
              <p v-html="reface(ans.msg)"></p>
              <span class="name">{{ans.nickname}}</span>
              <img :src="ans.avatar">
            </div>
          </div>
        </li>
      </ul>
    </div>
    <reWard v-if="myRewardShow" :rewardShow="myRewardShow" v-on:childRewardShow ="rewardTK($event)" ></reWard>
     <!-- 课程推荐 -->
    <div class="course-recommon">
      <div class="piece-header">课程推荐</div>
      <courseRecommen moreStyle="moreWidth"  flexWay="horizontal" :courseList="courseData"></courseRecommen>
    </div>
  </div>
</template>

<script>
import elFace from '~/components/face.vue'
import reWard from '~/components/reward.vue'
import courseRecommen from '~/components/courseRecommen.vue'
import {mapState} from 'vuex'
export default {
  name: 'liveRoom',
  data () {
    return {
      roomInfo: '',
      onLine: true,
      roomId: '',
      user_id: '',
      player: Object,
      ws: Object,
      timeOut: Object,
      chatTip: false,
      chatList: [],
      userList: [],
      questionList: [],
      speakMsg: '',
      ansBox: {
        show: false,
        title: '',
        msg: '',
        id: ''
      },
      askTime: 0,
      isMaster: 1,
      btn: {
        type: 1,
        msg: '发送'
      },
      myRewardShow: false,
      courseData: []
    }
  },
  asyncData ({$axios, params}) {
    return Promise.all([
      $axios.$post('api/Live/enterRoom', {liveId: params.id}),
      $axios.$post('api/Live/recommendCourse', {liveId: params.id})
    ]).then(([data, courseData]) => {
      return {
        roomInfo: data,
        roomId: data.room_id,
        courseData: courseData.recommandList
      }
    })
  },
  components: {
    elFace,
    reWard,
    courseRecommen
  },
  computed: {
    ...mapState([
      'url'
    ])
  },
  mounted () {
    var that = this
    this.user_id = this.$store.state.user_id
    if (this.roomInfo.status === 2) {
      this.$msg('直播已结束')
      setTimeout(function () {
        that.$router.go(-1)
      }, 800)
    } else {
      this.wsInit()
    }
    this.$nextTick(() => {
      this.$refs.chatScrollView.addEventListener('scroll', this.chatScrollViewDidScroll)
    })
  },
  beforeDestroy () {
    this.$refs.chatScrollView.removeEventListener('scroll', this.chatScrollViewDidScroll)
    this.ws.close()
    this.unLive()
    clearInterval(this.timeOut)
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    onLive (uid, vid) {
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
      // document.getElementById('reLine').style.display = 'block'
      this.onLine = false
      this.unLive()
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

        // 提问列表
        case 'QUESTION_LIST':
          this.questionList = data.list
          break

        // 上线成功
        case 'ONLINE_SUCCESS':
          let ndata = {
            prot: 'ENTER_ROOM',
            data: {'room_id': this.roomId, 'type': 'live'}
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
          this.userList.push(data)
          break

        case 'ENTER_ROOM_SUCCESS':
          // $('#reLine').hide()
          this.onLive(data.uid, data.channel)
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
        case 'SPEAK':
          // 聊天数据
          if (data.type === 2) {
            if (data.user_id === Number(this.$store.state.user_id)) {
              this.ansBox.msg = ''
              this.ansBox.show = false
              let ansIndex = this.questionList.findIndex(item => {
                return item.q_id === data.q_id
              })
              this.questionList[ansIndex].answers.push(data)
            }
          } else if (data.type === 4) {
            // 打赏
            if (data.user_id === Number(this.$store.state.user_id)) {
              this.myRewardShow = false
            }
          } else {
            if (data.user_id === Number(this.$store.state.user_id)) {
              this.speakMsg = ''
            }
            if (data.type === 1) {
              data = {
                ...data,
                answers: []
              }
              this.questionList.push(data)
            }
          }
          this.chatList.push(data)
          let liveStr = '[{"msg":"' + data.msg + '","fontSize":"24","fontColor":"0xffffff","fontMode":"roll"}]'
          this.player.j2s_addBarrageMessage(liveStr)
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
          } else if (this.isMaster === 2) {
            let leaveIndex = this.userList.findIndex(item => {
              return item.user_id === data.user_id
            })
            this.userList.splice(leaveIndex, 1)
          }
          break
        case 'SHUTUP_ERROR':
          this.$msg.error('禁言失败！')
          break
        case 'KICK_ERROR':
          this.$msg.error('踢出失败！')
          break
        case 'LEAVE_ROOM':
          let leaveIndex = this.userList.findIndex(item => {
            return item.user_id === data.user_id
          })
          this.userList.splice(leaveIndex, 1)
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
    speak () {
      if (this.speakMsg === '') {
        this.$msg({message: '内容不能为空！', type: 'warning'})
        return false
      }
      let ndata = {
        prot: 'SPEAK',
        data: {'msg': this.speakMsg}
      }
      if (this.btn.type === 2) {
        ndata = {
          prot: 'QUESTION',
          data: {'msg': this.speakMsg}
        }
        this.doSend(ndata)
      } else {
        this.doSend(ndata)
      }
    },
    answer () {
      if (this.ansBox.msg === '') {
        this.$msg({message: '内容不能为空！', type: 'warning'})
        return false
      }
      let ndata = {
        prot: 'ANSWER',
        data: {'msg': this.ansBox.msg, 'q_id': this.ansBox.id}
      }
      this.doSend(ndata)
    },
    // 禁言
    shutup (userId) {
      let ndata = {
        prot: 'SHUTUP',
        data: {'room_id': this.roomId, 'target_id': userId, 'type': 'live'}
      }
      this.doSend(ndata)
    },
    // 踢人
    kick (userId) {
      let ndata = {
        prot: 'KICK',
        data: {'room_id': this.roomId, 'target_id': userId, 'type': 'live'}
      }
      this.doSend(ndata)
    },
    // reward (gift) {
    //   let ndata = {
    //     prot: 'REWARD',
    //     data: {'room_id': this.roomId, 'type': 'live', 'gift': gift}
    //   }
    //   this.doSend(ndata)
    // },
    getface (data) {
      this.speakMsg += data
    },
    getface1 (data) {
      this.ansBox.msg += data
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
    // 打赏弹框
    rewardTK (status) {
      this.myRewardShow = status
    },
    // 打赏成功信息
    // rewardSuccessInfo (info) {
    //   this.myRewardShow = false
    //   this.reward(info)
    // },
    autoScroll () {
      this.$nextTick(() => {
        const chatScrollView = this.$refs.chatScrollView
        if (chatScrollView) {
          if (this.chatOldScrollHeight === 0) {
            chatScrollView.scrollTop = Math.max(0, chatScrollView.scrollHeight - chatScrollView.offsetHeight)
            this.chatTip = false
          } else {
            const newChatHeight = chatScrollView.scrollHeight - this.chatOldScrollHeight
            if (chatScrollView.scrollTop + newChatHeight === chatScrollView.scrollHeight - chatScrollView.offsetHeight) {
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
      chatScrollView.scrollTop = chatScrollView.scrollHeight - chatScrollView.offsetHeight
      this.chatTip = false
    },
    chatScrollViewDidScroll () {
      this.chatTip = false
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
      this.autoScroll()
    }
  }
}
</script>
<style lang="scss" scoped>
$blue:#1a91d5;
$yellow:#f8800a;
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
    .reward{
      height:50px;
      background-color: #fff;
      display: flex;
      justify-content: flex-end;
      align-items:center;
      #shang{
        display: block;
        width:30px;
        height: auto;
        margin-right: 15px;
        cursor: pointer;
      }
    }
  }
  .liveChat{
    width:320px;
    height:562px;
    background-color: #fff;
    .chatContent{
      height:100%;
      .chat-pane {
        position: relative;
      }
      .chat-tip {
        position: absolute;
        top: 380px;
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
        height: 410px;
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
      .userList{
        margin-top: 12px;
        height:480px;
        overflow-y:auto;
        background-color: #fff;
        .peopleCount{
          text-align: right;
          padding-right: 20px;
        }
        li{
          display: flex;
          justify-content: space-between;
          padding:0 10px;
          margin:12px 0 0;
          .user{
            img{
              display: inline-block;
              height:26px;
              width:26px;
              border-radius: 50%;
              vertical-align: middle;
              margin-right: 10px;
            }
          }
          .btns{
            display: flex;
            align-items:center;
            .el-button{
              padding:5px 8px;
            }
          }
        }
      }
      .chatTools{
        height:100px;
        border-top: 1px solid $border-color1;
        .toolBtn{
          padding-left: 10px;
          span{
            display: inline-block;
            padding:5px 8px;
            cursor: pointer;
            img{
              width:24px;
            }
          }
          span.active{
            background-color: #eee;
          }

        }
        .chatInput{
          padding:0 0 0 14px;
          p{
            color:$font-color3;
            text-indent: 2px;
            margin-top: 2px;
          }
          .speakInput{
            width:210px;
          }
          .speakBtn{
            padding:13px 0;
            width:72px;
            margin-left: -1px;
            background-color: $master-color;
            color:#fff;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }
        }
      }
    }
  }
}

.question-main{
  background-color: #fff;
  margin: 20px 0;
  padding: 0 15px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
  .box-footer{
    display: flex;
    align-items:center;
    justify-content: flex-end;
    img{
      width:24px;
      margin-right: 10px;
      cursor: pointer;
    }
    .el-button{

    }
  }
  h1{
    height: 50px;
    line-height: 50px;
    font-size: 18px;
    color:$font-color1;
    text-indent: 20px;
    border-bottom: 1px dashed $border-color1;
    margin-bottom: 20px;
  }
  .questionList::-webkit-scrollbar {
    width: 10px;
  }
  .questionList::-webkit-scrollbar-track {
    background-color:#f6f6f6;
    -webkit-border-radius: 2em;
    -moz-border-radius: 2em;
    border-radius:2em;
  }
  .questionList::-webkit-scrollbar-thumb{
    background-color:#e3e3e3;
    -webkit-border-radius: 2em;
    -moz-border-radius: 2em;
    border-radius:2em;
  }
  .questionList{
    height:500px;
    overflow-y: auto;
    li{
      border:1px solid $border-color1;
      border-radius: 5px;
      margin:0 5px 20px 5px;
      .q-top{
        display: flex;
        justify-content: space-between;
        margin:10px;
        .q-btn{
          display: flex;
          margin:10px;
          cursor: pointer;
          &:hover{
            color:$master-color;
          }
          .LIVEFONT{
            margin-right: 5px;
          }
          span{
            font-size: 14px;
            margin-top: -3px;
          }
        }
      }
      .user{
        width:80%;
        display: flex;
        align-items:center;
        img{
          width:30px;
          height: 30px;
          border-radius: 50%;
        }
        .name{
          margin:0 15px 0 10px;
          white-space:nowrap;
        }
        p{
          padding:10px 12px;
          background-color: $background-color1;
          border-radius: 5px;
          position: relative;
          img{
            width: 24px;
          }
          &:before{
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            transform: translate(-100%, -50%);
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-right: 10px solid $background-color1;
            border-bottom: 8px solid transparent;
          }
        }
      }
      .q-ans{
        display: flex;
        justify-content: flex-end;
        flex-wrap:wrap;
        margin: 10px 20px 10px 10px;
        .user{
          width:80%;
          display: flex;
          justify-content: flex-end;
          .name{
            margin:0 10px 0 15px;
            white-space:nowrap;
          }
          p{
            &:before{
              content: initial;
            }
            &:after{
              content: '';
              position: absolute;
              top: 50%;
              right: 0;
              transform: translate(100%, -50%);
              width: 0;
              height: 0;
              border-top: 8px solid transparent;
              border-left: 10px solid #f7f7f7;
              border-bottom: 8px solid transparent;
            }
          }
        }
      }
    }
  }
}
.course-recommon{
    margin-top: 30px;
    background-color: #fff;
    padding: 5px 20px;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
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
</style>