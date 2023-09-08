# 小爱课程表-陕西学前师范学院
> 该项目是通过小爱课程表的接口，获取陕西学前师范学院的课程表信息，然后通过App课程表的方式，将课程表信息呈现给用户。

小爱课程表适配
## 使用

打开小爱课程表，点击右下角的教务系统导入，学校选择`陕西学前师范学院`，然后项目选择墨忆江南制作的项目。点击导入后登录自己在学校的账号密码即可导入自己的课程表。


自定义:

```edit
如果你是该校学生，修改`Timer.js`中的
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
    即可
```

## 版本

* 1.0.0
    * 适配小爱课程表
    * 适配当前学校的课程表时间
    * 适配学生版和教室版课程表
    * 适配所有学年与学期的课程表

## 许可证

Dongyifengs – [@Dongyifengs](https://Github.com/Dongyifengs) – 1545929126@qq.com & dongyifengs@gmail.com


