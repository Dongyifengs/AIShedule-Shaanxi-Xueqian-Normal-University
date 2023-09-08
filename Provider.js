/**
 * @Author: MoYiJiangNan
 * @Date：2023/09/08
 * @LastEditTime：2023/09/08
 * @LastEditors：MoYiJiangNan
 * @QQ: 1545929126
 * @WeChat: Dong_Yi_feng305000
 * @Email: 1545929126@qq.com
 * @Description: 课程表导入脚本
 * @Version: 1.0.0
 * **/
// Description: 课程表导入脚本
/**
 * loading函数
 * @param {*} param0
 */
function AIScheduleLoading({
                               titleText = '加载中',
                               contentText = 'loading...',
                           } = {}) {
    console.log('start......')
    AIScheduleComponents.addMeta()
    const title = AIScheduleComponents.createTitle(titleText)
    const content = AIScheduleComponents.createContent(contentText)
    const card = AIScheduleComponents.createCard([title, content])
    const mask = AIScheduleComponents.createMask(card)

    let dyn
    let count = 0
    function dynLoading() {
        if (count == 4) count = 0
        content.innerText = contentText + '.'.repeat(count++)
        // console.log(contentText + '.'.repeat(count))
    }

    this.show = () => {
        console.log('show......')
        document.body.appendChild(mask)
        dyn = setInterval(dynLoading, 1000)
    }
    this.close = () => {
        document.body.removeChild(mask)
        clearInterval(dyn)
    }
}
/**
 * 请求方法
 * @param {*} method
 * @param {*} data
 * @param {*} url
 * @param {*} text
 * @returns
 */
async function request(method, data, url, text) {
    let loading = null
    if (!!text) {
        loading = new AIScheduleLoading({ contentText: text })
        loading.show()
    }
    return await fetch(url, {
        method: method,
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
        .then((v) => v.text())
        .then((v) => {
            !!loading && loading.close()
            return v
        })
        .catch((v) => {
            !!loading && loading.close()
            return v
        })
}
/*******
 * @description: 加载工具函数
 * @param {*} 需要加载工具的网址
 * @return {*}
 */
let loadTools = async (url) => {
    let jsStr = await request('get', null, url)
    console.log(jsStr)
    window.eval(jsStr)
}

function encrypt(content, key) {
    var sKey = AesJS.enc.Utf8.parse(key)
    var sContent = AesJS.enc.Utf8.parse(content)
    var encrypted = AesJS.AES.encrypt(sContent, sKey, {
        mode: AesJS.mode.ECB,
        padding: AesJS.pad.Pkcs7,
    })
    return encrypted.toString()
}

/*******
 * @description: 将html字符串转化为DOM
 * @param {*} text HTML字符串
 * @return {*} DOM
 */
let textToDom = (text) => {
    let parser = new DOMParser()
    return parser.parseFromString(text, 'text/html')
}

/*******
 * @description: 获取验证码,并将验证码添加到AISchedulePrompt中
 * @param {*} url 验证码url
 */
let addImg = (url) => {
    let addInterval = setInterval(addFun, '100')
    function addFun() {
        let aiDiv = document.getElementsByTagName('ai-schedule-div')
        if (aiDiv.length != 0) {
            let img = document.createElement('img')
            img.src = url
            img.style.cssText =
                'display: block; width: 50%; max-width: 200px; min-height: 11vw; max-height: 6vh; position: relative; overflow: auto; margin-top:0vh; padding: 2vw;'
            img.setAttribute('onclick', "this.src='" + url + "'")
            aiDiv[2].appendChild(img)
            clearInterval(addInterval)
        }
    }
}

/*******
 * @description: 登录教务
 * @param {*} sha sha加密密钥
 * @param {*} aes aes加密密钥
 * @param {*} dom 首页dom
 * @param {*} prul 网址前缀
 * @param {*} urls 网址配置
 * @return {*}
 */
async function doLogin(sha, aes, dom, prul, urls) {
    let username = ''
    let pas = ''

    if (!!document.getElementById('username')) {
        username = document.getElementById('username').value
        pas = document.getElementById('password').value
    }

    username = !username
        ? await AISchedulePrompt({
            titleText: '请输入用户名',
            tipText: '',
            defaultText: '',
            validator: (username) => {
                if (!username) return '用户名输入有误'
                else return false
            },
        })
        : username
    pas = !pas
        ? await AISchedulePrompt({
            titleText: '请输入密码',
            tipText: '',
            defaultText: '',
            validator: (password) => {
                if (!password) return '密码输入有误'
                else return false
            },
        })
        : pas
    pas = CryptoJS.SHA1(sha + pas)
    //username = encrypt(username,aes)
    let data =
        'username=' +
        username +
        '&password=' +
        pas +
        '&pwd=' +
        pas +
        '&encodedPassword=' +
        '&session_locale=zh_CN'

    let vim = dom.getElementsByClassName('verity-image')
    let cr = dom.getElementsByClassName('captcha_response')
    if (vim.length != 0 || cr.length != 0) {
        addImg(
            !vim.length ? cr[0].nextElementSibling.src : vim[0].childNodes[0].src
        )
        data +=
            '&captcha_response=' +
            (await AISchedulePrompt({
                titleText: '请输入页面验证码',
                tipText: '',
                defaultText: '',
                validator: (yzm) => {
                    if (!yzm) return '验证码输入有误'
                    else return false
                },
            }))
    }

    let logRe = await request('post', data, prul + urls.login, '登录中')
    console.log(logRe)
    let tdom = textToDom(logRe)
    let errtext = tdom.getElementsByClassName('actionError')
    if (!!errtext.length) {
        await AIScheduleAlert({
            contentText: errtext[0].innerText + '>>>请退出重新进入<<<',
            titleText: '错误',
            confirmText: '确认',
        })
        return ''
    }
    console.info('登录中。。。')
    return getSjarr(prul)
}

function sleep(timeout) {
    for (let t = Date.now(); Date.now() - t <= timeout * 1000; );
}

/*******
 * @description: 获取学期ID
 * @param {*} preUrl 网址前缀
 * @param {*} courseTableCon 含有tagid的html
 * @return {*} 含有当前年份的学期，被选择学期的index
 */
async function getSemestersId(preUrl, courseTableCon) {
    let semesterIds = []
    let mess = ''
    let xqurl = preUrl + '/dataQuery.action'

    let data =
        'tagId=' +
        'semesterBar' +
        courseTableCon.match(/(?<=semesterBar).*?(?=Semester)/)[0] +
        'Semester' +
        '&dataType=semesterCalendar&value=' +
        courseTableCon.match(/(?<=value:").*?(?=")/)[0] +
        '&empty=false'

    let currentYear = new Date().getFullYear()
    let semesters = eval(
        '(' + (await request('post', data, xqurl, '加载学期中')) + ')'
    ).semesters
    let count = 0
    let semesterIndexTag = 0
    let selectList = []
    console.log(semesters)

    for (key in semesters) {
        if (semesters[key][0].schoolYear.search(currentYear) != -1) {
            for (let key1 in semesters[key]) {
                let semId = semesters[key][key1]
                selectList.push(
                    semesterIndexTag++ +
                    ':' +
                    semId['schoolYear'] +
                    '学年' +
                    semId['name'] +
                    '学期'
                )
                semesterIds.push(semesters[key][key1]['id'])
            }
            if (++count == 2) break
        }
    }

    let semesterIndex = (
        await AIScheduleSelect({
            titleText: '学期',
            contentText: '请选择当前学期',
            selectList: selectList,
        })
    ).split(':')[0]

    console.log(semesterIndex)
    return {
        semesterIds: semesterIds,
        semesterIndex: semesterIndex,
    }
}
/**
 * 判断是否有辅修
 * @param {*} courseTableCon
 */
async function isFx(preUrl) {
    let fxs = await request(
        'get',
        null,
        preUrl + '/dataQuery.action',
        '检查是否有辅修课程'
    )
    let doms = textToDom(fxs)
    let ops = doms.getElementsByTagName('option')
    if (ops.length <= 1) {
        return ops[0].value
    } else {
        let selectList = []
        for (let i = 0; i < ops.length; i++) {
            selectList.push(ops[i].value + ':' + ops[i].innerText)
        }
        let kbIndex = (
            await AIScheduleSelect({
                titleText: '课表',
                contentText: '请选择需要导出的课表',
                selectList: selectList,
            })
        ).split(':')[0]
        return kbIndex
    }
}

/*******
 * @description: 解析出课程信息
 * @param {*} preUrl 网址前缀
 * @return {*} 课程数组
 */
async function getSjarr(preUrl) {
    sleep(0.35)
    let kbIndx = await isFx(preUrl)
    let fxurl =
        preUrl +
        '/courseTableForStd!index.action?projectId=' +
        kbIndx +
        '&_=' +
        new Date().getTime()
    // let idurl = preUrl + '/courseTableForStd.action'
    let idurl =
        preUrl +
        '/courseTableForStd!innerIndex.action?projectId=' +
        kbIndx +
        '&_=' +
        new Date().getTime()

    // 用来解决无法切换课表
    await request('get', null, fxurl)

    let courseTableCon = await request('get', null, idurl, '加载课表中')

    console.info('获取学期中。。。')
    let semIdsJson = await getSemestersId(preUrl, courseTableCon)
    console.log(semIdsJson.semesterIds)

    let ids = courseTableCon.match(
        /(?<=bg.form.addInput\(form,"ids",").*?(?="\);)/g
    )
    console.log(ids)
    let kbTypeIndex = 0
    if (ids.length == 2) {
        kbTypeIndex = (
            await AIScheduleSelect({
                titleText: '课表类型',
                contentText: '请选择需要导出的课表类型',
                selectList: ['0:学生课表', '1:班级课表'],
            })
        ).split(':')[0]
    }
    console.info('获取ids中。。。')
    if (ids == null) {
        alert('ids匹配有误')
        return
    }
    console.info('获取到ids', ids[kbTypeIndex])

    let courseArr = []
    let i = semIdsJson.semesterIndex
    while (courseArr.length <= 1 && i >= 0) {
        sleep(0.4)
        console.info('正在查询课表', semIdsJson.semesterIds[i])
        let kbType = ['std', 'class']

        let data1 = `ignoreHead=1&setting.kind=${kbType[kbTypeIndex]}&startWeek=&semester.id=${semIdsJson.semesterIds[i]}&ids=${ids[kbTypeIndex]}`

        let url = preUrl + '/courseTableForStd!courseTable.action'
        courseArr = (await request('post', data1, url, '解析课表中')).split(
            /var teachers = \[.*?\];/
        )

        /**
         * 版本二
         */
        // courseArr = (await request("post", data2, url)).split(/activity = new /);
        i--
    }
    return courseArr
}

function distinct(arr) {
    return Array.from(new Set(arr))
}

async function scheduleHtmlProvider(
    iframeContent = '',
    frameContent = '',
    dom = document
) {
    let tags = 0
    //除函数名外都可编辑
    //以下为示例，您可以完全重写或在此基础上更改
    await loadTool('AIScheduleTools')
    let warning = `
  >>>导入流程<<<
  1、通过统一身份认证平台登录系统
  2、点击下面的一键导入
  3、大概需要等待5秒左右，导入完成后会自动跳转
  注意：导入完成后，注意检查时间和课程是否正确！！！      
  `
    await AIScheduleAlert(warning)

    let message = ''
    //alert("请确保你已经连接到校园网！！")
    let urlar = location.href.split('/')
    !urlar[urlar.length - 1] && urlar.pop()
    let verTag = urlar.pop()
    let preUrl = urlar.slice(0, urlar.indexOf('eams') + 1).join('/') //处理不在主页
    let urls1 = {
        home: '/homeExt.action',
        login: '/loginExt.action',
        loginTableClassName: 'login-table',
    }
    let urls2 = {
        home: '/home.action',
        login: '/login.action',
        loginTableClassName: 'logintable',
    }
    /**
     * 在首页时，会没有登录标识，会导致登录失败
     * 需要去解决
     */
    let urls = verTag.search('Ext') === -1 ? urls2 : urls1
    let courseArr = []
    let arr = []
    try {
        //验证是否登录
        let homeText = await request('get', null, preUrl + urls.home, '登录验证中')
        let homeDom = textToDom(homeText)
        let logintag = homeDom.getElementsByClassName(
            urls.loginTableClassName
        ).length

        sleep(0.5)
        if (location.href.search('sso/login') != -1) {
            await AIScheduleAlert('请登录。。。')
            return 'do not continue'
        } else if (!logintag && location.href.search(preUrl + urls.login) == -1) {
            arr = await getSjarr(preUrl)
        } else {
            await loadTools('/eams/static/scripts/sha1.js')
            //  await loadTools("/eams/static/scripts/aes.min.js")

            let sha = homeText.match(/(?<=CryptoJS\.SHA1\(').*?(?=')/)[0]
            let aes = null
            //  let aes =  homeText.match(/(?<=encrypt\(username,').*?(?=')/)[0];

            arr = await doLogin(sha, aes, homeDom, preUrl, urls)
            if (!arr) {
                return 'do not continue'
            }
        }
        if (arr.length >= 1) {
            arr.slice(1).forEach((courseText) => {
                let course = { weeks: [], sections: [] }
                console.log(courseText)
                let orArr = courseText.match(
                    /(?<=actTeacherName.join\(','\),).*?(?=\);)/g
                )
                let day = distinct(courseText.match(/(?<=index \=).*?(?=\*unitCount)/g))
                let section = distinct(courseText.match(/(?<=unitCount\+).*?(?=;)/g))
                let teacher = distinct(courseText.match(/(?<=name:").*?(?=")/g))
                console.log(orArr, day, section, teacher)
                let courseCon = orArr[0].split(/(?<="|l|e),(?="|n|a)/)
                console.log(courseCon)
                course.courseName = courseCon[1].replace(/"/g, '')
                course.roomName = courseCon[3].replace(/"/g, '')
                course.teacherName = teacher.join(',')
                courseCon[4] = courseCon[4].split(',')[0].replace('"', '')
                courseCon[4].split('').forEach((em, index) => {
                    if (em == 1) course.weeks.push(index)
                })
                course.day = Number(day) + 1
                section.forEach((con) => {
                    course.sections.push(Number(con) + 1)
                })
                console.log(course)
                courseArr.push(course)
            })

            /**
             * 版本二
             */
            // arr.slice(1).forEach(courseText => {
            //     let course = { weeks: [], sections: [] };
            //     console.log(courseText)
            //     let orArr = courseText.match(/(?<=TaskActivity\().*?(?=\);)/g);
            //     let day = distinct(courseText.match(/(?<=index \=).*?(?=\*unitCount)/g));
            //     let section = distinct(courseText.match(/(?<=unitCount\+).*?(?=;)/g));
            //     let courseCon = orArr[0].split(/","/)
            //     console.log(orArr, day, section, courseCon[1])
            //     console.log(courseCon)
            //     course.courseName = courseCon[3]
            //     course.roomName = courseCon[5]
            //     course.teacherName =courseCon[1]
            //     courseCon[6] = courseCon[6].replace('"', "")
            //     courseCon[6].split("").forEach((em, index) => {
            //         if (em == 1) course.weeks.push(index);
            //     })
            //     course.day = Number(day) + 1;
            //     section.forEach(con => {
            //         course.sections.push(Number(con) + 1)
            //     })
            //     console.log(course)
            //     courseArr.push(course)
            // })

            if (courseArr.length == 0) message = '未获取到课表'
        } else {
            message = '未获取到课表'
        }
    } catch (e) {
        console.log(e)
        message = e.message.slice(0, 50)
    }
    if (message.length != 0) {
        courseArr.length = 0
        let errText = `
      错误：${message},
      url:${preUrl}
      `
        AIScheduleAlert({
            contentText: errText,
            titleText: '错误',
            confirmText: '我已知晓',
        })
        return 'do not continue'
    }
    // console.log(courseArr)
    // alert("provider执行成功")
    //处理特殊字符
    return JSON.stringify(courseArr).replace(/`/g, '')
}
