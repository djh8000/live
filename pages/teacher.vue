<template>
  <div class="theme" :class="[darkTheme? 'dark-theme' : '']">
    <div class="teacher">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{roomInfo.title}}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="change-btn">
        <span class="video-mode" @click="darkTheme = true">投屏模式</span>
        <span class="pc-mode" @click="darkTheme = false">普通模式</span>
      </div>
      <div class="chat-content flex j-s">
        <div class="left-chat">
          <div class="top-assistant">
            <div class="classRoom-tit">
              <span class="LIVEFONT">&#xe689;</span>
              助教发言区
            </div>
            <div class="discuss-ul">
              <ul id="scroll" class="chat-list" ref="chatScrollView">
                <li v-for="(item,index) in chatList">
                  <div class="assistant-name">{{item.tutor}}</div>
                  <div class="speak">
                    <img v-if="item.avatar" :src="item.avatar" class="avatar">
                    <img v-else src="../assets/img/members.png" class="avatar">
                    <div class="content">
                      <p class="user">
                        <span class="name">
                          {{item.nickname}}
                        </span>
                        <span @click="toOpenArea(index)" class="LIVEFONT plane" :class="[item.toOpen? 'active' : '']">&#xe676;</span>
                      </p>
                      <p v-html="reface(item.msg)" class="text"></p>
                    </div>
                  </div>
                </li>
                <div class="liveStatus" v-show="!onLine">
                  <p id="reLine">已断开连接, <a href="javascript:void(0)" onclick="location.reload()">重新连接</a></p>
                </div>
              </ul>
              <div class="chat-tip" v-show="chatTip" @click="chatTipClick(1)">
                <span class="LIVEFONT">&#xe69c;</span>
                <span>新消息</span>
              </div>
            </div>
          </div>
          <div class="bottom-assistant">
            <div class="classRoom-tit">
              <span class="LIVEFONT">&#xe650;</span>
              公开区
            </div>
             <div class="discuss-ul">
              <ul id="scroll2" class="chat-list" ref="chatScrollViewQuse">
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
              <div class="chat-tip" v-show="chatTipQuse" @click="chatTipClick(2)">
                <span class="LIVEFONT">&#xe69c;</span>
                <span>新消息</span>
              </div>
            </div>
          </div>
        </div>
        <div class="right-seat">
          <el-tabs v-model="activeName">
          <el-tab-pane label="座位" name="first">
            <div class="switch-content">
              <div class="qusetion-student">
                有疑问的学生 &nbsp; {{problemNum}}/{{userList.length}}
              </div>
              <ul class="site-list flex">
                <li  v-for="(item,index) in userList">
                  <div class="img-content">
                    <img v-if="item.problem === 1" src="../assets/img/head-red.png">
                    <img v-else-if="item.problem === 0" src="../assets/img/head-green.png">
                    <img v-else src="../assets/img/head-yellow.png">
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
      </div>
    </div>
  </div>
</template>

<script>
import elFace from '~/components/face.vue'
import {mapState} from 'vuex'
export default {
  layout: 'home',
  data () {
    return {
      darkTheme: false,
      activeName: 'first',
      onLine: true,
      chatTip: false,
      chatTipQuse: false,
      chatList: [],
      openList: [],
      userList: [],
      problemNum: 0 // 有疑问的学生数
    }
  },
  asyncData ({$axios, query}) {
    return Promise.all([
      $axios.$post('api/Live/privateTeacherAndAssistant', {courseId: query.courseId, roleType: 1})
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
      this.$refs.chatScrollViewQuse.addEventListener('scroll', this.chatScrollViewDidScrollQuse)
    })
  },
  beforeDestroy () {
    this.$refs.chatScrollView.removeEventListener('scroll', this.chatScrollViewDidScroll)
    this.$refs.chatScrollViewQuse.removeEventListener('scroll', this.chatScrollViewDidScrollQuse)
    this.ws.close()
    clearInterval(this.timeOut)
  },
  methods: {
    back () {
      this.$router.go(-1)
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
      clearInterval(this.timeOut)
      this.autoScrollCommon()
    },
    onMessage (evt) {
      var response = JSON.parse(evt.data)
      var data = response.data
      switch (response.prot) {
        // 历史聊天信息
        case 'TEACHER_QUESTION_LIST':
          this.chatList = data.list
          break
        case 'LIVECOURSE_LIST':
          this.openList = data.list
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
          this.userList = userList
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
          this.askTime = data.askTimeRate
          this.heartbeat()
          this.$msg({message: '已进入直播间！', type: 'success'})
          break

        case 'ENTER_ROOM_ERROR':
          this.$msg.error('进入直播间失败！')
          break
        case 'GETQUESTION':
          if (data.types === 1) {
            // 助教发言区
            this.chatList.push(data)
          } else if (data.types === 2) {
            // 公开区内容
            this.openList.push(data)
          }
          break
        case 'ASK':
          let askList = this.userList
          askList.map(function (item) {
            item.problem = -1
            return item
          })
          this.problemNum = 0
          this.userList = [ ...askList ]
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
    toOpenArea (index) {
      // 教师操作把学生问题指到公开区
      let sendInfo = this.chatList
      let thisSendInfo = sendInfo[index]
      let ndata = {
        prot: 'SENDQUESTION',
        data: {
          msg: thisSendInfo.msg,
          user_id: thisSendInfo.user_id,
          user_name: thisSendInfo.nickname,
          types: 2
        }
      }
      sendInfo[index].toOpen = true
      this.chatList = [ ...sendInfo ]
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
      if (num === 1) {
        // 助教发言区
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
    autoScrollCommon (role) {
      // role: 1:助教发言区， 2：公开区
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
    }
  },
  watch: {
    'chatList.length': function (val) {
      const chatScrollView = this.$refs.chatScrollView
      this.chatOldScrollHeight = chatScrollView.scrollHeight || 0 // 记录聊天列表位置变更之前的scrollHeight
      this.autoScrollCommon(1)
    },
    'openList': function (val) {
      const chatScrollViewQuse = this.$refs.chatScrollViewQuse
      this.chatOldScrollHeightQuse = chatScrollViewQuse.scrollHeight || 0 // 记录聊天列表位置变更之前的scrollHeight
      this.autoScrollCommon(2)
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
.classRoom-tit{
  background: #535353;
  color: #fff;
  line-height: 20px;
  padding: 0 15px;
  span{
    vertical-align: middle;
  }
}
.teacher{
  width: 1200px;
  margin: 0 auto 10px;
}
.change-btn{
  padding: 0 10px;
}
.change-btn span {
    background: #FF9800;
    text-align: center;
    font-size: 14px;
    display: inline-block;
    width: 90px;
    height: 30px;
    line-height: 30px;
    color: #fff;
    margin-bottom: 10px;
    cursor: pointer;
    &.video-mode {
      margin-right: 10px;
      background: #c1c1c1;
    }
}
.chat-content{
  background: #fff;
  padding: 10px;

  .left-chat{
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
  .right-seat{
    width: 580px;
  }
  .switch-content{
    min-height: 300px;
    max-height: 766px;
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
    height: 378px;
    overflow-y:auto;
    padding: 0 10px 10px;
    li{
      padding-bottom: 2px;
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
          width:25px;
          height:25px;
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
// 座位表
.switch-content{
  .qusetion-student{
    margin: 5px 0 10px;
    justify-content: space-between;
    font-size: 12px;
    line-height: 20px;
    padding: 0 10px;
  }
  .site-list{
    flex-wrap: wrap;
    li{
      cursor: pointer;
      width: 14.2%;
      overflow: hidden;
      position: relative;
      padding-top: 10px;
      .img-content{
        margin: 0 auto;
        height: 35px;
        overflow: hidden;
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
        line-height: 30px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
// 投屏模式
.dark-theme{
  background: #4a5259;
  color: #ccc;
  .el-breadcrumb__inner, .el-breadcrumb__inner a{
    color: #fff !important;
  }
  .change-btn span {
    background: #333;
    &.video-mode {
      background: #FF9800;
    }
  }
  .teacher, .chat-content{
    background: #000;
  }
  .classRoom-tit{
    font-size: 14px;
    height: 30px;
    line-height: 30px;
  }
  .chat-list li .assistant-name {
    font-size: 18px;
    line-height: 1.6;
    color: #ccc;
  }
  .chat-list li .speak .avatar{
    width: 32px;
    height: 32px;
  }
  .chat-list li .speak .content {
    font-size: 22px;
    .text{
      color: $sliver-color !important;
    }
  }
  .chat-list li .speak .content .user .plane {
    font-size: 18px;
  }
  .switch-content .qusetion-student {
    font-size: 14px;
  }
  .switch-content .site-list li p{
    color: #ccc;
  }
  .liveChat #scroll .liveStatus p, .liveChat #scroll2 .liveStatus p, .discuss-ul #scroll .liveStatus p, .discuss-ul #scroll2 .liveStatus p{
    background: #4a5259;
  }
}
</style>
