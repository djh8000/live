<template>
  <div class="course-content flex">
    <ul :class="[flexWay === 'vertical'? 'vertical' : 'horizontal', moreStyle === 'moreWidth'? 'moreWidth' : '']">
      <li v-for=" (item, index) in courseList" :key="index">
        <a target="_blank" :href="item.href">
          <div class="list-avator">
              <img :src="item.src">
          </div>
          <p>{{item.alt}}</p>
          </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  props: ['flexWay', 'moreStyle', 'courseList'],
  computed: {
  },
  mounted () {
  },
  updated () {
  }
}
</script>

<style lang="scss">
  .course-content ul.vertical{
    display: block;
    li:last-child{
      margin-bottom: 0;
    }
  }
  .course-content ul.horizontal{
    display: flex;
    flex-wrap: wrap;
    li{
      width: 263px;
      margin-right: 15px;
      margin-bottom: 20px;
      &:nth-child(4n) {
        margin-right: 0;
      }
      img{
        width: 261px;
        height: 147px;
      }
    }
    &.moreWidth li{
      width: 273px;
      margin-right: 22px;
      &:nth-child(4n) {
        margin-right: 0;
      }
      img{
        width: 271px;
        height: 152.4px;
      }
    }
  }
  .course-content ul li {
    border: solid 1px #e5e5e5;
    margin-bottom: 20px;
  }
  .course-content ul li a {
    display: block;
    position: relative;
    overflow: hidden;
  }
  .course-content ul li a:before {
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
  .course-content ul li a:hover:before {
    left: 120%;
    transition: all .5s;
  }
  .course-content ul li a:hover p {
    /* color: @color; */
  }
  .course-content ul li p {
    -webkit-transition: all 0.3s ease;
    -o-transition: all 0.3s ease;
    transition: all 0.3s ease;
    height: 38px;
    color: #2d2d2d;
    font-size: 12px;
    line-height: 38px;
    text-align: center;
  }
  .course-content ul li a img {
      width: 248px;
      height: 139.5px;
      display: block;
  }
</style>