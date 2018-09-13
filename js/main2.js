var eventCenter = {
    on:function(type,handler){
        $(document).on(type,handler)
    },
    fire:function(type,data){
        $(document).trigger(type,data)
    }
}

var Footer = {
    init:function(){
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.$box = this.$footer.find('.box')
        this.isToEnd = false
        this.isToStart = true
        this.isAnimate = false
        this.render()
        this.bind()
    },
    bind:function(){
        var _this = this


        this.$rightBtn.on('click',function(){
            /*
             isAnimate 是用来解决快速按 leftBtn ，上一动作还没结束，下一动作就已触发了。
             初始化设置 isAnimate 值为 false
             当 isAnimate 值为 true 时，直接跳出当前函数
             leftBtn 动作开始开始时， isAnimate 设置为 true，这时我在按下 leftBtn 时，isAnimate 值为 true 跳出
             当 leftBtn 触发 ul 向左移的动作结束时，将 isAnimate 值设为 false。
             rightBtn同理
            */
            if(_this.isAnimate) return

            /*
             点击右键，li 向左移动，移动距离是 .box 内 li 的个数,注意不是 ul 的宽度，
              ul 的宽度下面设置的是所有 li 加起来的宽度，而 .box 的宽度是 footer 的可视宽度。
            */
            var itemWidth = _this.$footer.find('li').outerWidth(true);
            var boxWidth = _this.$box.width()
            var ulWidth = _this.$ul.width()
            var rowWidth = Math.floor(boxWidth / itemWidth)
            // console.log(itemWidth,boxWidth,rowWidth)

            if(!_this.isToEnd){
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '-=' + rowWidth * itemWidth +'px'
                },400,function(){
                    _this.isAnimate = false
                    _this.isToStart = false
                    // console.log(typeof _this.$ul.css('left') )
                    /* .box 的宽度加上 ul 向左移动的距离（注意：左移的是负数，得到的还是字符串，需要转化成数字） >= ul 的宽度 */

                    if(boxWidth - parseFloat(_this.$ul.css('left') )>= ulWidth){
                        _this.isToEnd = true
                    }
                })
            }
        })

        this.$leftBtn.on('click',function(){
            if(_this.isAnimate) return
            var itemWidth = _this.$footer.find('li').outerWidth(true);
            var boxWidth = _this.$box.width()
            var ulWidth = _this.$ul.width()
            var rowWidth = Math.floor(boxWidth / itemWidth)

            if(!_this.isToStart){
                _this.isAnimate = true
                _this.$ul.animate({
                    left: '+=' + rowWidth * itemWidth +'px'
                },400,function(){
                    _this.isAnimate = false
                    _this.isToEnd = false
                    if(parseFloat(_this.$ul.css('left') )>= -5){
                        _this.isToStart = true
                    }
                })
            }
        })
        //这里的 this 是调用它的 Footer
        this.$footer.on('click','li',function(){
            //这里的 this 是事件代理的元素 li
            $(this).addClass('active').siblings().removeClass('active')
            eventCenter.fire('select-album',{
                channelId:$(this).attr('data-channel-id'),
                channelName:$(this).attr('data-channel-name')
            })
        })
    },
    render:function(){
        var _this = this
        $.getJSON('//api.jirengu.com/fm/getChannels.php',function(data){
            _this.renderFooter(data)
        })
    },
    renderFooter:function(data){

        var channels = data.channels
        var html = ''
        channels.forEach(function(channel){
            html += '<li data-channel-name="' + channel.name + '" data-channel-id="' + channel.channel_id + '">'
                 +  '<div class="cover" style="background-image:url(' + channel.cover_small + '")></div>'
                 +  '<h3>' + channel.name +'</h3>'
                 +  '</li>'
        })
        this.$ul.html(html)
        this.setStyle()
    },
    setStyle:function(){
        var count = this.$footer.find('li').length;
        var width = this.$footer.find('li').outerWidth(true);
        this.$ul.css({
            width : width * count + 'px'
        })
    }
}

var Fm = {
    init:function(){
        this.$container = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true
        this.bind()
    },
    bind:function(){
        var _this = this
        eventCenter.on('select-album',function(e,data){
            _this.channelId = data.channelId
            _this.channelName = data.channelName
            _this.loadMusic()
        })
        this.$container.find('.btn-play').on('click',function(){
            var $btn = $(this)
            if($btn.hasClass('icon-pause')){
                $btn.find('use')[0].href.baseVal = '#icon-bofang'
                $btn.removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()

            }else if($btn.hasClass('icon-play')){
                $btn.find('use')[0].href.baseVal = '#icon-weibiaoti519'
                $btn.removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            }
        })
        this.$container.find('.btn-next').on('click',function(){

            _this.loadMusic()
        })
        this.audio.addEventListener('play',function(){
            clearInterval(_this.time)
            _this.time = setInterval(function(){
                _this.updateMusic()
            },1000)
        })
        this.audio.addEventListener('pause',function(){
            clearInterval(_this.time)
        })
    },
    loadMusic:function(){
        var _this = this
        $.getJSON('//api.jirengu.com/fm/getSong.php',function(ret){
            _this.song = ret.song[0]
            _this.setSong()
            _this.lyric(ret.song[0])
        })

    },
    setSong:function(){
        // console.log(channelObj)
        this.audio.src = this.song.url
        $('.bg').css('background','url('+ this.song.picture +')')
        this.$container.find('.aside figure').css('background-image','url('+ this.song.picture +')')
        this.$container.find('.detail .tag').text(this.channelName )
        this.$container.find('.detail h1').text(this.song.title)
        this.$container.find('.detail .author').text(this.song.artist)

        //按下一首的时候重置按钮播放按钮
        this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
        this.$container.find('.btn-play use')[0].href.baseVal = '#icon-weibiaoti519'

    },
    lyric:function(){
        var _this = this
        $.getJSON('//api.jirengu.com/fm/getLyric.php',{sid:this.song.sid})
            .done(function(ret){
                var lyric = ret.lyric
                var lyricObj = {}
                lyric.split('\n').forEach(function(line){
                   var time = line.match(/\d{2}:\d{2}/g);
                   var str = line.replace(/\[.+?\]/g,'')
                   if(Array.isArray(time)){
                       lyricObj[time] = str;
                   }
                })
                _this.lyricObj = lyricObj
            })
    },
    updateMusic:function(){
        var min ='0' +  Math.floor(this.audio.currentTime / 60)
        var second = Math.floor(this.audio.currentTime % 60) + ''
        second = second.length === 2 ? second : '0' + second
        this.$container.find('.current-time').text(min + ':' + second)
        this.$container.find('.bar-progress').css({
            width:this.audio.currentTime / this.audio.duration * 100 + '%'
        })

        //console.log(this.audio.currentTime,this.audio.duration)

        var line = this.lyricObj[min + ':' + second]
        // console.log(line)
        if(line){
            this.$container.find('.detail p').text(line).boomText()
        }
    }
}
$.fn.boomText = function(type){
    type = type || 'rollIn'
    // console.log(this)

    this.html(function(){
        var arr = $(this).text().split('').map(function(word){
            return '<span class="boomText">' + word + '</span>'
        })
        return arr.join('')
    })
    var index = 0
    var $boomTexts = $(this).find('span')
    var clock = setInterval(function(){
        $boomTexts.eq(index).addClass('animated '+type)
        index++
        if(index >= $boomTexts.length){
            clearInterval(clock)
        }
    },300)
}
Footer.init()
Fm.init()