# 🎯 旅行规划助手 - 开发TODO列表

> 创建时间：2026-04-10  
> 项目：旅行规划助手（vue-trip + trip）  
> 状态：开发中

---

## 📌 第一阶段：核心功能完善（预计2-3周）

### 一、数据库设计与迁移 ✅

#### 1.1 数据库表结构设计

- [x] **创建行程表（trips）**
  - 字段：id, user_id, trip_name, origin, destination, start_date, end_date, travelers, budget, transport, status, created_at, updated_at
  - 索引：user_id, start_date, status
- [x] **创建日程表（schedules）**
  - 字段：id, trip_id, day_number, date, morning_activity, afternoon_activity, evening_activity, notes, created_at
  - 索引：trip_id, date
- [x] **创建支出表（expenses）**
  - 字段：id, trip_id, category, amount, description, expense_date, created_at
  - 分类：交通、住宿、餐饮、门票、购物、其他
  - 索引：trip_id, category, expense_date
- [x] **创建景点收藏表（favorites）**
  - 字段：id, user_id, poi_id, poi_name, poi_address, city, created_at
  - 索引：user_id, city
- [x] **创建游记表（travel_logs）**
  - 字段：id, user_id, trip_id, title, content, images, views, likes, created_at, updated_at
  - 索引：user_id, created_at, likes
- [x] **创建提醒表（reminders）**
  - 字段：id, user_id, trip_id, reminder_type, reminder_time, content, is_sent, created_at
  - 类型：出发提醒、天气提醒、行程提醒
  - 索引：user_id, reminder_time, is_sent

#### 1.2 数据库迁移脚本

- [x] 编写SQL建表脚本
- [ ] 创建测试数据
- [ ] 数据库备份策略

---

### 二、后端API开发

#### 2.1 行程管理模块 (`/router/trip.js` + `/router_handle/trip.js`) ✅ 已完成

- [x] **POST /trip/create** - 创建新行程 ✅ 已完成
  - 参数：trip_name, origin, destination, start_date, end_date, travelers, budget, transport
  - 返回：trip_id, 完整行程信息
- [x] **GET /trip/list** - 获取用户行程列表 ✅ 已完成
  - 参数：user_id, page, page_size, status(进行中/已完成/已取消)
  - 返回：行程列表（分页）
- [x] **GET /trip/detail/:id** - 获取行程详情 ✅ 已完成
  - 参数：trip_id
  - 返回：完整行程信息 + 日程安排 + 支出统计
- [x] **PUT /trip/update/:id** - 更新行程信息 ✅ 已完成
  - 参数：trip_id + 可更新字段
  - 返回：更新后的行程信息
- [x] **DELETE /trip/delete/:id** - 删除行程 ✅ 已完成
  - 参数：trip_id
  - 返回：删除状态
- [x] **POST /trip/share** - 分享行程 ✅ 已完成
  - 参数：trip_id
  - 返回：分享链接/二维码

#### 2.2 日程管理模块 (`/router/schedule.js` + `/router_handle/schedule.js`) ✅ 已完成

- [x] **POST /schedule/create** - 创建日程 ✅ 已完成
  - 参数：trip_id, day_number, date, morning_activity, afternoon_activity, evening_activity, notes
- [x] **GET /schedule/list/:trip_id** - 获取行程的所有日程 ✅ 已完成
  - 参数：trip_id
  - 返回：按日期排序的日程列表
- [x] **PUT /schedule/update/:id** - 更新日程 ✅ 已完成
  - 参数：schedule_id + 可更新字段
- [x] **DELETE /schedule/delete/:id** - 删除日程 ✅ 已完成

#### 2.3 预算管理模块 (`/router/expense.js` + `/router_handle/expense.js`) ✅ 已完成

- [x] **POST /expense/create** - 记录支出 ✅ 已完成
  - 参数：trip_id, category, amount, description, expense_date
- [x] **GET /expense/list/:trip_id** - 获取行程支出列表 ✅ 已完成
  - 参数：trip_id, category(可选)
  - 返回：支出列表 + 分类统计
- [x] **GET /expense/statistics/:trip_id** - 支出统计 ✅ 已完成
  - 参数：trip_id
  - 返回：总支出、分类占比、预算对比
- [x] **PUT /expense/update/:id** - 更新支出记录 ✅ 已完成
- [x] **DELETE /expense/delete/:id** - 删除支出记录 ✅ 已完成

#### 2.4 游记模块 (`/router/travellog.js` + `/router_handle/travellog.js`) ✅ 已完成

- [x] **POST /travellog/create** - 发布游记 ✅ 已完成
  - 参数：user_id, trip_id(可选), title, content, images
- [x] **GET /travellog/list** - 获取游记列表 ✅ 已完成
  - 参数：page, page_size, user_id(可选), sort(最新/热门)
  - 返回：游记列表（分页）
- [x] **GET /travellog/detail/:id** - 获取游记详情 ✅ 已完成
  - 参数：travellog_id
  - 返回：游记详情 + 作者信息
- [x] **POST /travellog/like/:id** - 点赞游记 ✅ 已完成
- [x] **DELETE /travellog/delete/:id** - 删除游记 ✅ 已完成

#### 2.5 提醒模块 (`/router/reminder.js` + `/router_handle/reminder.js`) 🚧 进行中

- [ ] **POST /reminder/create** - 创建提醒
  - 参数：user_id, trip_id, reminder_type, reminder_time, content
- [ ] **GET /reminder/list** - 获取用户提醒列表
  - 参数：user_id, is_sent(可选)
- [ ] **PUT /reminder/update/:id** - 更新提醒
- [ ] **DELETE /reminder/delete/:id** - 删除提醒

#### 2.6 收藏模块 (`/router/favorite.js` + `/router_handle/favorite.js`)

- [ ] **POST /favorite/add** - 收藏景点
  - 参数：user_id, poi_id, poi_name, poi_address, city
- [ ] **GET /favorite/list** - 获取收藏列表
  - 参数：user_id, city(可选)
- [ ] **DELETE /favorite/delete/:id** - 取消收藏

---

### 三、前端功能实现

#### 3.1 行程管理页面 (`/src/views/MyTrips/index.vue`)

- [ ] 创建"我的行程"页面
  - 行程卡片展示（进行中/已完成/已取消）
  - 筛选与搜索功能
  - 创建新行程入口
- [ ] 行程详情页 (`/src/views/TripDetail/index.vue`)
  - 基本信息展示
  - 日程时间轴组件
  - 支出统计图表
  - 编辑/删除/分享按钮

#### 3.2 日程规划组件

- [ ] 创建日程时间轴组件 (`/src/components/ScheduleTimeline/index.vue`)
  - 按天展示日程
  - 上午/下午/晚上时间段
  - 拖拽排序功能
  - 添加/编辑活动弹窗
- [ ] 智能推荐景点
  - 根据目的地推荐景点
  - 景点游玩时长估算
  - 景点间路线规划

#### 3.3 预算管理组件

- [ ] 创建预算管理组件 (`/src/components/BudgetManager/index.vue`)
  - 支出记录表单
  - 支出列表展示
  - 分类统计饼图
  - 预算进度条
  - 导出报表功能

#### 3.4 游记功能页面

- [ ] 游记发布页 (`/src/views/TravelLog/Create.vue`)
  - 富文本编辑器
  - 图片上传（多图）
  - 关联行程选择
- [ ] 游记列表页 (`/src/views/TravelLog/List.vue`)
  - 瀑布流布局
  - 点赞/评论功能
  - 分享功能
- [ ] 游记详情页 (`/src/views/TravelLog/Detail.vue`)
  - 内容展示
  - 点赞/评论互动

#### 3.5 提醒功能组件

- [ ] 创建提醒组件 (`/src/components/Reminder/index.vue`)
  - 提醒设置表单
  - 提醒列表展示
  - 提醒状态管理
- [ ] 集成浏览器通知API
  - 请求通知权限
  - 发送桌面通知

#### 3.6 收藏功能

- [ ] 我的收藏页面 (`/src/views/MyFavorites/index.vue`)
  - 收藏景点列表
  - 按城市分类
  - 快速添加到行程

---

### 四、手机验证码登录完善

#### 4.1 后端实现

- [ ] 接入阿里云/腾讯云短信服务
  - 申请短信签名和模板
  - 配置AccessKey
- [ ] 创建验证码路由 (`/router/sms.js`)
  - **POST /sms/send** - 发送验证码
    - 参数：phone
    - 逻辑：生成6位验证码，存入Redis/内存，有效期5分钟
  - **POST /sms/verify** - 验证码登录
    - 参数：phone, code
    - 逻辑：验证码校验，创建/登录用户，返回token

#### 4.2 前端完善

- [ ] 完善手机登录组件 (`/src/views/Login/components/Phone_Login.vue`)
  - 验证码倒计时（60秒）
  - 手机号格式验证
  - 错误提示优化

---

## 📌 第二阶段：实用功能增强（预计2周）

### 五、第三方服务集成

#### 5.1 酒店预订集成

- [ ] 接入携程/美团API（或使用第三方聚合API）
- [ ] 创建酒店搜索组件
- [ ] 酒店详情展示
- [ ] 价格对比功能

#### 5.2 交通票务集成

- [ ] 接入12306查询接口（或第三方API）
- [ ] 机票查询（携程/去哪儿API）
- [ ] 交通方式推荐组件

#### 5.3 地图功能增强

- [ ] 行程路线地图展示
- [ ] 景点位置标注
- [ ] 导航功能集成

---

## 📌 第三阶段：社交与智能化（预计2-3周）

### 六、社交功能

#### 6.1 用户关系

- [ ] 关注/粉丝功能
- [ ] 用户主页
- [ ] 动态列表

#### 6.2 互动功能

- [ ] 游记评论系统
- [ ] 私信功能
- [ ] 结伴同行

### 七、智能推荐

#### 7.1 推荐系统

- [ ] 基于用户历史的推荐算法
- [ ] 热门目的地榜单
- [ ] 个性化行程推荐

#### 7.2 AI助手

- [ ] 接入ChatGPT API
- [ ] 智能行程规划建议
- [ ] 旅行问答助手

---

## 📌 测试与优化

### 八、测试

- [ ] 单元测试（后端API）
- [ ] 集成测试
- [ ] 前端组件测试
- [ ] 性能测试

### 九、优化

- [ ] 数据库查询优化
- [ ] 前端性能优化（懒加载、虚拟滚动）
- [ ] 移动端适配优化
- [ ] PWA支持

---

## 📋 执行计划

### 第1周 ✅ 已完成

- [x] 数据库设计与建表
- [x] 行程管理API开发（创建、列表）
- [x] 前端API文件创建

### 第2周

- [ ] 行程详情、更新、删除API
- [ ] 日程管理API开发
- [ ] 日程时间轴组件

### 第3周

- [ ] 预算管理API开发
- [ ] 预算管理前端组件
- [ ] 游记模块API开发

### 第4周

- [ ] 游记前端页面
- [ ] 提醒功能开发
- [ ] 收藏功能开发
- [ ] 手机验证码登录完善

### 第5-6周

- [ ] 第三方服务集成（酒店、交通）
- [ ] 社交功能开发

### 第7-8周

- [ ] 智能推荐系统
- [ ] AI助手集成
- [ ] 测试与优化

---

## 📊 项目进度统计

### 总体进度

- 数据库设计：100% ✅
- 后端API开发：60% 🚧
- 前端功能实现：0%
- 第三方集成：0%
- 测试优化：0%

### 当前状态

- 🚧 **正在开发**：提醒模块
- ✅ **已完成**：
  - 数据库表结构设计
  - 行程管理模块（6个接口全部完成）
    - POST /trip/create 接口
    - GET /trip/list 接口
    - GET /trip/detail/:id 接口
    - PUT /trip/update/:id 接口
    - DELETE /trip/delete/:id 接口
    - POST /trip/share 接口
  - 日程管理模块（4个接口全部完成）
    - POST /schedule/create 接口
    - GET /schedule/list/:trip_id 接口
    - PUT /schedule/update/:id 接口
    - DELETE /schedule/delete/:id 接口
  - 预算管理模块（5个接口全部完成）
    - POST /expense/create 接口
    - GET /expense/list/:trip_id 接口
    - GET /expense/statistics/:trip_id 接口
    - PUT /expense/update/:id 接口
    - DELETE /expense/delete/:id 接口
  - 游记模块（5个接口全部完成）
    - POST /travellog/create 接口
    - GET /travellog/list 接口
    - GET /travellog/detail/:id 接口
    - POST /travellog/like/:id 接口
    - DELETE /travellog/delete/:id 接口
  - 前端 API 文件
    - trip.js API文件
    - schedule.js API文件
    - expense.js API文件
    - travellog.js API文件

---

## 📝 开发规范

### 后端开发规范

1. 路由文件放在 `/router/` 目录
2. 处理函数放在 `/router_handle/` 目录
3. 使用统一的响应格式：
   ```javascript
   {
     status: 0,  // 0-成功，1-失败
     message: '操作提示',
     data: {}    // 返回数据
   }
   ```
4. 每个接口开发完成后，同步创建前端API函数

### 前端开发规范

1. API文件放在 `/src/api/` 目录
2. 使用统一的请求实例（@/http）
3. 函数命名规范：
   - 创建：createXxx
   - 获取列表：getXxxList
   - 获取详情：getXxxDetail
   - 更新：updateXxx
   - 删除：deleteXxx

---

## 🔗 相关文档

- [数据库表结构](./database/create_tables.sql)
- [后端项目说明](./README.md)
- [前端项目说明](../front-end/Vue/vue-trip/README.md)

---

## 📞 联系方式

如有问题，请及时沟通调整计划。

---

**最后更新时间：2026-04-10**
