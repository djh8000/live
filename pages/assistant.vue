<template>
  <div class="assistant">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{roomInfo.title}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="chat-content flex j-s">
      <div class="left-seat">
        <div class="livePlayer">
          <div id="player"></div>
        </div>
        <div class="bottom-seat flex j-s">
          <div class="seat-content">
            <el-tabs v-model="activeName">
              <el-tab-pane label="座位" name="first">
                <div class="switch-content">
                  <div class="freshen">
                    <el-button :disabled="disabled"type="primary" @click="ask()">
                      刷新
                      <i class="LIVEFONT">&#xe610;</i>
                    </el-button>
                  </div>
                  <div class="qusetion-student flex j-s">
                    <span>有疑问的学生</span>
                    <span>{{problemNum}}/{{userList.length}}</span>
                  </div>
                  <ul class="site-list flex">
                    <li  v-for="(item,index) in userList">
                      <div class="img-content">
                        <img v-if="item.problem === 1" src="../assets/img/head-red.png">
                        <img v-else-if="item.problem === 0" src="../assets/img/head-green.png">
                        <img v-else src="../assets/img/head-yellow.png">
                        <span v-if="item.shutupRestTime > 0" class="hasforbidden LIVEFONT">&#xe715;</span>
                      </div>
                      <p>{{item.nickname}}</p>
                    </li>
                  </ul>
                </div>
              </el-tab-pane>
              <el-tab-pane label="班级公告" name="second">
                <div class="switch-content">
                  {{roomInfo.annoucement}}
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="student-ques">
            <div class="classRoom-tit flex j-s">
              <div class="left-info">
                <span class="LIVEFONT">&#xe614;</span>
                学生提问区
              </div>
              <div class="right-info">
                {{getNum}}/ {{studentList.length || 0}}
              </div>
            </div>
             <div class="discuss-ul">
              <ul id="scroll3" class="chat-list" ref="chatScrollViewQuse">
                <li v-for="(item,index) in studentList">
                  <div class="speak">
                    <img v-if="item.avatar" :src="item.avatar" class="avatar">
                    <img v-else src="../assets/img/members.png" class="avatar">
                    <div class="content">
                      <p class="user">
                        <span class="name elis">
                          {{item.nickname}}
                        </span>
                        <span @click="toOpenArea('student', index)" class="LIVEFONT plane" :class="[item.toOpen? 'active' : '']">&#xe676;</span>
                      </p>
                      <p v-html="reface(item.msg)" class="text"></p>
                    </div>
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
            </div>
          </div>
        </div>
      </div>
      <div class="right-chat">
        <div class="top-assistant">
          <div class="classRoom-tit flex a-c">
            <span class="LIVEFONT kd">&#xe612;</span>
            <em @click="studentTab = 1" :class="[studentTab === 1? 'active' : '']">公开区</em>
            <em @click="studentTab = 2" :class="[studentTab === 2? 'active' : '']">讨论区</em>
          </div>
          <div class="discuss-ul" v-show="studentTab === 1">
            <ul id="scroll2" class="chat-list" ref="chatScrollViewOpen">
              <li v-for="(item,index) in openList">
                <div class="assistant-name">{{item.tutor}}</div>
                <div class="speak">
                  <img v-if="item.avatar" :src="item.avatar" class="avatar">
                  <img v-else src="../assets/img/members.png" class="avatar">
                  <div class="content">
                    <p class="user">
                      <span class="name">
                        {{item.nickname}}
                      </span>
                    </p>
                    <p v-html="reface(item.msg)" class="text"></p>
                  </div>
                </div>
              </li>
              <div class="liveStatus" v-show="!onLine">
                <p id="reLine">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
              </div>
            </ul>
            <div class="chatTools">
              <div class="chatInput">
                <div class="out-inpput flex a-c">
                  <span class='isFace' title="表情">
                  <el-popover
                    ref="popFace"
                    placement="top"
                    width="312"
                    trigger="click">
                    <elFace @getface="getface($event, 'open')"></elFace>
                  </el-popover>
                  <img src="../assets/img/face.png" v-popover:popFace>
                </span>
                <el-input v-model="openMsg" :maxlength="100" placeholder="请输入内容" class="speakInput" @keyup.enter.native="speak(1)"></el-input>
                <el-button class="speakBtn" @click="speak(1)">发送</el-button>
                </div>
                <p>(最多只能输入 {{100 - openMsg.length}} 字)</p>
              </div>
            </div>
          </div>
          <div class="discuss-ul" v-show="studentTab === 2">
            <ul id="scroll4" class="chat-list" ref="chatScrollView">
              <li v-for="(item,index) in chatList">
                <div class="speak">
                  <img v-if="item.avatar" :src="item.avatar" class="avatar">
                  <img v-else src="../assets/img/members.png" class="avatar">
                  <div class="right-info flex a-c">
                    <div class="content">
                      <p class="user">
                        <span class="name">
                          {{item.nickname}}
                        </span>
                      </p>
                      <p v-html="reface(item.msg)" class="text"></p>
                    </div>
                    <span @click="shutup(item.user_id)" class="forbidden LIVEFONT">&#xe715;</span>
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
                <el-input v-model="talkMsg" :maxlength="100" placeholder="请输入内容" class="speakInput" @keyup.enter.native="speak(2)"></el-input>
                <el-button class="speakBtn" @click="speak(2)">发送</el-button>
                </div>
                <p>(最多只能输入 {{100 - talkMsg.length}} 字)</p>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-assistant">
          <div class="classRoom-tit">
            <span class="LIVEFONT">&#xe650;</span>
            教师交流区
          </div>
           <div class="discuss-ul">
            <ul id="scroll" class="chat-list" ref="chatScrollViewTeacher">
              <li v-for="(item,index) in teacherList">
                <div class="assistant-name">{{item.tutor}}</div>
                <div class="speak">
                  <img v-if="item.avatar" :src="item.avatar" class="avatar">
                  <img v-else src="../assets/img/members.png" class="avatar">
                  <div class="content">
                    <p class="user">
                      <span class="name">
                        {{item.nickname}}
                      </span>
                      <span @click="toOpenArea('teacher', index)" class="LIVEFONT plane" :class="[item.toOpen? 'active' : '']">&#xe676;</span>
                    </p>
                    <p v-html="reface(item.msg)" class="text"></p>
                  </div>
                </div>
              </li>
              <div class="liveStatus" v-show="!onLine">
                <p id="reLine">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
              </div>
            </ul>
            <div class="chatTools">
              <div class="chatInput">
                <div class="out-inpput flex a-c">
                  <span class='isFace' title="表情">
                  <el-popover
                    ref="popFace"
                    placement="top"
                    width="312"
                    trigger="click">
                    <elFace @getface="getface($event, 'teacher')"></elFace>
                  </el-popover>
                  <img src="../assets/img/face.png" v-popover:popFace>
                </span>
                <el-input v-model="teacherMsg" :maxlength="100" placeholder="请输入内容" class="speakInput" @keyup.enter.native="speak(3)"></el-input>
                <el-button class="speakBtn" @click="speak(3)">发送</el-button>
                </div>
                <p>(最多只能输入 {{100 - teacherMsg.length}} 字)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import elFace from '~/components/face.vue'
import {mapState} from 'vuex'
export default {
  data () {
    return {
      user_id: this.$store.state.user_id,
      activeName: 'first',
      onLine: true,
      chatTip: false,
      chatTipQuse: false,
      isMaster: 1,
      chatList: [],
      teacherList: [],
      openList: [],
      studentList: [],
      userList: [],
      problemNum: 0, // 有疑问的学生数
      assistantMsg: '',
      studentTab: 1,
      openMsg: '',
      talkMsg: '',
      teacherMsg: '',
      disabled: false,
      getNum: 0 // 选中问题
    }
  },
  asyncData ({$axios, query}) {
    return Promise.all([
      $axios.$post('api/Live/privateTeacherAndAssistant', {courseId: query.courseId, roleType: 2})
    ]).then(([data]) => {
      return {
        roomInfo: data,
        roomId: data.room_id
      }
    })
  },
  mounted () {
    var that = this
    if (this.roomInfo.code) {
      // 权限判断
      this.$msg(this.roomInfo.msg)
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
    clearInterval(this.timerCode)
    clearInterval(this.shutTimer)
    clearInterval(this.timeOut)
    this.ws.close()
    this.unLive()
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
        // console.log('发生错误关闭')
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
      clearInterval(this.timeOut)
      this.autoScrollCommon(2)
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
        case 'TEACHER_QUESTION_LIST':
          // 教师交流区
          this.teacherList = data.list
          break
        case 'LIVECOURSE_LIST':
          // 公开问题区域
          this.openList = data.list
          break
        case 'STUDENT_QUESTION_LIST':
          // 学生提问区
          this.studentList = data.list
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
        case 'ROOM_USER':
          let userList = data.list
          userList = userList.filter(function (item) {
            return item.roles === 1
          })
          if (data.time > 0) {
            this.getCode(data.time)
          }
          this.userList = [...userList]
          this.downTime()
          break
        case 'ANSWERLIVE':
          let answerUserList = this.userList
          let problemNum = this.problemNum
          answerUserList = answerUserList.map(function (item) {
            if (item.user_id === data.user_id) {
              item.problem = data.problem
              if (data.problem === 1) {
                // 获取有疑问并且是学生的人数
                problemNum += 1
              }
            }
            return item
          })
          this.userList = answerUserList
          this.problemNum = problemNum
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
          if (data.roles === 1) {
            this.userList.push(data)
          }
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
        case 'GETQUESTION':
          if (data.types === 1) {
            // 教师交流区
            if (Number(data.user_id) === Number(this.user_id)) {
              this.teacherMsg = ''
            }
            this.teacherList.push(data)
          } else if (data.types === 2) {
            // 公开区内容
            if (Number(data.user_id) === Number(this.user_id)) {
              this.openMsg = ''
            }
            this.openList.push(data)
          }
          break
        case 'SPEAK':
          // 聊天数据
          if (data.type === 0) {
            this.chatList.push(data)
            let liveStr = '[{"msg":"' + data.msg + '","fontSize":"24","fontColor":"0xffffff","fontMode":"roll"}]'
            this.player.j2s_addBarrageMessage(liveStr)
            if (Number(data.user_id) === Number(this.user_id)) {
              this.talkMsg = ''
            }
          } else if (data.type === 1) {
            this.studentList.push(data)
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
          let userListShut = this.userList
          userListShut.map(function (item) {
            if (Number(item.user_id) === Number(data.user_id)) {
              item.shutupRestTime = 120
            }
            return item
          })
          this.userList = [...userListShut]
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
          } else if (data.roles === 1) {
            let leaveIndex = this.userList.findIndex(item => {
              return item.user_id === data.user_id
            })
            this.userList.splice(leaveIndex, 1)
          }
          break
        case 'SHUTUP_ERROR':
          this.$msg.error('禁言失败！')
          break
        case 'ASK':
          let askList = this.userList
          askList.map(function (item) {
            item.problem = -1
            return item
          })
          this.getCode(data.time)
          this.problemNum = 0
          this.userList = [ ...askList ]
          break
        case 'KICK_ERROR':
          this.$msg.error('踢出失败！')
          break
        case 'LEAVE_ROOM':
          console.log(data.nickname + '离开房间')
          if (data.roles === 1) {
            let leaveIndex = this.userList.findIndex(item => {
              return item.user_id === data.user_id
            })
            this.userList.splice(leaveIndex, 1)
          }
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
    toOpenArea (role, index) {
      let ndata = {}
      if (role === 'student') {
        // 助教操作把学生提问区问题指到教师交流区
        let sendInfo = this.studentList
        let thisSendInfo = sendInfo[index]
        ndata = {
          prot: 'SENDQUESTION',
          data: {
            msg: thisSendInfo.msg,
            user_id: thisSendInfo.user_id,
            user_name: thisSendInfo.nickname,
            types: 1 // 老师看到
          }
        }
        if (!sendInfo[index].toOpen) {
          this.getNum += 1
        }
        sendInfo[index].toOpen = true
        this.studentList = [ ...sendInfo ]
      } else if (role === 'teacher') {
        // 助教操作把教师交流区问题指到公开区
        let sendInfo = this.teacherList
        let thisSendInfo = sendInfo[index]
        ndata = {
          prot: 'SENDQUESTION',
          data: {
            msg: thisSendInfo.msg,
            user_id: thisSendInfo.user_id,
            user_name: thisSendInfo.nickname,
            types: 2 // 公开看到
          }
        }
        sendInfo[index].toOpen = true
        this.teacherList = [ ...sendInfo ]
      }
      this.doSend(ndata)
    },
    speak (type) {
      let ndata = {}
      if (type === 1) {
        // 公开区
        if (this.openMsg === '') {
          this.$msg({message: '内容不能为空！', type: 'warning'})
          return false
        }
        ndata = {
          prot: 'SENDQUESTION',
          data: {
            'msg': this.openMsg,
            types: 2,
            user_id: this.user_id,
            user_name: ''
          }
        }
      } else if (type === 2) {
        // 讨论区
        if (this.talkMsg === '') {
          this.$msg({message: '内容不能为空！', type: 'warning'})
          return false
        }
        ndata = {
          prot: 'SPEAK',
          data: {'msg': this.talkMsg}
        }
      } else if (type === 3) {
        // 教师交流区
        if (this.teacherMsg === '') {
          this.$msg({message: '内容不能为空！', type: 'warning'})
          return false
        }
        ndata = {
          prot: 'SENDQUESTION',
          data: {
            'msg': this.teacherMsg,
            types: 1,
            user_id: this.user_id,
            user_name: ''
          }
        }
      }
      this.doSend(ndata)
    },
    // 刷新提问按钮
    ask () {
      let ndata = {
        prot: 'ASK',
        data: {
        }
      }
      this.doSend(ndata)
    },
    // 禁言
    shutup (userId) {
      let ndata = {
        prot: 'SHUTUP',
        data: {
          room_id: this.roomId,
          target_id: userId,
          type: 'plive'
        }
      }
      this.doSend(ndata)
    },
    // 刷新倒计时
    getCode (time) {
      const TIME_COUNT = time
      let count = time
      if (!this.timerCode) {
        count = TIME_COUNT
        this.disabled = true
        this.timerCode = setInterval(() => {
          if (count > 0 && count <= TIME_COUNT) {
            count--
          } else {
            clearInterval(this.timerCode)
            this.timerCode = null
            this.disabled = false
          }
        }, 1000)
      }
    },
    // 禁言倒计时
    downTime () {
      this.shutTimer = setInterval(() => {
        let userList = this.userList
        for (var key in userList) {
          if (userList[key].shutupRestTime > 0) {
            let time = userList[key].shutupRestTime
            const TIME_COUNT = time
            let count = time
            if (count > 0 && count <= TIME_COUNT) {
              count--
              // console.log(count)
              userList[key].shutupRestTime = count
            } else {
              userList[key].shutupRestTime = 0
            }
            this.userList = [...userList]
          }
        }
      }, 1000)
    },
    getface (data, type) {
      if (type === 'open' && this.openMsg.length < 97) {
        this.openMsg += data
      } else if (type === 'talk' && this.talkMsg.length < 97) {
        this.talkMsg += data
      } else if (type === 'teacher' && this.teacherMsg.length < 97) {
        this.teacherMsg += data
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
    chatTipClick (num) {
      if (num === 2) {
        // 讨论区
        const chatScrollView = this.$refs.chatScrollView
        chatScrollView.scrollTop =
          chatScrollView.scrollHeight - chatScrollView.offsetHeight
        this.chatTip = false
      } else {
        // 学生提问区
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
    autoScrollCommon (role) {
      // role: 1:教师， 2：公开区， 3，学生提问区 4： 讨论区
      this.$nextTick(() => {
        let chatScrollViewCommon = {}
        let chatOldScrollHeightCommon = {}
        let chatTip = false
        if (role === 1) {
          chatScrollViewCommon = this.$refs.chatScrollViewTeacher
          chatOldScrollHeightCommon = this.chatOldScrollHeightTeacher // 老的高度
        } else if (role === 2) {
          chatScrollViewCommon = this.$refs.chatScrollViewOpen
          chatOldScrollHeightCommon = this.chatOldScrollHeightOpen
        } else if (role === 3) {
          chatScrollViewCommon = this.$refs.chatScrollViewQuse
          chatOldScrollHeightCommon = this.chatOldScrollHeightQuse
          chatTip = this.chatTipQuse
        } else if (role === 4) {
          chatScrollViewCommon = this.$refs.chatScrollView
          chatOldScrollHeightCommon = this.chatOldScrollHeight
          chatTip = this.chatTip
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
        if (role === 3) {
          this.chatTipQuse = chatTip
        } else if (role === 4) {
          this.chatTip = chatTip
        }
      })
    }
  },
  watch: {
    'chatList.length': function (val) {
      const chatScrollView = this.$refs.chatScrollView
      this.chatOldScrollHeight = chatScrollView.scrollHeight || 0
      this.autoScrollCommon(4)
    },
    'studentList.length': function (val) {
      const chatScrollViewQuse = this.$refs.chatScrollViewQuse
      this.chatOldScrollHeightQuse = chatScrollViewQuse.scrollHeight || 0
      this.autoScrollCommon(3)
    },
    'openList.length': function (val) {
      const chatScrollViewOpen = this.$refs.chatScrollViewOpen
      this.chatOldScrollHeightOpen = chatScrollViewOpen.scrollHeight || 0
      this.autoScrollCommon(2)
    },
    'teacherList.length': function (val) {
      const chatScrollViewTeacher = this.$refs.chatScrollViewTeacher
      this.chatOldScrollHeightTeacher = chatScrollViewTeacher.scrollHeight || 0
      this.autoScrollCommon(1)
    },
    'studentTab': function (val) {
      // 解决讨论区初始高度0的问题
      if (val === 2) {
        const chatScrollView = this.$refs.chatScrollView
        this.chatOldScrollHeight = chatScrollView.scrollHeight || 0
        this.autoScrollCommon(4)
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
  components: {
    elFace
  },
  computed: {
    ...mapState([
      'url'
    ])
  }
}
</script>

<style lang="scss" scoped>
$blue:#1a91d5;
$yellow:#f8800a;
.assistant{

}
// 视屏
.livePlayer{
  width: 100%;
  #player{
    height: 321px;
  }
}
.bottom-seat{
  margin-top: 35px;
  .seat-content{
    width: 270px;
    flex-shrink: 0;
  }
  .student-ques{
    width: 270px;
    flex-shrink: 0;
    .chat-list{
      border: 1px solid #e5e5e5;
      height: 445px;
      padding: 10px;
      border-top: 0;
      overflow-y: auto;
      min-height: 200px;
      box-sizing: border-box;
      li{
        margin-bottom: 12px;
        .speak {
          .content .user{
            margin: 3px 0 5px;
            .name{
              max-width: 160px;
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
  line-height: 25px;
  padding: 0 15px;
  font-size: 12px;
  span{
    vertical-align: middle;
    font-size: 16px;
    &.kd{
      margin-right: 10px;
    }
  }
  em{
    margin-right: 20px;
    cursor: pointer;
    &.active{
      color: $sliver-color;
    }
  }
}
.chat-content{
  background: #fff;
  padding: 10px;

  .right-chat{
    width: 580px;
  }
  .top-assistant, .bottom-assistant{
    height: 400px;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    position: relative;
  }
  .bottom-assistant{
    margin-top: 20px;
  }
  .left-seat{
    width: 570px;
  }
  .switch-content{
    height: 414px;
    overflow-y: auto;
    border: 1px solid #e5e5e5;
    padding: 10px;
  }
}
// 聊天内容
  .discuss-ul{
    position: relative;
  }
 .chat-list::-webkit-scrollbar,.switch-content::-webkit-scrollbar{
   width: 8px;
  }
  .chat-list::-webkit-scrollbar-track,.switch-content::-webkit-scrollbar-track{
   background-color:none;
   -webkit-border-radius: 2em;
   -moz-border-radius: 2em;
   border-radius:2em;
  }
 .chat-list::-webkit-scrollbar-thumb, .switch-content::-webkit-scrollbar-thumb{
   background-color:#e3e3e3;
   -webkit-border-radius: 2em;
   -moz-border-radius: 2em;
   border-radius:2em;
  }
  .chat-list{
    height: 290px;
    overflow-y:auto;
    padding: 0 10px 10px;
    li{
      .assistant-name{
        margin: 0 0 5px 0;
        line-height: 30px;
        color: $sliver-color;
        border-bottom: 1px solid #e5e5e5;
        font-size: 14px;
        font-weight: bold;
      }
      .speak{
        display: flex;
        .avatar{
          width:28px;
          height:28px;
          flex-shrink:0;
          border-radius: 50%;
        }
        .content{
          width:516px;
          padding-left:10px;
          .user{
            display: flex;
            justify-content: space-between;
            margin:1px 0 1px;
            .name{
              color:$blue;
              .LIVEFONT{
                font-size: 18px;
                vertical-align: middle;
              }
            }
            .plane{
              color: #999;
              cursor: pointer;
              &.active{
                color: $sliver-color;
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
  .chat-tip {
  position: absolute;
  bottom: 15px;
  left: 50%;
  margin-left: -30px;
  z-index: 100;
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
.right-chat .chat-tip{
  bottom: 92px;
}
// 座位表
.switch-content{
  .qusetion-student{
    margin: 10px 0;
    justify-content: space-between;
    font-size: 12px;
    line-height: 20px;
    padding: 0 10px;
  }
  .site-list{
    flex-wrap: wrap;
    li{
      cursor: pointer;
      width: 25%;
      overflow: hidden;
      position: relative;
      padding-top: 10px;
      .img-content{
        margin: 0 auto;
        height: 35px;
        position: relative;
        .hasforbidden{
          color: $sliver-color;
          position: absolute;
          top: -5px;
          right: 0;
          font-size: 20px;
        }
        img {
          display: block;
          width: 26px;
          height: auto;
          margin: 0 auto;
        }
      }
      p{
        margin: 0;
        font-size: 12px;
        color: #545454;
        text-align: center;
        overflow: hidden;
        height: 30px;
        width: 60px;
        margin: 0 auto;
        line-height: 30px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
.chatTools{
  height:80px;
  padding: 15px 10px ;
  border-top: 1px solid $border-color1;
  .chatInput{
    p{
      color:$font-color3;
      text-indent: 2px;
      margin-top: 4px;
    }
    .speakBtn{
      padding:13px 0;
      width:72px;
      flex-shrink: 0;
      margin-left: -1px;
      background-color: $sliver-color;
      color:#fff;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
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
}
// 讨论区
#scroll4{
  li {
    margin-bottom: 12px;
    .speak {
      .content {
        width: 480px;
        .user{
          margin: 3px 0 5px;
        }
      }
    }
    .forbidden{
      color: #999;
      cursor: pointer;
      width: 50px;
      flex-shrink: 0;
      text-align: center;
      font-size: 20px;
      &.active{
        color: $sliver-color;
      }
    }
  }
}
</style>
