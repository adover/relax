if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        };
    } )();
}
(function() {

    var test3dTimeline = {
        0 : {
            "opacity": 0,
            "scale3d":[1,1,1]
        },
        50 : {
            "opacity": 1,
            "scale3d":[1,1,1]
        },
        100 : {
            "opacity": 0,
            "scale3d":[0.8,0.8,1]
        }
    }


        var Parallax = function(selector){
            var _this = this;
            this.el = document.querySelector(selector);
            this.scenes = document.querySelectorAll('.scene');

            this.windowHeight = window.outerHeight;
            this.windowWidth = window.outerWidth;

            this.scrollTop = document.body.scrollTop;

            this.currentScene = 0;

            this.percentage;

            this.getChildren = function(){
                
                var sceneChildren = {};

                for(var i = 0; i < this.scenes.length; i++){
                    sceneChildren[i] = this.scenes[i].children;
                }

                return sceneChildren;
            }

            this.getTotalLength = function(){
                var tl = 0;

                for(var i = 0; i < this.scenes.length; i++){
            
                    this.scenes[i].setAttribute('data-from', this.percentToPx(tl));

                    if(this.scenes[i].hasAttribute('data-length')){
                        tl += parseInt(this.scenes[i].getAttribute('data-length'));
                    }else{
                         tl += 100;
                    }

                    if(this.scenes[i].hasAttribute('data-offset')){
                        tl += parseInt(this.scenes[i].getAttribute('data-offset'));
                    }
                    
                    this.applyHeightsToScenes(i);

                    this.scenes[i].setAttribute('data-to', this.percentToPx(tl));
                }

                return this.percentToPx(tl);
                
            }

            this.percentToPx = function(value) {
                value = Math.round((value/100) * this.windowHeight);
                return value;
            }

            this.setParallaxHeight = function(){

                return this.el.style.height = this.getTotalLength() + "px";
            }

            this.applyHeightsToScenes = function(i){
                var s = this.scenes[i];
                var h = s.hasAttribute('data-length') ? this.percentToPx(parseInt(s.getAttribute('data-length'))) : this.percentToPx(100);

                s.style.height = h + "px"
            }

            this.getCurrentScene = function(st){

                for(var i = 0; i < this.scenes.length; i++){
                    var s = this.scenes[i];
                    if(st >= s.getAttribute('data-from') && st <= s.getAttribute('data-to')){
                        return i;
                    }
                }
            }

            this.getPositionInScene = function(){

                for(var i = 0; i < this.scenes.length; i++){
                    var s = this.scenes[i];
                    var sHeight = parseFloat(s.style.height);
                    var fromTo = [s.getAttribute('data-from'), s.getAttribute('data-to')];
                    var distance = (this.scrollTop + this.windowHeight) - fromTo[0];
                    var percentage;

                    if (fromTo[0] > (this.scrollTop + this.windowHeight)) {
                        percentage = 0;
                    } else if ((fromTo[0] + sHeight) < this.scrollTop) {
                        percentage = 100;
                    }else{
                        percentage = distance / ((this.windowHeight + sHeight) / 100);
                    }

                    percentage = Math.round(percentage);
                    s.setAttribute('data-inview', percentage);
                }

            }

            this.getDefaultForProp = function(prop){
                switch (prop){
                    case "scale3d":
                        return [1,1,1]
                    break;
                    case "translate3d":
                        return [0,0,0]
                    break;
                    case "rotateX":
                        return 0
                    break;
                    case "rotateY":
                        return 0
                    break;
                    case "opacity":
                        return 1
                    break;
                }
            }

            this.getValueForCurrentPos = function(obj1, obj2, prop, pc){
                var lowerVals = this.containsProp(obj1, prop)
                var upperVals = this.containsProp(obj2, prop)
                switch (prop){
                    case "scale3d":
                    case "translate3d":
                        var vals = [];
                        for(var i = 0; i < lowerVals.length; i++){
                            var px = prop == "translate3d" ? "px" : "";
                            vals.push(_this.currentValCalc(lowerVals[i], upperVals[i],pc) + px)
                        }
                        return vals;
                    break;
                    case "rotateX":
                    case "rotateY":
                    case "opacity":
                        return _this.currentValCalc(lowerVals, upperVals,pc);
                    break;
                }
            }

            this.currentValCalc = function(lowerVals, upperVals,pc){
                if(upperVals > lowerVals){
                    return ((upperVals - lowerVals) / 100 * pc) + lowerVals
                }else{
                    return ((100 - pc) * (lowerVals - upperVals) / 100) + upperVals;
                }
            }

            this.containsProp = function(obj, prop){
                if(prop in obj){
                    return obj[prop]
                }else{
                    return this.getDefaultForProp(prop)
                }
            }

            this.convertObjToCSSString = function(obj){
                
                var str = "";

                for(key in obj){
                    if(obj.hasOwnProperty(key)){
                        str += key + "(" + obj[key] + ") ";
                    }
                }
                str = str.trim();
                return str;
            }

            this.updateElems = function(){

                for(var i = 0; i < this.scenes.length; i++){
                    var s = this.scenes[i];
                    var fromTo = [s.getAttribute('data-from'), s.getAttribute('data-to')];
                    var diff = this.scrollTop - fromTo[0];
                    var viewAmount = parseInt(s.getAttribute('data-inview'));

                    if(viewAmount > 0 && viewAmount < 100){
                        for(var j = 0; j < s.children.length; j++){
                            var c = s.children[j];

                            var transformObject = {};
                            var opacity = 1;

                            // NOTE: Speed gets overwritten by timeline
                            if(c.hasAttribute('data-speed')){
                                var speed = c.getAttribute('data-speed');
                                var modifier = Math.abs((diff * speed) - diff);
                                transformObject = {
                                    "translate3d": "0," + modifier + "px, 0"
                                }

                            }else if(c.hasAttribute('data-timeline')){
                                var thisTimeline = eval(c.getAttribute('data-timeline'));
                                var lowerLim = 0;
                                var upperLim = 0;
                                var keys = [];
                                for(var key in thisTimeline){
                                    keys.push(key);
                                }

                                for(var k = 0; k < keys.length; k++){
                                    if(parseInt(keys[k]) <= viewAmount){
                                        lowerLim = keys[k];
                                        
                                    }else if(parseInt(keys[k]) > viewAmount){
                                        upperLim = keys[k];
                                        break;
                                    }
                                }

                                var lowerLimProps = thisTimeline[lowerLim];
                                var upperLimProps = thisTimeline[upperLim];
                                var fraction = 100 / (upperLim - lowerLim);
                                var pc = fraction * (viewAmount - lowerLim);

                                opacity = _this.getValueForCurrentPos(lowerLimProps, upperLimProps, "opacity", pc);

                                transformObject = {
                                    "translate3d" : _this.getValueForCurrentPos(lowerLimProps, upperLimProps, "translate3d", pc), 
                                    "scale3d" : _this.getValueForCurrentPos(lowerLimProps, upperLimProps, "scale3d", pc), 
                                    "rotateX" : _this.getValueForCurrentPos(lowerLimProps, upperLimProps, "rotateX", pc), 
                                    "rotateY" : _this.getValueForCurrentPos(lowerLimProps, upperLimProps, "rotateY", pc)

                                }   
                            }

                            c.style.opacity = opacity;
                            c.style.transform = this.convertObjToCSSString(transformObject);
                        }
                    }
                    
                }
            }

            update = function(){
                _this.scrollTop = document.body.scrollTop;
                _this.updateElems();
                _this.getPositionInScene();
                requestAnimationFrame(this.update);
            }

            this.setParallaxHeight();
            requestAnimationFrame(update);

            return this;
        }

        var P = new Parallax('.parallax');

})();