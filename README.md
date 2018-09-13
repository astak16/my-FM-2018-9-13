`init`中需要完成的事情	
1. `init`先获取事件，比如`this.$footer = $(footer)`
2. `this.bind()`绑定事件
3. `this.render()`渲染页面

jQuery事件监听获取数据
```
var eventCenter = {
    on:function(type,handler){
        $(document).on(type,handler);
    },
    fire:function(type,data){
        $(document).trigger(type,data);
    }
}

//当监听 xxx 的时候，打印 niao
eventCenter.on('xxx',function(e,data){
	console.log('xxx',data)
})
eventCenter.fire('xxx','niao')
```

jQuery API
1. `.html()`有两种用法，第1种是获取匹配元素的 HTML 内容，第二种是设置匹配元素的 HTML 内容，要字符串的形式。
2. `.find()`通过一个选择器，jQuery对象，得到当前匹配的元素集合中的相应 。
3. `.getJSON(string)`通过 HTTP GET 请求从服务器获取 JSON 编码。
4. `deferred.done(function)`和`deferred.fail(function)`异步处理函数，成功时执行`.done()`里面的内容，失败后执行`.fail()`里面的内容。
5. `.length`得到匹配元素的数量。
6. `outerWidth([includeMargin])`可获取匹配元素的宽度，包括`padding`，`border`和选择性的`margin`，如果括号中是`true`，获取的宽度包含`margin`。要注意获得的宽度是不包含`px`单位的。
7. `.attr(attributeName[,value])`获得匹配元素的属性名称的值，加上`value`可以设置匹配元素的属性名称的值。
8. `.animation(properties[,duration][,easing][,function])`,`propertes`是 CSS 的 `value`和`key`，`duration`是持续的事件，`easing`是过度动画，`function`动画完成时需要执行的函数。
