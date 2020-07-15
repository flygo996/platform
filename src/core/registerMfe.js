import {
  registerMicroApps,
  runAfterFirstMounted,
  setDefaultMountApp,
  addGlobalUncaughtErrorHandler,
  start,
  initGlobalState,
} from 'qiankun'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// import store from '../store'

// /**
//  * @name 导入render函数兼容qiakun1.0装载子应用方法，如果使用2.0container装载则不需要此方法,此处留着注释代码提供兼容qiankun1.0的示例
//  * @description 此处留下注释代码仅为提供兼容qiankun1.0示例
//  */
// // import render from './render';

// /**
//  * @name 导入想传递给子应用的方法，其他类型的数据皆可按此方式传递
//  * @description emit建议主要为提供子应用调用主应用方法的途径
//  */
// import emits from '../utils/emit'
// /**
//  * @name 导入qiankun应用间通信机制appStore
//  */
// import appStore from '../utils/app-store'
// /**
//  * @name 导入全局常量给子应用
//  */
// import GLOBAL from '../global'
/**
 * @name 声明子应用挂载dom，如果不需要做keep-alive，则只需要一个dom即可；
 */
const appContainer = '#subapp-viewport'

/**
 * @name 声明要传递给子应用的信息
 * @param data 主应要传递给子应用的数据类信息
 * @param emits 主应要传递给子应用的方法类信息
 * @param GLOBAL 主应要传递给子应用的全局常量
 * @param utils 主应要传递给子应用的工具类信息（只是一种方案）
 * @param components 主应要传递给子应用的组件类信息（只是一种方案）
 */
const props = {
  // data: store.getters,
  // emits,
  // GLOBAL,
}

/**
 * @name 启用qiankun微前端应用
 * @param {Array} list 应用注册表信息
 */
const qianKunStart = list => {
  /**
   * @name 处理子应用注册表数据
   */
  const apps = [] // 子应用数组盒子
  let defaultApp = null // 默认注册应用路由前缀
  const isDev = process.env.NODE_ENV === 'development' // 根据开发环境|线上环境加载不同entry
  list.forEach(o => {
    apps.push({
      name: o.module,
      entry: isDev ? o.devEntry : o.depEntry,
      container: appContainer,
      activeRule: o.routerBase,
      props: { ...props, routes: o.routes, routerBase: o.routerBase },
    })
    if (o.defaultRegister) defaultApp = o.routerBase
  })

  /**
   * @name 注册子应用
   * @param {Array} list subApps
   */
  registerMicroApps(apps, {
    beforeLoad: [
      app => {
        NProgress.start()
        console.log('[LifeCycle] beforeLoad... %c%s', 'color: green;', app.name)
        return Promise.resolve()
      },
    ],
    beforeMount: [
      app => {
        console.log('[LifeCycle] beforeMount... %c%s', 'color: green;', app.name)
      },
    ],
    afterUnmount: [
      app => {
        // 加载微应用前，进度条加载完成
        NProgress.done()
        console.log('[LifeCycle] afterUnmount... %c%s', 'color: green;', app.name)
      },
    ],
  })

  /**
   * @name 设置默认进入的子应用
   * @param {String} 需要进入的子应用路由前缀
   */
  setDefaultMountApp(`${defaultApp}/`)

  /**
   * @name 启动微前端
   */
  start()

  /**
   * @name 微前端启动进入第一个子应用后回调函数
   */
  runAfterFirstMounted(() => {
    console.log('runAfterFirstMounted...')
  })

  /**
   * @name 添加全局的未捕获异常处理器
   */
  addGlobalUncaughtErrorHandler(event => {
    console.error(event)
    const { message: msg } = event
    // 加载失败时提示
    if (msg && msg.includes('died in status LOADING_SOURCE_CODE')) {
      console.error('微应用加载失败，请检查应用是否可运行')
    }
  })

  /**
   * @name 启动qiankun应用间通信机制
   */
  // appStore(initGlobalState)
}

export default qianKunStart
