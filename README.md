##使用以及注意##
目录结构

![目录结构](layout.png)

*	app/css/public : 这里放公用的css样式
*	app/css/vender : 这里放使用插件的css样式
*	app/css: 这里放开发时候编写的样式
*	app/images/icons 这里放用于生成雪碧图的图片

遇到的问题
app/js/ 这里面不建议放压缩后的js文件，我就遇到过放jquery.min.js,压缩合并后报错的问题。

*********************
初始化 `gulp init`：目的是为了，开发的时候不在修改公共的东西，避免浪费太多资源。

工作 `gulp start`

在html文件夹里面有自己修改使用的弹出。

