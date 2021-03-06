(function (context, name) {
    var dui = context[name] = window.dui || {},
        isMobile = navigator.userAgent.match(/mobile/i), 
        inheritPrototype = function (subType, superType) {
            function F(){}
            F.prototype = superType.prototype;
            var prototype = new F();
            prototype.constructor = subType;
            subType.prototype = prototype;
        },
        currLength = 0;

    function Player (node) {
        dui.Radio.call(this, node);

        if (!(this instanceof Player)) {
            return new Player(node);
        } 

        this.node = node; 
        this.createPlayer(); 
    }

    inheritPrototype(Player, dui.Radio);

    Player.prototype.createPlayer = function () {
        var self = this,
            bnState = ['bn-play', 'bn-pause'],
            wrapper = document.createElement('div'), 
            markup = 
                '<span class="title"></span>' +
                '<span class="time">00:00</span>' +
                '<span class="bn-play"></span>' +
                (isMobile ? 
                '<span class="range"><b></b></span>' :
                '<span class="bn-seek"></span>' +
                '<input type="range" class="range" min="0" value="0">'); 

        // render player
        wrapper.setAttribute('class', 'db-player');
        wrapper.innerHTML = markup;
        wrapper.appendChild(this.track);
        this.node.appendChild(wrapper); 
 
        this.oTime = this.queryMine('.time');
        this.oTitle = this.queryMine('.title');
        this.oRange = this.queryMine('.range');
        this.oBnPlay = this.queryMine('.bn-play'); 
        this.oBnSeek = this.queryMine('.bn-seek');

        if (isMobile) {
            this.oBnMobileSeek = this.queryMine('.range b'); 
        }

        // attach events
        this.oBnPlay.addEventListener('click', function (e) {
            var sw = e.target.className === bnState[0] ? 1 : 0;
            e.target.setAttribute('class', bnState[sw]);
            self[sw ? 'play' : 'pause']();
        });

        this.oRange.addEventListener('change', function (e) {
            self.track.currentTime = e.target.value;
        });

        this.event({
            // reset max value of range input
            loadedmetadata: function () {
                if (!isMobile) {
                    self.oRange.setAttribute('max', ~~(self.track.duration));
                }
            },
            ended: function () {
                self.playNext();
                self.oBnPlay.setAttribute('class', 'bn-play');

                // change songslist style
                var currSongRow = self.queryMine('.playing');
                if (currSongRow.nextSibling !== null) {
                    currSongRow.setAttribute('class', '');
                    currSongRow.nextSibling.setAttribute('class', 'playing');
                }
            },
            playing: function () {
                if (self.oBnPlay.className !== 'bn-pause') {
                    self.oBnPlay.setAttribute('class', 'bn-pause');
                }
            },
            timeupdate: function () {
                currLength = ~~(self.track.currentTime * 237 / self.track.duration) + 'px';
                self.oTime.innerText = self.fomatTime(~~(self.track.duration - self.track.currentTime));
                self.oRange.value = ~~self.track.currentTime;

                if (isMobile) {
                    self.oRange.children[0].style.width = currLength;
                } else {
                    self.oRange.style.fontSize = ~~(self.track.currentTime) + 'px';
                    self.oBnSeek.style.width = currLength;
                }
            } 
        });
    }; 

    Player.prototype.initSong = function () {
        this.track.src = this.currSong.url;
        this.oTitle.innerText = this.currSong.name;
    }; 

    Player.prototype.queryMine = function (element) {
        return document.querySelector('#' + this.node.id + ' ' + element);
    };

    dui.Player = Player;
})(this, 'dui');
