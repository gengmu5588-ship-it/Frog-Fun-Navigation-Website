export function initDB(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subcategory_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
    );
  `)

  // 检查是否已有数据，没有则插入示例数据
  const count = db.prepare('SELECT COUNT(*) as cnt FROM categories').get()
  if (count.cnt === 0) {
    seedData(db)
  }
}

function seedData(db) {
  const insertCat = db.prepare('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)')
  const insertSub = db.prepare('INSERT INTO subcategories (category_id, name, sort_order) VALUES (?, ?, ?)')
  const insertLink = db.prepare('INSERT INTO links (subcategory_id, title, url, description, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)')

  const data = [
    {
      name: '常用', icon: '🔥', sort: 1,
      subs: [
        { name: '常用', sort: 1, links: [
          { title: '学姐吧', url: 'https://xuejie.in/', desc: '小众福利资源博客' },
          { title: '学姐吧论坛', url: 'https://xuejie.in/bbs', desc: '老司机聚集地' },
          { title: '百家姓', url: 'https://xuejie.cc/baijiaxing.html', desc: '百家姓加密/解密' },
          { title: 'AI画小姐姐', url: 'https://xuejie.in/26017.html', desc: 'AI画小姐姐工具及模型合集' },
        ]},
        { name: 'ChatGPT', sort: 2, links: [
          { title: 'ChatGPT', url: 'https://chat.openai.com/', desc: 'OpenAI ChatGPT' },
          { title: 'Claude', url: 'https://claude.ai/', desc: 'Anthropic Claude AI' },
          { title: '通义千问', url: 'https://tongyi.aliyun.com/', desc: '阿里通义千问' },
          { title: '文心一言', url: 'https://yiyan.baidu.com/', desc: '百度文心一言' },
        ]},
        { name: '资讯', sort: 3, links: [
          { title: '今日头条', url: 'https://www.toutiao.com/', desc: '综合资讯平台' },
          { title: '知乎', url: 'https://www.zhihu.com/', desc: '中文问答社区' },
          { title: '微博', url: 'https://weibo.com/', desc: '社交媒体平台' },
        ]},
        { name: '天气', sort: 4, links: [
          { title: '中国天气网', url: 'http://www.weather.com.cn/', desc: '中国气象局官方天气' },
          { title: '墨迹天气', url: 'https://www.moji.com/', desc: '精准天气预报' },
        ]},
      ]
    },
    {
      name: '影视', icon: '🎬', sort: 2,
      subs: [
        { name: '影视在线', sort: 1, links: [
          { title: '发现TV', url: 'https://faxiantv.com/', desc: '最新影视在线观看' },
          { title: '低端影视', url: 'https://ddys.pro/', desc: '超清在线视频站' },
          { title: '片库', url: 'https://www.gying.org/', desc: '高清影视在线观看/下载' },
          { title: '鸭奈飞影视', url: 'https://www.netflixgc.com/', desc: '最新Netflix剧集/电影在线观看' },
          { title: '4K影视', url: 'https://www.4kvm.org/', desc: '高清影视在线观看' },
          { title: '韩剧网', url: 'https://www.tvn.cc/', desc: '最新韩剧/日剧/泰剧在线观看' },
          { title: '美剧天堂', url: 'http://www.mjtt.tv/', desc: '最新美剧在线观看/下载' },
          { title: 'HDmoli', url: 'https://molicp.com/', desc: '高品质在线影视' },
          { title: '在线之家', url: 'https://www.zxzjys.com/', desc: '在线观看最新美剧/韩剧/电影' },
          { title: '粤爱看', url: 'https://www.yueyb.com/', desc: '粤语影视在线观看' },
        ]},
        { name: '影视下载', sort: 2, links: [
          { title: '云盘之家', url: 'https://yunpantv.cc/', desc: '云盘影视分享社区' },
          { title: '短剧库', url: 'https://duanjuku.org/', desc: '热门短剧大全' },
        ]},
        { name: '字幕下载', sort: 3, links: [
          { title: '字幕库', url: 'https://zimuku.org/', desc: '字幕下载站' },
          { title: 'SubHD', url: 'https://subhd.tv/', desc: '中文字幕下载' },
        ]},
        { name: '磁力搜索', sort: 4, links: [
          { title: '磁力搜索', url: 'https://www.clmao.cc/', desc: '磁力链接搜索引擎' },
        ]},
        { name: '影视评分', sort: 5, links: [
          { title: '豆瓣电影', url: 'https://movie.douban.com/', desc: '电影评分与评论' },
          { title: 'IMDb', url: 'https://www.imdb.com/', desc: '全球电影数据库' },
        ]},
      ]
    },
    {
      name: '图片', icon: '🖼️', sort: 3,
      subs: [
        { name: '壁纸', sort: 1, links: [
          { title: '故宫壁纸', url: 'https://www.dpm.org.cn/lights/royal.html', desc: '故宫博物院文物壁纸' },
          { title: '极简壁纸', url: 'https://bz.zzzmh.cn/', desc: '壁纸来源于Wallhaven' },
          { title: '彼岸壁纸', url: 'http://www.netbian.com/', desc: '高清电脑壁纸下载站' },
          { title: 'Wallhaven', url: 'https://wallhaven.cc/', desc: '国外高清壁纸分享站' },
          { title: 'GameWallpapers', url: 'https://www.gamewallpapers.com/', desc: '国外高清游戏壁纸站' },
        ]},
        { name: '摄影', sort: 2, links: [
          { title: '500px', url: 'https://500px.com/', desc: '全球摄影师社区' },
          { title: '图虫', url: 'https://tuchong.com/', desc: '中国摄影师社区' },
        ]},
        { name: '图库', sort: 3, links: [
          { title: 'Unsplash', url: 'https://unsplash.com/', desc: '免费高清图片库' },
          { title: 'Pexels', url: 'https://www.pexels.com/', desc: '免费图片和视频' },
        ]},
      ]
    },
    {
      name: '动漫', icon: '🎌', sort: 4,
      subs: [
        { name: '动漫在线', sort: 1, links: [
          { title: '233动漫', url: 'https://www.233dm.com/', desc: '最新动漫在线观看/下载' },
          { title: 'AGE动漫', url: 'https://www.agemys.org/', desc: '最新动漫在线观看' },
          { title: 'A站', url: 'https://www.acfun.cn/', desc: 'AcFun' },
          { title: 'B站', url: 'https://www.bilibili.com/', desc: '哔哩哔哩' },
        ]},
        { name: '漫画插画', sort: 2, links: [
          { title: '漫画人', url: 'https://www.mangaren.com/', desc: '在线漫画阅读' },
        ]},
      ]
    },
    {
      name: '游戏', icon: '🎮', sort: 5,
      subs: [
        { name: '怀旧游戏', sort: 1, links: [
          { title: '灵动游戏', url: 'https://www.mhhf.com/', desc: '在线玩经典小游戏' },
          { title: '绝版游戏保护工程', url: 'https://github.com/skywind3000/preserve-cd', desc: '精选怀旧小游戏下载' },
          { title: 'U77', url: 'https://www.u77game.net/', desc: '在线玩经典小游戏' },
        ]},
        { name: '游戏下载', sort: 2, links: [
          { title: 'Steam', url: 'https://store.steampowered.com/', desc: '全球最大游戏平台' },
          { title: 'Epic Games', url: 'https://www.epicgames.com/', desc: 'Epic游戏商城' },
        ]},
      ]
    },
    {
      name: '阅读', icon: '📚', sort: 6,
      subs: [
        { name: '在线阅读', sort: 1, links: [
          { title: '微信读书', url: 'https://weread.qq.com/', desc: '正版书籍免费阅读' },
          { title: '努努书坊', url: 'https://www.kanunu8.com/', desc: '小说在线阅读' },
          { title: '我不是盐神', url: 'https://onehu.xyz/', desc: '知乎盐选文章搬运网站' },
          { title: '科幻小说网', url: 'http://www.kehuan.net.cn/', desc: '经典科幻小说在线阅读' },
        ]},
        { name: '书籍下载', sort: 2, links: [
          { title: 'Z-Library', url: 'https://z-lib.org/', desc: '全球最大电子书库' },
        ]},
        { name: '有声书', sort: 3, links: [
          { title: '喜马拉雅', url: 'https://www.ximalaya.com/', desc: '有声书/播客平台' },
        ]},
        { name: '古典文学', sort: 4, links: [
          { title: '古诗文网', url: 'https://www.gushiwen.cn/', desc: '古诗文经典阅读' },
        ]},
      ]
    },
    {
      name: '工具', icon: '🛠️', sort: 7,
      subs: [
        { name: '工具箱', sort: 1, links: [
          { title: 'MikuTools', url: 'https://tools.miku.ac/', desc: '一个轻量工具集合' },
          { title: '在线工具', url: 'https://tool.lu/', desc: '在线程序员工具箱' },
          { title: '孟坤工具箱', url: 'http://tool.mkblog.cn/', desc: '在线实用工具箱' },
          { title: '即时工具', url: 'https://www.67tool.com/', desc: '在线文档/图片/视频/办公等综合工具箱' },
          { title: '一个木函', url: 'https://ol.woobx.cn/', desc: '多功能效率工具箱' },
          { title: '记灵工具', url: 'https://remeins.com/', desc: '在线PDF/图片/视频等综合工具箱' },
        ]},
        { name: '文档处理', sort: 2, links: [
          { title: 'TXT文本处理工具', url: 'https://www.txttool.com/', desc: '在线TXT文本处理工具箱' },
        ]},
        { name: '图片处理', sort: 3, links: [
          { title: 'TinyPNG', url: 'https://tinypng.com/', desc: '在线图片压缩' },
          { title: 'Remove.bg', url: 'https://www.remove.bg/', desc: 'AI自动去除背景' },
        ]},
        { name: '下载工具', sort: 4, links: [
          { title: 'IDM', url: 'https://www.internetdownloadmanager.com/', desc: '最强下载工具' },
        ]},
        { name: '编程相关', sort: 5, links: [
          { title: 'GitHub', url: 'https://github.com/', desc: '全球最大代码托管平台' },
          { title: 'Stack Overflow', url: 'https://stackoverflow.com/', desc: '程序员问答社区' },
          { title: 'MDN', url: 'https://developer.mozilla.org/', desc: 'Web开发文档' },
        ]},
      ]
    },
  ]

  const insertAll = db.transaction(() => {
    for (const cat of data) {
      const catResult = insertCat.run(cat.name, cat.icon, cat.sort)
      const catId = catResult.lastInsertRowid
      for (const sub of cat.subs) {
        const subResult = insertSub.run(catId, sub.name, sub.sort)
        const subId = subResult.lastInsertRowid
        for (let i = 0; i < sub.links.length; i++) {
          const link = sub.links[i]
          insertLink.run(subId, link.title, link.url, link.desc, '', i + 1)
        }
      }
    }
  })

  insertAll()
  console.log('示例数据已初始化')
}
