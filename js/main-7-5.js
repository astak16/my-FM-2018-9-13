var eventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler);
    },
    fire: function (type, data) {
        $(document).trigger(type, data);
    }
};
var Footer = {
    init: function () {
        this.$footer = $(document).find('footer');
        this.$ul = this.$footer.find('ul');
        this.$box = this.$footer.find('.box');
        this.$leftBtn = this.$footer.find('.layout .icon-left');
        this.$rightBtn = this.$footer.find('.layout .icon-right');
        this.isToEnd = false;
        this.isToStart = true;
        this.isAnimate = false;
        this.bind();
        this.render();
    },
    bind: function () {
        var _this = this;
        this.$rightBtn.on('click', function () {
            if(_this.isAnimate) return;
            var liWidth = _this.$box.find('li').outerWidth(true);
            var boxWidth = _this.$box.outerWidth(true);
            var ulWidth = _this.$ul.outerWidth(true);
            var count = Math.floor(boxWidth / liWidth);
            if (!_this.isToEnd) {
                _this.isAnimate = true;
                _this.isToStart = false;
                _this.$ul.animate({
                    left: '-=' + count * liWidth
                }, 300, function () {
                    _this.isAnimate = false;
                    if (boxWidth - parseFloat(_this.$ul.css('left')) >= ulWidth) {
                        _this.isToEnd = true;
                    }
                });
            }
        });
        this.$leftBtn.on('click',function(){
            if(_this.isAnimate) return;
            var liWidth = _this.$box.find('li').outerWidth(true);
            var boxWidth = _this.$box.outerWidth(true);
            var ulWidth = _this.$ul.outerWidth(true);
            var count = Math.floor(boxWidth / liWidth);
            console.log(count);

            if(!_this.isToStart){
                _this.isAnimate = true;
                _this.isToEnd = false;
                _this.$ul.animate({
                    left:'+=' + count * liWidth
                },300,function(){
                    _this.isAnimate = false;
                    if(parseFloat(_this.$ul.css('left')) >= -5){
                        _this.isToStart = true;
                    }
                });
            }
        });
        this.$footer.find('.box').on('click','li',function(){
            $(this).addClass('active').siblings().removeClass('active');
            eventCenter.fire('select-album',{
                channelId:$(this).attr('channel-id'),
                channelName:$(this).attr('channel-name')
            })
        })

    },
    render: function () {
        var _this = this;
        $.getJSON('//api.jirengu.com/fm/getChannels.php')
            .done(function (ret) {
            _this.renderList(ret);
        });
    },
    renderList: function (ret) {
        var html = '';
        ret.channels.forEach(function (channel) {
            /* console.log(channel);*/
            html += '<li channel-id="' + channel.channel_id + '" channel-name="' + channel.name + '"</li>'
                 +  '    <div class="cover" style="background-image:url(' + channel.cover_small + ')"></div>'
                 +  '    <h3>' + channel.name + '</h3> '
                 +  '</li>'
        });
        this.$ul.html(html);
        this.setStyle();
    },
    setStyle: function () {
        var count = this.$ul.find('li').length;
        var liWidth = this.$ul.find('li').outerWidth(true);
        this.$ul.css({
            width: count * liWidth + 'px'
        });
    }
};
var FM = {
    init:function(){
        this.$container = $(document).find('#page-music');
        this.audio = new Audio();
        this.audio.autoplay = true;
        this.bind();
    },
    bind:function(){
        var _this = this;
        eventCenter.on('select-album',function(e,data){
            _this.channelId = data.channelId;
            _this.channelName = data.channelName;
            _this.loadMusic();

        });
        this.$container.find('.btn-play').on('click',function(){

            var $btn = $(this);
            if($btn.hasClass('icon-pause')){
                $btn.find('use')[0].href.baseVal = '#icon-bofang';
                $btn.removeClass('icon-pause').addClass('icon-play');
                _this.audio.pause();
            }else if($btn.hasClass('icon-play')){
                $btn.find('use')[0].href.baseVal = '#icon-weibiaoti519';
                $btn.removeClass('icon-play').addClass('icon-pause');
                _this.audio.play();
            }
        });
        this.$container.find('.btn-next').on('click',function(){
            _this.loadMusic();
        });
        this.audio.addEventListener('play',function(){
            // yong(_this.time);
            _this.time = setInterval(function(){
                _this.playGrogress();
            },1000);
        });
        this.audio.addEventListener('pause',function(){
            clearInterval(_this.time);
        })
    },
    loadMusic:function(){
        var _this = this
        $.getJSON('//api.jirengu.com/fm/getSong.php')
            .done(function(ret){
                _this.song = ret.song[0];
                // console.log(ret.song[0])
                _this.setMusic();
                _this.lyirc();
            })
    },
    setMusic:function(){
        // console.log(this.song)
        this.audio.src = this.song.url;
        $(document).find('.bg').css('background-image','url("'+ this.song.picture +'")');
        this.$container.find('.aside figure').css('background-image','url("'+this.song.picture+'")');
        this.$container.find('.detail .tag').text(this.channelName);
        this.$container.find('.detail h1').text(this.song.title);
        this.$container.find('.detail .author').text(this.song.artist);

        this.$container.find('.btn-play use')[0].href.baseVal = '#icon-weibiaoti519';
        this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause');
    },
    lyirc:function(){
        var _this = this;
        console.log(this);
        $.getJSON('//api.jirengu.com/fm/getLyric.php',{sid:this.song.sid})
            .done(function(ret){
                var lyric = ret.lyric;
                var lyricObj = {};
                lyric.split('\n').forEach(function(line){
                    var times = line.match(/\d{2}:\d{2}/g);
                    var str = line.replace(/\[.+?\]/g,'');
                    if(Array.isArray(times)){
                        lyricObj[times] = str;
                    }
                });
                _this.lyricObj = lyricObj;
            })
    },
    playGrogress:function(){
        var min = '0' + Math.floor(this.audio.currentTime / 60);
        var second = Math.floor(this.audio.currentTime % 60) + '';
        console.log(min,second);

        second = second.length === 2 ? second : '0' + second;
        this.$container.find('.current-time').text(min + ':' + second);
        this.$container.find('.bar-progress').css({
            width:this.audio.currentTime / this.audio.duration * 100 + '%'
        });
        var line = this.lyricObj[min + ':' + second];
        if(line){
            this.$container.find('.lyric p').text(line).boomText();
        }
    }
};

$.fn.boomText = function(type){
    type = type || 'rollIn';
    this.html(function(){
        var arr = $(this).text().split('').map(function(word){
            return '<span class="boomText">'+ word +'</span>'
        });
        console.log(arr);
        console.log(arr.join(''));
        return arr.join('');
    });
    var index = 0;
    var $boomText = this.find('span');
    var clock = setInterval(function(){
        $boomText.eq(index).addClass('animated ' + type);
        index++;
        if(index >=$boomText.length ){
            clearInterval(clock);
        }
    },300)
};
Footer.init();
FM.init();