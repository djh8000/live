<template>
  <div class="list-content">
    <section>
      <div class="search-item flex a-c j-c">
        <div class="out-search">
          <el-autocomplete
            @keyup.enter.native="searchUp()"
            placeholder="请输入搜索内容"
            :fetch-suggestions="querySearch"
            @select="handleSelect"
            v-model="searchKey">
            <i  @click="searchUp()" slot="suffix" class="el-input__icon el-icon-search"></i>
          </el-autocomplete>
        </div>
      </div>
    </section>
    <div class="list-page-search flex j-s">
      <div class="left-info">
        <div class="left-page content-shadow">
          <div class="tips" v-if="getDt.keyword">
             为您找到<span class="red">{{listData.total}}</span>条“{{getDt.keyword}}”及其相关<span>直播</span>
          </div>
          <div v-else class="tips">亲，请输入搜索内容后再来搜索哟！</div>
          <ul class="live-list">
            <li v-for="item in listData.res" class="flex">
              <div class="left-info">
                 <nuxt-link :to="'/item?targetId='+ item.id">
                    <img :src="item.img">
                 </nuxt-link>
              </div>
              <div class="right-info">
                <div class="title">
                  <nuxt-link class="elis" :to="'/item?targetId='+ item.id" v-html="item.name">
                  </nuxt-link>
                </div>
                <div class="des elis">{{item.subTitle}}</div>
                <div class="price">
                  <div class="item now">
                    <span v-if="item.price > 0"><em>现价：</em>￥{{item.price}}</span>
                    <span v-else>
                      免费
                    </span>
                  </div>
                </div>
                <div class="num">
                  <div class="item">
                    <span class="LIVEFONT">&#xe71e;</span>
                    <em>{{item.appointNum}}</em>
                  </div>
                  <div class="item">
                    <span class="LIVEFONT">&#xe604;</span>
                    <em>{{item.playTime}}</em>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div class="page-burster flex j-c">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              background
              :page-size="getDt.limit"
              :current-page="getDt.page"
              layout="prev, pager, next, jumper"
              :total="listData.total || 0">
            </el-pagination>
          </div>
          <div class="others-tit flex j-s a-c">
            <div class="left-info flex a-c">
              <span class="LIVEFONT">&#xe600;</span>
              <em>大家都在搜索</em>
            </div>
             <nuxt-link to="/list/0"  class="right-info flex a-c">
              <span class="LIVEFONT">&#xe680;</span>
              <em>更多</em>
            </nuxt-link>
          </div>
          <ul class="search-others flex">
            <li v-for="item in hitList">
              <nuxt-link :to="'/item?targetId='+ item.id" >
                <img :src="item.img">
              </nuxt-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="right-info">
        <div class="right-page content-shadow">
          <div class="recommend-title">
            推荐直播
          </div>
          <ul class="recommend-list">
            <li v-for="item in recommendList">
              <nuxt-link :to="'/item?targetId='+ item.id" >
                <div class="top-img">
                  <img :src="item.img">
                </div>
                <h4>{{item.name}}</h4>
                <div class="course-info flex j-s a-c">
                  <div class="left-info">{{item.price > 0 ? '￥'+item.price : '免费'}}</div>
                  <div class="right-info">
                    <span class="LIVEFONT">&#xe71e;</span>
                    <em>{{item.totalNum}}</em>
                  </div>
                </div>
              </nuxt-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'home',
  data () {
    return {
      hitList: [],
      recommendList: [],
      listData: '',
      searchKey: '',
      getDt: {
        type: 5,
        page: 1,
        limit: 10,
        keyword: '' // 关键字
      },
      searchList: []
    }
  },
  computed: {
  },
  methods: {
    // 判断是否重复包含字段
    ifHave () {
      for (let i = 0; i < this.searchList.length; i++) {
        if (this.searchKey === this.searchList[i].value) {
          return true
        }
      }
      return false
    },
    // 搜索
    searchUp () {
      // 存缓存
      let newlist = [...this.searchList]
      let ifHaveKey = this.ifHave()
      if (!ifHaveKey && this.searchKey) {
        if (this.searchList.length < 10) {
          newlist.unshift({'value': this.searchKey})
        } else {
          newlist.pop()
          newlist.unshift({'value': this.searchKey})
        }
      }
      this.searchList = [...newlist]
      localStorage.setItem('searchList', JSON.stringify(this.searchList))
      this.$router.push({path: '/search', query: {keyword: this.searchKey}})
    },
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
        data: {
          ...this.getDt
        },
        str: 'Live/LiveSearch'
      }
      this.$axios.$post('api/' + listPage.str, listPage.data).then(res => {
        this.listData = res
      })
    },
    // 测试
    querySearch (queryString, cb) {
      var searchList = this.searchList
      var results = queryString ? searchList.filter(this.createFilter(queryString)) : searchList
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (searchList) => {
        return (searchList.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect (item) {
      this.searchUp()
      // console.log(item)
    },
    handleIconClick (ev) {
      // console.log(ev)
    },
    // 获取缓存
    getApplication () {
      let searchList = localStorage.getItem('searchList') || []
      if (searchList.length > 0) {
        searchList = JSON.parse(searchList)
      }
      this.searchList = [
        ...searchList
      ]
    }
  },
  asyncData ({ $axios, query }) {
    const { keyword = '' } = query
    const getDt = {
      type: 5,
      page: 1,
      limit: 10
    }
    const listPage = {
      data: {
        ...getDt,
        keyword
      },
      str: 'Live/LiveSearch'
    }
    const coursePage = {
      data: {liveId: 0},
      str: 'Live/searchRecommend'
    }
    return Promise.all([
      $axios.$post('api/' + listPage.str, listPage.data),
      $axios.$post('api/' + coursePage.str, coursePage.data)
    ]).then(([data, courseData]) => {
      return {
        listData: data,
        hitList: courseData.hitList,
        recommendList: courseData.recommendList
      }
    })
  },
  watch: {
    '$route' (to, from) {
      let getDt = this.getDt
      getDt.keyword = this.$route.query.keyword
      this.getDt = {
        ...getDt
      }
      this.searchKey = this.$route.query.keyword
      this.getList()
      // 取缓存
      this.getApplication()
    }
  },
  mounted () {
    let getDt = this.getDt
    getDt.keyword = this.$route.query.keyword
    this.getDt = {
      ...getDt
    }
    this.searchKey = this.$route.query.keyword
    // 取缓存
    this.getApplication()
  }
}
</script>
<style lang="scss">
.content-shadow{
    -webkit-border-radius: 2px;
    -moz-border-radius: 2px;
    border-radius: 2px;
    -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    -moz-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
}
.list-page-search{
  overflow: hidden;
  padding:20px;
  width: 1200px;
  margin: 30px auto;
  min-height: 400px;
  .left-page{
    width: 860px;
    background: #fff;
    padding: 15px;
  }
  .tips{
    background: #fdfaf2;
    box-sizing: border-box;
    padding: 10px 15px;
    margin-bottom: 15px;
    font-size: 14px;
  }
  .tips .red {
    color: #db1923;
  }
  .right-info{
    flex-shrink: 0;
  }
  .right-page{
    width: 280px;
    padding: 15px;
    padding-right: 0;
    background: #fff;
  }
}
.search-item {
    height: 200px;
    background: url('/assets/img/pic.jpg');
}
.live-list{
  li{
    border-bottom: 1px solid #f0f0f0;
    overflow: hidden;
    padding-bottom: 10px;
    margin-bottom: 10px;
    transition: all 0.3s ease 0s;
    -webkit-transition: all 0.3s ease 0s;
    -moz-transition: all 0.3s ease 0s;
    -o-transition: all 0.3s ease 0s;
    -ms-transition: all 0.3s ease 0s;
    &:hover {
      box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);
      transform: translateY( -6px);
      -webkit-transform: translateY( -6px);
      -moz-transform: translateY( -6px);
      -ms-transform: translateY( -6px);
      -o-transform: translateY( -6px);
    }
  }
  .left-info{
    width: 260px;
    height: 146px;
    flex-shrink:0;
    img{
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .right-info{
    padding-left: 30px;
    padding-right: 10px;
    .title{
      font-size: 20px;
      margin: 10px 0;
      a {
        height: 26px;
        width: 540px;
        display: block;
        color: #313131;
        .c_color{
          color: red;
        }
      }
    }
    .des{
      font-size: 14px;
      height: 20px;
      width: 540px;
      display: block;
    }
    .item {
      display: inline-block;
      margin: 10px 15px 10px 0;
      color: #999;
      overflow: hidden;
      font-size: 14px;
    }
    .price .now span {
      color: #f20606;
      font-size: 16px;
      em{
        color: #999;
        font-size: 14px;
      }
    }
    .num{
      .item span{
        margin-right: 5px;
      }
    }
  }
}
// 大家都在搜索
.others-tit{
  font-size: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4ecf3;
  margin: 20px 0;
  span{
    color: #cf010e;
    font-size: 16px;
    vertical-align: middle;
    margin-right: 5px;
  }
}
.search-others{
  flex-wrap: wrap;
  li{
    width: 196px;
    height: 110px;
    margin-right: 15px;
    margin-bottom: 15px;
    a{
      height: 100%;
      display: block;
      transition: all 0.3s ease 0s;
      -webkit-transition: all 0.3s ease 0s;
      -moz-transition: all 0.3s ease 0s;
      -o-transition: all 0.3s ease 0s;
      -ms-transition: all 0.3s ease 0s;
      border: 1px solid #e4ecf3;
      border-radius: 4px;
      &:hover {
        box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);
        transform: translateY( -6px);
        -webkit-transform: translateY( -6px);
        -moz-transform: translateY( -6px);
        -ms-transform: translateY( -6px);
        -o-transform: translateY( -6px);
      }
    }
    &:nth-child(4n){
      margin-right: 0;
    }
    img{
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}
// 推荐直播
.recommend-title {
  font-size: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4ecf3;
  margin-bottom: 10px;
}
.recommend-list{
  li{
    width: 250px;
    border-bottom: 1px solid #f0f0f0;
    overflow: hidden;
    padding-bottom: 10px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s ease 0s;
    -webkit-transition: all 0.3s ease 0s;
    -moz-transition: all 0.3s ease 0s;
    -o-transition: all 0.3s ease 0s;
    -ms-transition: all 0.3s ease 0s;
    &:hover {
      box-shadow: 0 26px 40px -24px rgba(0, 36, 100, 0.3);
      transform: translateY( -6px);
      -webkit-transform: translateY( -6px);
      -moz-transform: translateY( -6px);
      -ms-transform: translateY( -6px);
      -o-transform: translateY( -6px);
    }
    .top-img{
      height: 141px;
      img{
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    h4{
      font-size: 18px;
      margin: 10px 0;
    }
    .course-info{
      line-height: 40px;
      .left-info{
        color: #f20606;
        font-size: 16px;
      }
      .right-info{
        color: #999;
        span{
          font-size: 14px;
          margin-right: 5px;
        }
      }
    }
  }
}
</style>