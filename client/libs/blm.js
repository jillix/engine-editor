(function (root) {

    var _prepares = []
      , _leaves = []
      ;

    function PrepareElm(func, minSpeed, minY, delay) {
        this.func = func;
        this.min_speed = minSpeed === undefined ? -170 : minSpeed;
        this.min_y = minY === undefined ? 200 : minY;
        this.ignore_timeout = delay === undefined ? 1000 : delay;
        this.ignore = false;
    }

    function LeaveElm(input) {
        var self = this;
        switch(typeof input) {
            case "string":
                self.message = input;
                break;
            case "function":
                self.func = input;
                break;
            default:
                throw new Error("The input should be a string or a function.");
                break;
        }
    }

    LeaveElm.prototype.run = function (e) {
        return this.message || this.func.call(this, e) || "";
    };

    function Cursor(x, y, speedX, speedY, dX, dY) {
        this.x = x;
        this.y = y;
        this.speed_x = speedX;
        this.speed_y = speedY;
        this.delta_x = dX;
        this.delta_y = dY;
    }

    var timestamp = null
      , lastMouseX = null
      , lastMouseY = null
      ;


    this.addEventListener("mouseleave", function (e) {

        if (e.clientY <= 0) {
            lastMouseY = 0;
            lastMouseX = e.clientX;
        }

        // Check the prepares
        _prepares.forEach(function (c) {
            if (c.ignore) { return; }
            c.func.call(c, new Cursor(
                lastMouseX, lastMouseY
              , null, null
              , null, null
            ));
            c.ignore = true;
            c.setTimeout = setTimeout(function () {
                c.ignore = false;
                timestamp = null;
            }, c.ignore_timeout);
        });
    });

    this.addEventListener("mousemove", function(e) {

        if (timestamp === null) {
            timestamp = Date.now();
            lastMouseX = e.screenX;
            lastMouseY = e.screenY;
            return;
        }

        var now = Date.now()
          , dt =  now - timestamp
          , dx = e.screenX - lastMouseX
          , dy = e.screenY - lastMouseY
          , speedX = Math.round(dx / dt * 100)
          , speedY = Math.round(dy / dt * 100)
          ;

        if (dt === 0) {
            speedX = Infinity;
            speedY = Infinity;
        }

        timestamp = now;
        lastMouseX = e.screenX;
        lastMouseY = e.screenY;

        // Check the prepares
        _prepares.forEach(function (c) {
            if (lastMouseY > c.min_y
            || speedY >= 0
            || c.min_speed > speedY
            || c.ignore) { return; }
            c.func.call(c, new Cursor(
                lastMouseX, lastMouseY
              , speedX, speedY
              , dx, dy
            ));
            c.ignore = true;
            c.setTimeout = setTimeout(function () {
                c.ignore = false;
                timestamp = null;
            }, c.ignore_timeout);
        });
    });

    // Listen for the beforeunload event
    this.onbeforeunload =function (e) {
        var res = []
          , str = ""
          , i = 0
          , c = null
          ;

        for (; i < _leaves.length; ++i) {
            c = _leaves[i];
            res.push(c.run(e).trim());
        }

        str = res.filter(Boolean).join("\n");

        if (str.trim().length === 0) { return undefined; }
        return str;
    };

    /**
     * blm
     * Do something *before leaving me*.
     *
     * @name blm
     * @function
     * @param {String|Function} input A string representing the message to show before the window is closed or a function returning that value.
     * @return {Object} The `blm` object.
     */
    function blm(input) {
        _leaves.push(new LeaveElm(input));
        return blm;
    }

    /**
     * prepare
     * ...or before *preparing* to leave me. Catch the moment when the user
     * moves the mouse in the top side of the page (and most probably wants
     * to close the window).
     *
     * @name prepare
     * @function
     * @param {Function} func A function to be called when the user moves the mouse to the top of the page.
     * @param {Number} speed The minimum mouse vertical speed (default: `-200`).
     * @param {Number} delay The number of miliseconds between two moments when we're trying to catch the mouse leave.
     * @return {Object} The `blm` object.
     */
    blm.prepare = function (func, speed, delay) {
        _prepares.push(new PrepareElm(func, speed, delay));
        return blm;
    };

    module.exports = blm;
})(window);
