<template>
  <div class="header">
    <div class="h-content">
      <div class="h-l">
        <a href="http://www.zejicert.cn">
          <img class="logo" src="../assets/img/logo.png" alt="">
        </a>
        <nav>
          <nuxt-link to="/">首页</nuxt-link>
          <a href="http://www.zejicert.cn">泽稷网校</a>
        </nav>
      </div>
      <div class="right-header flex a-c">
        <div class="search-content" :class="[focusStatus? 'search-content-active' : '']">
          <el-input
            placeholder="搜索"
            @focus="getFocus()"
            @keyup.enter.native="searchTo()"
            @blur="getblur()"
            v-model="search">
            <i @click="searchTo()" slot="suffix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <el-dropdown size="small" class="user" v-if="loginState == 1">
          <img :src="userInfo.smallAvatar">
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item disabled>{{userInfo.name}}</el-dropdown-item>
            <el-dropdown-item @click.native="loginOut">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="login" v-else>
          <span @click="goLogin">登录/注册</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  data () {
    return {
      name: 0,
      focusStatus: false,
      search: '',
      searchListnav: []
    }
  },
  computed: {
    ...mapState([
      'loginState',
      'userInfo',
      'url'
    ])
  },
  methods: {
    // 去登录
    goLogin () {
      const url = window.location.href
      window.location.href = this.url.uchttp + '?fromUrl=' + url
    },
    loginOut () {
      this.$axios.$post(this.url.ucapi + 'user/logout', {})
        .then(res => {
          this.$store.commit('TOKENVERIFY', {
            loginState: 0
          })
          location.reload()
        }).catch(() => {
          this.$store.commit('TOKENVERIFY', {
            loginState: 0
          })
          window.reload()
        })
    },
    // 获取焦点
    getFocus () {
      this.focusStatus = true
    },
    getblur () {
      this.focusStatus = false
    },
    // 判断是否重复包含字段
    ifHavenav () {
      for (let i = 0; i < this.searchListnav.length; i++) {
        if (this.search === this.searchListnav[i].value) {
          return true
        }
      }
      return false
    },
    // 搜索
    searchTo () {
      // 存缓存
      let newlistnav = [...this.searchListnav]
      let ifHavenav = this.ifHavenav()
      if (!ifHavenav && this.search) {
        if (this.searchListnav.length < 10) {
          newlistnav.unshift({'value': this.search})
        } else {
          newlistnav.pop()
          newlistnav.unshift({'value': this.search})
        }
      }
      this.searchListnav = [...newlistnav]
      localStorage.setItem('searchList', JSON.stringify(this.searchListnav))
      this.$router.push({path: '/search', query: {keyword: this.search}})
    },
    // 获取缓存
    getApplicationNav () {
      let searchListnav = localStorage.getItem('searchList') || []
      if (searchListnav.length > 0) {
        searchListnav = JSON.parse(searchListnav)
      }
      this.searchListnav = [
        ...searchListnav
      ]
    }
  },
  watch: {
    '$route' (to, from) {
      // 取缓存
      this.getApplicationNav()
      this.search = ''
    }
  },
  mounted () {
    // 取缓存
    this.getApplicationNav()
  }
}
</script>

<style lang="scss" scoped>
  .header{
    background-color: #212121;
    .h-content{
      height: 60px;
      width:1200px;
      margin:0 auto;
      display: flex;
      align-items:center;
      justify-content: space-between;
      color:#c1c1c1;
      .h-l{
        display: flex;
        align-items:center;
        img.logo{
          height:50px;
          margin:0 20px;
        }
        nav{
          font-size: 18px;
          a{
            color:#c1c1c1;
            padding:18px 20px;
            transition: all .2;
            &:hover{
              color:#fff;
            }
          }
          a.nuxt-link-active{
            color:#fff;
          }
        }
      }
      .user{
        padding:0 20px;
        display: flex;
        align-items:center;
        cursor: pointer;
        img{
          width:38px;
          height:38px;
          border-radius: 50%;
        }
      }
      .login{
        font-size: 16px;
        span{
          color:#fff;
          cursor: pointer;
        }
      }
    }
  }
  .search-content{
    margin-right: 20px;
    width: 100px;
    -webkit-transition: all 0.3s ease;
    -moz-transition: all 0.3s ease;
    -o-transition: all 0.3s ease;
    transition: all 0.3s ease;
  }
  .search-content-active{
      width: 150px;
  }
</style>