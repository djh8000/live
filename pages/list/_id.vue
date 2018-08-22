<template>
  <div class="list-content">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>全部直播</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="list-page flex j-s">
      <div class="left-page">
        <ul class="list-body-nav">
          <li style="color:white;">分类</li>
          <li  class="active" >
            <nuxt-link to="/list/0">全部</nuxt-link>
          </li>
          <li v-for="(item, index) in topCate" :key="item.id">
            <nuxt-link :to="'/list/' + item.id">{{item.name}}</nuxt-link></li>
          </li>
        </ul>
        <div class="list-down">
          <nav class="navlist">
            <span v-for="(item,index) in navList1" :class="{'active': item.key == getDt.sort}" @click="navEvent(1,item.key)">{{item.name}}</span>
          </nav>
          <nav class="navlist">
            <span v-for="(item,index) in navList2" :class="{'active': item.key == getDt.price}" @click="navEvent(2,item.key)">{{item.name}}</span>
          </nav>
        </div>
        <!-- 课程列表 -->
        <ul class="all-lesson">
          <li v-for="item in listData.lives" :key="item.id">
            <div class="list-img">
              <nuxt-link  target="_blank" :to="'/item?targetId='+ item.id">
                <img :src="item.img">
              </nuxt-link>
            </div>
            <div class="lesson-con">
              <div class="lesson-c-l">
                <nuxt-link  target="_blank" :to="'/item?targetId='+ item.id">
                  <p class="live-txt1">{{item.name}}</p>
                  <p class="live-txt2">{{item.subTitle}}</p>
                </nuxt-link>
                <p class="live-teach ">
                  <nuxt-link class="flex a-c"  target="_blank" :to="'/item?targetId='+ item.id">
                    <img :src="item.teacher.img">
                    <span>{{item.teacher.name}}</span>
                  </nuxt-link>
                </p>
                <div class="live-play no-live-play">
                  <spinner :isLive="item.started == 1"></spinner>
                  <span v-if="item.started == 1" class="isLive">
                    正在直播...
                  </span>
                  <span v-else class="play-txt">
                    {{item.newTime}}
                  </span>
                </div>
              </div>
              <div class="lesson-c-r">
                <span v-if="item.price > 0" class="live-type">￥{{item.price}}</span>
                <span v-else class="live-type">免费</span>
                <span class="live-num">已预约{{item.appointNum}}人</span>
                <div v-if="item.isLogin === 1" class="out-login">
                  <!-- 登陆 -->
                  <nuxt-link v-if="item.status === 5" target="_blank" class="btnColor1" :to="'/item?targetId='+ item.id">已关闭</nuxt-link>
                  <div v-else-if="item.hasBuy === 1" class="out-ifbuy">
                    <!-- 已购买 -->
                    <div v-if="item.isEnter === 1" class="isEnter">
                        <nuxt-link target="_blank" class="btnColor3" :to="'/item?targetId='+ item.id">去上课</nuxt-link>
                    </div>
                    <div v-else class="isEnter">
                      <nuxt-link target="_blank" class="btnColor1" v-if="item.status === 0 " :to="'/item?targetId='+ item.id">已预约</nuxt-link>
                      <nuxt-link target="_blank" class="btnColor1" v-if="item.status === 2 " :to="'/item?targetId='+ item.id">回放准备中</nuxt-link>
                      <nuxt-link target="_blank" class="btnColor2" v-if="item.status === 3 " :to="'/item?targetId='+ item.id">查看回放</nuxt-link>
                    </div>
                  </div>
                  <div v-else class="out-ifbuy">
                    <!-- 未购买 -->
                    <nuxt-link target="_blank" class="btnColor2" :to="'/item?targetId='+ item.id">预约</nuxt-link>
                  </div>
                </div>
                <div v-if="item.isLogin === 0" class="out-login">
                  <!-- 未登陆 -->
                  <nuxt-link target="_blank" v-if="item.status === 1" class="btnColor1" :to="'/item?targetId='+ item.id">预约</nuxt-link>
                  <nuxt-link target="_blank" v-else class="btnColor1" :to="'/item?targetId='+ item.id">进入直播</nuxt-link>
                </div>
              </div>
            </div>
          </li>
        </ul>
        <!-- 课程列表   end -->
        <div class="page-burster flex j-c">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              background
              :page-size="getDt.pagenum"
              :current-page="getDt.page"
              layout="prev, pager, next, jumper"
              :total="listData.total || 0">
            </el-pagination>
          </div>
      </div>
      <div class="right-page">
        <courseRecommen flexWay="vertical" :courseList="courseData"></courseRecommen>
      </div>
    </div>
  </div>
</template>

<script>
import spinner from '~/components/spinner.vue'
import {mapState} from 'vuex'
import courseRecommen from '~/components/courseRecommen.vue'
export default {
  data () {
    return {
      courseData: [],
      getDt: {
        top: 0,
        sort: '1',
        price: '0',
        page: 1,
        pagenum: 10
      },
      navList1: [
        {
          name: '最新',
          key: '1'
        },
        {
          name: '推荐',
          key: '2'
        },
        {
          name: '热门',
          key: '3'
        }
      ],
      navList2: [
        {
          name: '全部',
          key: '0'
        },
        {
          name: '免费公开课',
          key: '1'
        },
        {
          name: '付费精品课',
          key: '2'
        }
      ]
    }
  },
  components: {
    spinner, courseRecommen
  },
  methods: {
    // 分页
    handleSizeChange (val) {
    },
    handleCurrentChange (val) {
      const getDt = {
        ...this.getDt,
        page: val
      }
      this.getDt = getDt
      this.getList()
    },
    getList () {
      const listPage = {
        data: {...this.getDt},
        str: 'Live/liveListPage'
      }
      this.$axios.$post('api/' + listPage.str, listPage.data).then(res => {
        this.listData = res
      })
    },
    navEvent (type, id) {
      if (type === 1) {
        const getDt = {
          ...this.getDt,
          page: 1,
          sort: id
        }
        this.getDt = getDt
      } else {
        const getDt = {
          ...this.getDt,
          page: 1,
          price: id
        }
        this.getDt = getDt
      }
      this.getList()
    }
  },
  asyncData ({ $axios, params }) {
    const { id } = params
    const getDt = {
      top: id,
      sort: '1',
      price: 'all',
      page: 1,
      pagenum: 10
    }
    const listPage = {
      data: {...getDt},
      str: 'Live/liveListPage'
    }
    const coursePage = {
      data: {liveId: 0},
      str: 'Live/recommendCourse'
    }
    return Promise.all([
      $axios.$post('api/' + listPage.str, listPage.data),
      $axios.$post('api/' + coursePage.str, coursePage.data)
    ]).then(([data, courseData]) => {
      return {
        listData: data,
        courseData: courseData.recommandList
      }
    })
  },
  computed: {
    ...mapState([
      'topCate'
    ])
  },
  mounted () {
    let getDt = this.getDt
    getDt.top = this.$route.params.id
    this.getDt = {
      ...getDt
    }
  }
}
</script>
<style lang="scss">
.list-page{
  overflow: hidden;
  background: #fff;
  padding:20px;
  width: 100%;
  .left-page{
    width: 902px;
  }
  .right-page{
    flex-shrink: 0;
    width: 240px;
  }
}
// 子导航
.list-body-nav {
  height: 50px;
  line-height: 50px;
  background-color: $master-color;
}
.list-body-nav li {
  float: left;
  padding: 0 15px;
}
.list-body-nav li a {
  color: #fff;
  height: 50px;
  display: block;
  position: relative;
  font-size: 14px;
}
.list-body-nav li a:hover {
  color: #333;
}
.list-body-nav li a:before {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 50%;
  -webkit-transform: translate(-50%, 0);
  -ms-transform: translate(-50%, 0);
  transform: translate(-50%, 0);
  width: 0px;
  height: 2px;
  -webkit-transition: all 0.3s ease;
  -o-transition: all 0.3s ease;
  transition: all 0.3s ease;
  background: #333;
}
.list-body-nav li:first-child a{
  font-weight: bold;
}
.list-body-nav .nuxt-link-exact-active{
  // background: #333;
}
.list-body-nav .nuxt-link-exact-active {
  color: #333;
  font-weight: bold;
}
.list-body-nav .nuxt-link-exact-active:before {
  width: 42px;
}
// 筛选
.list-down {
  position: relative;
  border: solid 1px #eeeeee;
  padding: 24px 0 24px 54px;
}
.list-down:before {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 33px;
  content: '';
  width: 2px;
  height: 38px;
  background-color: #dcdcdc;
}
.list-down nav {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  line-height: 1;
}
.list-down nav:first-child {
  margin-bottom: 10px;
}
.list-down nav span {
  margin-right: 20px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    color: #22d3b7;
    text-decoration: none;
    transition: all 0.3s;
  }
}
.list-down .active {
  color: #22d3b7;
}
// 课程列表
.all-lesson {
  margin-top: 28px;
}
.all-lesson li {
  height: 162px;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  border: solid 1px #e5e5e5;
  margin-bottom: 18px;
}
.all-lesson li:hover {
  transform: translateY(-3px);
  -webkit-transform: translateY(-3px);
  -moz-transform: translateY(-3px);
  box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);
  -webkit-box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);
  -moz-box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);
  -webkit-transition: all 0.3s ease;
  -moz-transition: all 0.3s ease;
  -o-transition: all 0.3s ease;
  transition: all 0.3s ease;
}
.all-lesson .list-img {
 width: 284px;
}
.all-lesson .list-img img {
  height: 160px;
  width: 100%;
}
.all-lesson .lesson-con {
  font-size: 12px;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  padding: 0  58px 0 21px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.all-lesson .lesson-c-l a:hover {
  color: #474747;
}
.all-lesson .lesson-c-l .live-txt1 {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 1;
overflow: hidden;
}
.all-lesson .lesson-c-l .live-txt2 {
  color: #818181;
  font-size: 12px;
  display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 1;
overflow: hidden;
min-height: 17px;
margin-top: 5px;
}
.all-lesson .lesson-c-l .live-teach {
  margin: 22px 0 20px;
}
.all-lesson .lesson-c-l .live-teach img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}
.all-lesson .lesson-c-l .live-play {
  line-height: 1;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  color: #22d3b7;
}
.all-lesson .lesson-c-l .live-play p {
  margin: 0;
}
.all-lesson .lesson-c-l .live-play .play-txt {
  margin-top: 2px;
  margin-left: 16px;
}
.all-lesson .lesson-c-l .no-live-play {
  color: #474747;
}
.all-lesson .lesson-c-r {
  text-align: center;
}
.all-lesson .lesson-c-r span,
.all-lesson .lesson-c-r a {
  display: block;
}

.all-lesson .lesson-c-r .live-type {
  font-size: 16px;
  font-weight: bold;
  margin-top: 21px;
}
.all-lesson .lesson-c-r .live-num {
  margin: 26px 0 35px;
}
.all-lesson .lesson-c-r a {
  width: 86px;
  height: 24px;
  font-weight: bold;
  border-radius: 2px;
  display: inline-block;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
  color: #fff;

}
.all-lesson .lesson-c-r .btnColor1{
  background-color: #292c40;
}
.all-lesson .lesson-c-r .btnColor2{
  background-color: $master-color;
}
.all-lesson .lesson-c-r .btnColor3{
  background-color: #ffc000;
}
.all-lesson .live-status{
  display: none;
}
.all-lesson .isLive{
  color: $master-color;
  margin-left: 16px;
}
// 课程推荐
.list-page{
  .right-page {
    float: right;
  }
  .right-page ul li {
    width: 240px;
    border: solid 1px #e5e5e5;
    margin-bottom: 20px;
  }
  .right-page ul li a {
    display: block;
    position: relative;
    overflow: hidden;
  }
  .right-page ul li a:before {
    content: '';
    -webkit-transform: skewx(-25deg);
    -ms-transform: skewx(-25deg);
    transform: skewx(-25deg);
    background-image: -webkit-gradient(linear, left bottom, left top, from(rgba(255, 255, 255, 0)), color-stop(rgba(255, 255, 255, 0.7)), to(rgba(255, 255, 255, 0)));
    background-image: -webkit-linear-gradient(bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0));
    background-image: -o-linear-gradient(bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0));
    background-image: linear-gradient(0deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0));
    position: absolute;
    left: -120%;
    top: 0px;
    width: 100%;
    height: 100%;
    display: block;
  }
  .right-page ul li a:hover:before {
    left: 120%;
    transition: all .5s;
  }
  .right-page ul li a:hover p {
    /* color: @color; */
  }
  .right-page ul li p {
    -webkit-transition: all 0.3s ease;
    -o-transition: all 0.3s ease;
    transition: all 0.3s ease;
    height: 38px;
    color: #2d2d2d;
    font-size: 12px;
    line-height: 38px;
    text-align: center;
  }
  .right-page ul li a img {
      width: 248px;
  }
}
</style>