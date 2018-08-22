import Vue from 'vue'
import md5 from 'js-md5'

export default ({ store, req }, inject) => {
  const httpconfig = {
    ksort (inputArr, sortFlags) {
      var tmpArr = {}
      var keys = []
      var sorter = ''
      var i = ''
      var k = ''
      var that = this
      var strictForIn = false
      var populateArr = {}
      switch (sortFlags) {
        case 'SORT_STRING':
          // compare items as strings
          sorter = function (a, b) {
            return that.strnatcmp(a, b)
          }
          break
        case 'SORT_LOCALE_STRING':
          // compare items as strings, original by the current locale (set with  i18n_loc_set_default() as of PHP6)
          var loc = this.i18n_loc_get_default()
          sorter = this.php_js.i18nLocales[loc].sorting
          break
        case 'SORT_NUMERIC':
          // compare items numerically
          sorter = function (a, b) {
            return a + 0 - (b + 0)
          }
          break
        // case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
          sorter = function (a, b) {
            var aFloat = parseFloat(a)
            var bFloat = parseFloat(b)
            var aNumeric = aFloat + '' === a
            var bNumeric = bFloat + '' === b
            if (aNumeric && bNumeric) {
              return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0
            } else if (aNumeric && !bNumeric) {
              return 1
            } else if (!aNumeric && bNumeric) {
              return -1
            }
            return a > b ? 1 : a < b ? -1 : 0
          }
          break
      }

      // Make a list of key names
      for (k in inputArr) {
        if (inputArr.hasOwnProperty(k)) {
          keys.push(k)
        }
      }
      keys.sort(sorter)
      // BEGIN REDUNDANT
      this.php_js = this.php_js || {}
      this.php_js.ini = this.php_js.ini || {}
      // END REDUNDANT
      strictForIn =
        this.php_js.ini['phpjs.strictForIn'] &&
        this.php_js.ini['phpjs.strictForIn'].local_value &&
        this.php_js.ini['phpjs.strictForIn'].local_value !== 'off'
      populateArr = strictForIn ? inputArr : populateArr

      // Rebuild array with sorted key names
      for (i = 0; i < keys.length; i++) {
        k = keys[i]
        tmpArr[k] = inputArr[k]
        if (strictForIn) {
          delete inputArr[k]
        }
      }
      for (i in tmpArr) {
        if (tmpArr.hasOwnProperty(i)) {
          populateArr[i] = tmpArr[i]
        }
      }
      return strictForIn || populateArr
    },
    sign (obj) {
      const myObject = this.ksort(obj)
      const str = []
      for (let key in myObject) {
        str.push(myObject[key])
      }
      return md5(str.join('#!0O*&'))
    },
    prodata (data, type) {
      var _arr = {
        sign: '',
        data: ''
      }
      var pubdata = {
        platform: this.browserRedirect(),
        channel: 2,
        version: '1.0',
        unique_id: md5('live')
      }
      const { state } = store
      if (state.loginState === 1) {
        pubdata['user_id'] = state.user_id
        pubdata['token'] = state.token
      } else {
        pubdata['user_id'] = 0
        pubdata['token'] = 0
      }
      var _arrData = Object.assign({}, pubdata, data)
      _arr.sign = this.sign(_arrData)
      if (type === 'live') {
        _arr.data = _arrData
      } else {
        _arr.data = JSON.stringify(_arrData)
      }
      return _arr
    },
    browserRedirect () {
      let flag = false
      let name = [
        'ipad',
        'iphone os',
        'midp',
        'rv:1.2.3.4',
        'ucweb',
        'android',
        'windows ce',
        'windows mobile'
      ]
      var sUserAgent = process.server
        ? req.headers['user-agent'].toLowerCase()
        : navigator.userAgent.toLowerCase()
      for (let i = 0; i < name.length; i++) {
        var re = new RegExp(name[i], 'i')
        if (sUserAgent.match(re)) {
          if (sUserAgent.match(re)[0] === name[i]) {
            flag = true
            break
          }
        }
      }
      if (flag) {
        return '5'
      } else {
        return '4'
      }
    }
  }
  inject('sign', new Vue({
    methods: {
      prodata (...args) {
        return httpconfig.prodata(...args)
      }
    }
  }))
}
