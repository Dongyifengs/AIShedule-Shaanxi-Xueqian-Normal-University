// 作者信息
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

// 获取课程时间表的函数
function getTimes(xJConf) {
    // 获取时间配置的函数
    function getTime(conf) {
        let courseSum = conf.courseSum; // 课程总节数
        let startTime = conf.startTime; // 上课开始时间
        let oneCourseTime = conf.oneCourseTime; // 单节课时长
        let shortRestingTime = conf.shortRestingTime; // 短休息时长
        let longRestingTimeBegin = conf.longRestingTimeBegin; // 长休息开始位置
        let longRestingTime = conf.longRestingTime; // 长休息时长
        let lunchTime = conf.lunchTime; // 午休时间
        let dinnerTime = conf.dinnerTime; // 晚饭时间
        let abnormalClassTime = conf.abnormalClassTime; // 异常课程时间
        let abnormalRestingTime = conf.abnormalRestingTime; // 异常休息时间

        let result = [];
        let studyOrRestTag = true;
        let timeSum = startTime.slice(-2) * 1 + startTime.slice(0, -2) * 60;

        let classTimeMap = new Map();
        let RestingTimeMap = new Map();
        // 如果存在异常课程时间，将其添加到 classTimeMap 中
        if (abnormalClassTime !== undefined) abnormalClassTime.forEach(time => {
            classTimeMap.set(time.begin, time.time)
        });
        // 如果存在长休息开始位置，将其添加到 RestingTimeMap 中
        if (longRestingTimeBegin !== undefined) longRestingTimeBegin.forEach(time => RestingTimeMap.set(time, longRestingTime));
        // 如果存在午休时间，将其添加到 RestingTimeMap 中
        if (lunchTime !== undefined) RestingTimeMap.set(lunchTime.begin, lunchTime.time);
        // 如果存在晚饭时间，将其添加到 RestingTimeMap 中
        if (dinnerTime !== undefined) RestingTimeMap.set(dinnerTime.begin, dinnerTime.time);
        // 如果存在异常休息时间，将其添加到 RestingTimeMap 中
        if (abnormalRestingTime !== undefined) abnormalRestingTime.forEach(time => {
            RestingTimeMap.set(time.begin, time.time)
        });

        for (let i = 1, j = 1; i <= courseSum * 2; i++) {
            if (studyOrRestTag) {
                let startTime = ("0" + Math.floor(timeSum / 60)).slice(-2) + ':' + ('0' + timeSum % 60).slice(-2);
                timeSum += classTimeMap.get(j) === undefined ? oneCourseTime : classTimeMap.get(j);
                let endTime = ("0" + Math.floor(timeSum / 60)).slice(-2) + ':' + ('0' + timeSum % 60).slice(-2);
                studyOrRestTag = false;
                result.push({
                    section: j++,
                    startTime: startTime,
                    endTime: endTime
                })
            } else {
                timeSum += RestingTimeMap.get(j - 1) === undefined ? shortRestingTime : RestingTimeMap.get(j - 1);
                studyOrRestTag = true;
            }
        }
        return result;
    }

    let nowDate = new Date();
    let year = nowDate.getFullYear();
    let wuYi = new Date(year + "/" + '05/01');
    let jiuSanLing = new Date(year + "/" + '09/30');
    let shiYi = new Date(year + "/" + '10/01');
    let nextSiSanLing = new Date((year + 1) + "/" + '04/30');
    let previousShiYi = new Date((year - 1) + "/" + '10/01');
    let siSanLing = new Date(year + "/" + '04/30');
    let xJTimes = getTime(xJConf);
    if (nowDate >= wuYi && nowDate <= jiuSanLing) {
        return xJTimes;
    } else if (nowDate >= shiYi && nowDate <= nextSiSanLing || nowDate >= previousShiYi && nowDate <= siSanLing) {
        // return dJTimes;
    }
}

// 主调度函数
async function scheduleTimer() {
    // 等待加载工具
    await loadTool('AIScheduleTools')
    const {AIScheduleAlert} = AIScheduleTools()
    return {
        totalWeek: 20, // 总周数
        startSemester: '', // 开学时间
        startWithSunday: false, // 是否周日为起始日
        showWeekend: true, // 是否显示周末
        forenoon: 4, // 上午课程节数
        afternoon: 4, // 下午课程节数
        night: 2, // 晚间课程节数
        sections: getTimes({
            courseSum: 10, // 课程节数
            startTime: '0800', // 开始上课时间
            oneCourseTime: 50, // 一节课的时间
            longRestingTime: 20, // 大课间时长
            shortRestingTime: 10, // 小课间时长
            longRestingTimeBegin: [2, 6], // 大课间开始位置
            lunchTime: {begin: 4, time: 2 * 60}, // 午休时间
            dinnerTime: {begin: 8, time: 60}, // 晚饭时间
            // abnormalClassTime: [], // 异常课程时间
            // abnormalRestingTime: [] // 异常休息时间
        }),
    }
}
