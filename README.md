## 新M2O前端工程
#### 环境搭建

* `git clone git@git.hoge.cn:m2o-frontend/mxu-frontend.git` 克隆项目，并进入项目目录。
   `npm install --registry https://registry.npm.taobao.org` 安装所有依赖。
* 使用nginx做本地代理。所有的.conf文件都在`nginx/server`路径下。.conf文件向master管理员要
* `sudo nginx`启动nginx代理服务
* 修改localhost

> 确保本地已安装过node环境

#### 文件路径及说明

* 根据项目需求，现有`./assets/`、`./doc/`、`./libs/`、`./main/`、`./views/`。

  ***assets***:包含引入的公共css以及图片、字体等资源文件。scss文件夹里放按照文件夹区分不同模块的scss文件。构建时会编译到`./assets/scss`同级目录`./assets/styles`里。
  > `./assets/styles/`里有flatkit公共样式文件。请不要删除！

  ***doc***: 文档目录。

  ***libs***: 第三方库路径。

  ***main***: js文件目录。`./main/scripts/`根目录下`config.router.js`&&`config.lazyload.js`两个文件是懒加载文件跟项目路由文件。了解不同模块所有的文件目录可以参考这个路由文件。外层`controller`&&`services`&&`directives`&&`filters`是早期flatkit UI库里的公共文件。不要随便动。其他开发文件全部在`./main/scripts/mxu/`路径下。
  ***views***: html文件目录。由于现在mxu含有四个版本。前端通过ejs在构建时显示去不同版本的。所以`./views/ejs/`里是四个版本不一样的模块。剩下的公共的模块都在`./views/html/`目录下。构建时会copy到`./views/mxu/`目录下。


#### 构建命令

##### 开发模式
> npm start

##### 开发配置版本和语言
> npm run dev -- -e <版本：`basic | standard | professional | ultimate`> -l <语言：`zh_cn | en`>

***如旗舰版英文：`npm run dev -- -e ultimate -l en`***
**默认旗舰版、中文。如：`npm run dev -- -e ultimate`，则为旗舰版、中文**

##### 发布配置版本和语言
> npm run build -- -e <版本：`basic | standard | professional | ultimate`> -l <语言：`zh_cn | en`>

***如旗舰版英文：npm run build -- -e ultimate -l en***
**默认旗舰版、中文。如：`npm run build -- -e ultimate`，则为旗舰版、中文**




