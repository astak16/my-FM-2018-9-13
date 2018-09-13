var EventCenter ={
    on:function(type,handler){
        $(document).on(type,handler);
    },
    fire:function(type,data){
        $(document).trigger(type,data);
    }
};
var Footer = {
    init:function(){
        this.$footer = $('footer');
        this.$box = this.$footer.find('.box');
        this.$ul = this.$footer.find('ul');
        this.$rightBtn = this.$footer.find('.icon-right');
        this.$leftBtn = this.$footer.find('.icon-left');
        this.isToEnd = false;
        this.isToStart = true;
        this.isAnimate = false;
        this.bind();
        this.getList();
    },
    bind:function(){
        var _this = this;
        this.$rightBtn.on('click',function(){
            if(_this.isAnimate) return;
            var boxWidth = _this.$box.width();
            var liWidth = Math.floor(_this.$box.find('li').outerWidth(true));
            var count = Math.floor(boxWidth / liWidth)

            if(!_this.isToEnd){
                _this.isToStart = false;
                _this.isAnimate = true;
                _this.$ul.animate({
                    left: '-=' + liWidth * count
                },300,function(){
                    _this.isAnimate = false;
                    if(boxWidth - parseInt(_this.$ul.css('left')) >= _this.$ul.width()){
                        _this.isToEnd = true;
                    }
                })
            }
        })
        this.$leftBtn.on('click',function(){
            if(_this.isAnimate) return;
            var boxWidth = _this.$box.width();
            var liWidth = Math.floor(_this.$box.find('li').outerWidth(true));
            var count = Math.floor(boxWidth / liWidth)
                if(!_this.isToStart){
                _this.isToEnd = false
                _this.isAnimate = true;

                _this.$ul.animate({
                    left: '+=' + liWidth * count
                },300,function(){
                    _this.isAnimate = false;

                    if(parseInt(_this.$ul.css('left')) >= -5){
                        _this.isToStart = true;
                    }
                })
            }
        })
        this.$ul.on('click','li',function(){
            $(this).addClass('active').siblings().removeClass('active');

            EventCenter.fire('select-ablum',{
                channelName:$(this).attr('channel-name'),
                channelId:$(this).attr('channel-id')
            })
        })
    },
    getList:function(){
        var _this = this;
        $.getJSON('//api.jirengu.com/fm/getChannels.php')
            .done(function(ret){
                _this.setList(ret.channels);
            }).fail(function(){
                console.log('error...');
            })
    },
    setList:function(ret){
        var html = '';
        ret.forEach(function(line){
            html += '<li channel-name="'+line.name+'" channel-id="'+ line.channel_id +'">'
                        +      '<div class="cover" style="background-image:url('+ line.cover_small +');"></div>'
                        +      '<h3>'+ line.name +'</h3>'
                        +  '</li>'
        });
        this.$ul.html(html);
        this.setStyle();
    },
    setStyle:function(){
        var count = this.$ul.find('li').length;
        var liWidth = this.$ul.find('li').outerWidth(true);
        this.$ul.css({
            width:count * liWidth + 'px'
        });
    }
};
var FM ={
    init:function(){
        this.$container = $('#page-music');
        this.$bg = $('.bg');
        this.$btnPlay = this.$container.find('.btn-play')
        this.$btnNext = this.$container.find('.btn-next')
        this.$figure = this.$container.find('figure');
        this.$tag = this.$container.find('.detail .tag');
        this.$h1 = this.$container.find('.detail h1');
        this.$author = this.$container.find('.detail .author');

        this.audio = new Audio();
        this.audio.autoplay = true;
        this.bind()
    },
    bind:function(){
        var _this = this;
        EventCenter.on('select-ablum',function(e,channel){
            _this.channelName = channel.channelName
            _this.channelId = channel.channelId
            _this.getSong()
        });
        this.$btnPlay.on('click',function(){
            var $btn = $(this)
            if($btn.hasClass('icon-pause')){
                $btn.find('use')[0].href.baseVal = '#icon-bofang';
                $btn.addClass('icon-play').removeClass('icon-pause');
                _this.audio.pause();
            }else if($btn.hasClass('icon-play')){
                $btn.find('use')[0].href.baseVal = '#icon-weibiaoti519';
                $btn.addClass('icon-pause').removeClass('icon-play');
                _this.audio.play()
            }
        });
        this.$btnNext.on('click',function(){
            _this.getSong()
        });
        this.audio.addEventListener('play',function(){
            clearInterval(_this.clock);
            _this.clock = setInterval(function(){
                _this.playGrogress();
            },1000);

        });
        this.audio.addEventListener('pause',function(){
            clearInterval(_this.clock);
        });
    },
    getSong:function(){
        var _this = this
        $.getJSON('//api.jirengu.com/fm/getSong.php')
            .done(function(ret){
                _this.song = ret.song[0]
                _this.setSong()
                _this.getLyric()
            })
    },
    setSong:function(){
        this.audio.src = this.song.url;
        this.$bg.css('background-image','url("'+ this.song.picture +'")');
        this.$figure.css('background-image','url("'+ this.song.picture +'")');
        this.$tag.text(this.channelName);
        this.$h1.text(this.song.title);
        this.$author.text(this.song.artist);
        this.$btnPlay.find('use')[0].href.baseVal = '#icon-weibiaoti519';
        this.$btnPlay.addClass('icon-pause').removeClass('icon-play');
    },
    getLyric:function(){
        var _this = this;
        $.getJSON('//api.jirengu.com/fm/getLyric.php',{sid:this.song.sid})
            .done(function(ret){
                _this.setLyric(ret);
            })
    },
    setLyric:function(ret){
        var lyric = ret.lyric;
        var lyricObj = {};
        lyric.split('\n').forEach(function(line){
            var times = line.match(/\d{2}:\d{2}/g);
            var str = line.replace(/\[(.+?)\]/g,'');
            if(Array.isArray(times)){
                lyricObj[times] = str;
            }
        })
        this.lyricObj = lyricObj;
    },
    playGrogress:function(){
        var min = '0' + Math.floor(this.audio.currentTime / 60);
        var second = Math.floor(this.audio.currentTime % 60) + '';
        second = second.length === 2 ? second : '0' + second;
        this.$container.find('.current-time').text(min +':'+second);
        this.$container.find('.bar-progress').css('width',this.audio.currentTime / this.audio.duration * 100 + '%');

        var line = this.lyricObj[min + ':' + second];
        if(line){
            this.$container.find('.lyric p').text(line).BoomText()
        }
    }

}
$.fn.BoomText = function(type){
    type = type || 'rollIn';
    this.html(function(){
        var arr = $(this).text().split('').map(function(word){
            return '<span class="boomText">'+word+'</span>'
        })
        return arr.join('')
    });
    var index = 0;
    var $boomText = this.find('span')
    var clock = setInterval(function(){
        $boomText.eq(index).addClass('animated '+ type)
        index++;
        if(index >= $boomText.length){
            clearInterval(clock)
        }
    },300)
}
Footer.init();
FM.init()