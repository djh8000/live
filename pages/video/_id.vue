<template>
  <div class="video">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{videoData.name}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="video-wrap"></div>
    <!-- 课程推荐 -->
    <div class="course-recommon">
      <div class="piece-header">课程推荐</div>
      <courseRecommen flexWay="horizontal" :courseList="courseData"></courseRecommen>
    </div>
  </div>
</template>

<script>
import courseRecommen from '~/components/courseRecommen.vue'
export default {
  data () {
    return {
      player: Object,
      videoData: '',
      videoName: '',
      courseData: []
    }
  },
  components: {
    courseRecommen
  },
  mounted () {
    this.getVid()
    this.getCourse()
  },
  methods: {
    playVideo (vid, playsafe, sign, ts) {
      this.players = window.polyvPlayer({
        wrap: '.video-wrap',
        width: '100%',
        height: '100%',
        autoplay: true,
        playsafe: playsafe,
        vid: vid,
        sign: sign,
        ts: ts
      })
    },
    getWebPolyToken (vid) {
      this.$axios.$post('api/course/getWebPolyToken', {vid: vid})
        .then(res => {
          if (res) {
            this.playVideo(vid, res.playsafe, res.sign, res.ts)
          } else {
            this.$msg('视屏出错')
          }
        })
    },
    getVid () {
      this.players && this.players.destroy()
      this.$axios.$post('api/Live/getPlayback', {liveId: this.$route.params.id})
        .then(res => {
          if (res) {
            this.videoData = res
            this.getWebPolyToken(this.videoData.vid)
          } else {
            this.$msg('视屏出错')
          }
        })
    },
    getCourse () {
      this.$axios.$post('api/Live/recommendCourse', {liveId: this.$route.params.id})
        .then(res => {
          this.courseData = res.recommandList
        })
    }
  }
}
</script>

<style lang="scss" scoped>
   .video{
    padding: 0 30px;
  }
  .video-wrap{
    width: 100%;
    height:640px;
    background: #666;
  }
  .course-recommon{
    margin-top: 30px;
    background-color: #fff;
    padding: 5px 20px;
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
