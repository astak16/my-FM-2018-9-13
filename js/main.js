var eventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler);
    },
    fire: function (type, data) {
        $(document).trigger(type, data);
    }
}


var footer = {

    init: function () {
        // console.log(this)
        this.$footer = $('footer');
        this.$ul = this.$footer.find('ul');
        this.$box = this.$footer.find('.box');
        this.$leftBtn = this.$footer.find('.icon-left');
        this.$rightBtn = this.$footer.find('.icon-right');
        this.isToEnd = false;
        this.isToStart = true;
        this.isAnimate = false;
        this.bind();
        this.render();
    },
    bind: function () {
        // console.log(this)
        var _this = this;
        this.$rightBtn.on('click', function () {
            if (_this.isAnimate) return
            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowWidth = Math.floor(_this.$box.width() / itemWidth);
            if (!_this.isToEnd) {
                _this.isAnimate = true;
                _this.$ul.animate({
                    left: '-=' + rowWidth * itemWidth
                }, 400, function () {
                    _this.isAnimate = false;
                    _this.isToStart = false

                    // console.log(_this.$box.width())
                    // console.log(_this.$ul.css('left'))
                    // console.log(_this.$ul.width())

                    //box 的宽度(固定的，footer.width) - ul向左移动的宽度（负数） >= ul 的宽度（li.Length * li.width），停止向左移动
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width())) {
                        _this.isToEnd = true
                    }
                })
            }
        })
        this.$leftBtn.on('click', function () {
            if (_this.isAnimate) return
            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowWidth = Math.floor(_this.$box.width() / itemWidth);
            if (!_this.isToStart) {
                _this.isAnimate = true;
                _this.$ul.animate({
                    left: '+=' + rowWidth * itemWidth
                }, 400, function () {
                    _this.isAnimate = false;
                    _this.isToEnd = false

                    // console.log(_this.$box.width())
                    // console.log(_this.$ul.css('left'))

                    //ul 向右移动，left为正，当 left > 0时，停止向右移动（这里情况比较特殊，不会正好等于0）
                    if (parseFloat(_this.$ul.css('left')) >= -5) {
                        _this.isToStart = true
                    }
                })
            }
        })
        this.$footer.on('click', 'li', function () {
            console.log(1)
            $(this).addClass('active').siblings().removeClass('active')
            console.log($(this).attr('data-channel-id'))

            eventCenter.fire('select-album', {
                channelId: $(this).attr('data-channel-id'),
                channelName: $(this).attr('data-channel-name')
            })
        })
    },
    render: function () {
        var _this = this;
        $.getJSON("//api.jirengu.com/fm/getChannels.php")
            .done(function (ret) {
                // console.log(ret)
                // console.log(this);
                _this.renderFooter(ret.channels)
            }).fail(function () {
            console.log('error')
        })
    },
    renderFooter: function (channels) {
        var html = '';
        channels.forEach(function (channel) {
            // console.log(channel)
            html += '<li data-channel-id=' + channel.channel_id + ' data-channel-name=' + channel.name + '>'
                + '  <div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>'
                + '  <h3>' + channel.name + '</h3>'
                + '</li>'
        })
        this.$ul.html(html)
        this.setStyle()
    },
    setStyle: function () {
        var count = this.$footer.find('li').length;
        var width = this.$footer.find('li').outerWidth(true);
        this.$ul.css({
            width: count * width + 'px'
        })
    }
}

var fm = {
    init: function () {
        this.$container = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true;
        this.bind()
    },
    bind: function () {
        var _this = this;
        eventCenter.on('select-album', function (e, channleObj) {
            _this.channelId = channleObj.channelId;
            _this.channelName = channleObj.channelName;
            _this.loadMusic()
        })
        this.$container.find('.btn-play').on('click', function () {
            var $btn = $(this)
            if ($btn.hasClass('icon-pause')) {
                $btn.find('use')[0].href.baseVal = '#icon-bofang'
                $btn.removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()

            } else if ($btn.hasClass('icon-play')) {
                $btn.find('use')[0].href.baseVal = '#icon-weibiaoti519'
                // console.log($btn.find('use')[0].href)
                $btn.removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            }
        })
        this.$container.find('.btn-next').on('click', function () {
            _this.loadMusic()
        })
        this.audio.addEventListener('play', function () {
            clearInterval(_this.time)
            _this.time = setInterval(function () {
                _this.updateMusic()
            }, 1000)
        })
        this.audio.addEventListener('pause', function () {
            clearInterval(_this.time)
        })
    },
    loadMusic: function () {
        var _this = this
        // console.log('music...')
        $.getJSON('//api.jirengu.com/fm/getSong.php', {channelId: this.channelId})
            .done(function (ret) {
                _this.song = ret.song[0]

                _this.setMusic()
                _this.lyric()
            })
    },
    setMusic: function () {
        console.log(this.song)
        this.audio.src = this.song.url
        $('.bg').css('background-image', 'url(' + this.song.picture + ')')
        this.$container.find('.aside figure').css('background-image', 'url(' + this.song.picture + ')')
        this.$container.find('.detail h1').text(this.song.title)
        this.$container.find('.detail .author').text(this.song.artist)
        this.$container.find('.detail .tag').text(this.channelName)


    },
    updateMusic: function () {
        var min = Math.floor(this.audio.currentTime / 60)
        var second = Math.floor(this.audio.currentTime % 60) + ''
        second = second.length === 2 ? second : '0' + second
        this.$container.find('.current-time').text(min + ':' + second)
        this.$container.find('.bar-progress').css('width', this.audio.currentTime / this.audio.duration * 100 + '%')

        var line = this.lyricObj['0' + min + ':' + second]
        if(line){
            this.$container.find('.lyric p').text(line).boomText()
        }
    },
    lyric:function(){
        var _this = this
        $.getJSON('//api.jirengu.com/fm/getLyric.php',{sid:this.song.sid})
            .done(function(ret){
                var lyric = ret.lyric       //获取歌词
                var lyricObj = {}
                lyric.split('\n').forEach(function(line){
                    var times = line.match(/\d{2}:\d{2}/g)
                    var str = line.replace(/\[.+?\]/g,'')
                    if(Array.isArray(times)){
                        lyricObj[times] = str;
                    }
                })
                _this.lyricObj = lyricObj
                console.log(_this.lyricObj)
            })
    }
}

$.fn.boomText = function(type){

    type = type || 'rollIn'
    console.log(type)

    this.html(function(){
        var arr = $(this).text().split('').map(function(word){
            return '<span class="boomText">' + word + '</span>'
        })
        return arr.join('')
    })

    var index = 0;
    var $boomTexts = $(this).find('span')
    var clock = setInterval(function(){
        $boomTexts.eq(index).addClass('animated ' + type)
        index++
        if(index >= $boomTexts.length){
            clearInterval(clock)
        }
    },300)

}

footer.init()
fm.init()
