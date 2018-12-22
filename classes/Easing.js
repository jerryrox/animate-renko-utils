const Easing = {};

Easing.Linear = function(t, start, change, duration) {
    return change * t + start;
}
Easing.EaseOut = function(t, start, change, duration) {
    return Easing.QuadEaseOut(t, start, change, duration);
}
Easing.EaseIn = function(t, start, change, duration) {
    return Easing.QuadEaseIn(t, start, change, duration);
}
Easing.ExpoEaseOut = function(t, start, change, duration) {
    return t === 1 ? start + change : change * (-Math.pow(2, -10 * t) + 1) + start;
}
Easing.ExpoEaseIn = function(t, start, change, duration) {
    return t === 0 ? start : change * Math.pow(2, 10 * (t - 1)) + start;
}
Easing.ExpoEaseInOut = function(t, start, change, duration) {
    if(t === 0) return start;
    if(t === 1) return start + change;
    if((t *= 2) < 1) {
        return change * 0.5 * Math.pow(2, 10 * (t - 1)) + start;
    }
    return change * 0.5 * (-Math.pow(2, -10 * --t) + 2) + start;
}
Easing.ExpoEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.ExpoEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.ExpoEaseIn(t * 2 - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.CircEaseOut = function(t, start, change, duration) {
    return change * Math.sqrt(1 - (t = t - 1) * t) + start;
}
Easing.CircEaseIn = function(t, start, change, duration) {
    return -change * (Math.sqrt(1 - t * t) - 1) + start;
}
Easing.CircEaseInOut = function(t, start, change, duration) {
    if((t *= 2) < 1) {
        return -change * 0.5 * (Math.sqrt(1 - t * t) - 1) + start;
    }
    return change * 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1) + start;
}
Easing.CircEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.CircEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.CircEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.QuadEaseOut = function(t, start, change, duration) {
    return -change * t * (t - 2) + start;
}
Easing.QuadEaseIn = function(t, start, change, duration) {
    return change * t * t + start;
}
Easing.QuadEaseInOut = function(t, start, change, duration) {
    if((t *= 2) < 1) {
        return change * 0.5 * t * t + start;
    }
    return -change * 0.5 * ((--t) * (t - 2) - 1) + start;
}
Easing.QuadEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.QuadEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.QuadEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.SineEaseOut = function(t, start, change, duration) {
    return change * Math.sin(t * (Math.PI * 0.5)) + start;
}
Easing.SineEaseIn = function(t, start, change, duration) {
    return -change * Math.cos(t * (Math.PI * 0.5)) + change + start;
}
Easing.SineEaseInOut = function(t, start, change, duration) {
    if((t *= 2) < 1) {
        return Easing.SineEaseIn(t, start, change * 0.5, duration);
    }
    return Easing.SineEaseOut(t - 1, start + change*0.5, change * 0.5, duration);
}
Easing.SineEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.SineEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.SineEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.CubicEaseOut = function(t, start, change, duration) {
    return change * ((t = t - 1) * t * t + 1) + start;
}
Easing.CubicEaseIn = function(t, start, change, duration) {
    return change * t * t * t + start;
}
Easing.CubicEaseInOut = function(t, start, change, duration) {
    if((t *= 2) < 1) {
        return change * 0.5 * t * t * t + start;
    }
    return change * 0.5 * ((t -= 2) * t * t + 2) + start;
}
Easing.CubicEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.CubicEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.CubicEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.QuartEaseOut = function(t, start, change, duration) {
    return -change * ((t = t - 1) * t * t * t - 1) + start;
}
Easing.QuartEaseIn = function(t, start, change, duration) {
    return change * t * t * t * t + start;
}
Easing.QuartEaseInOut = function(t, start, change, duration) {
    if((t *= 2) < 1) {
        return change * 0.5 * t * t * t * t + start;
    }
    return -change * 0.5 * ((t -= 2) * t * t * t - 2) + start;
}
Easing.QuartEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.QuartEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.QuartEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.QuintEaseOut = function(t, start, change, duration) {
    return change * ((t = t - 1) * t * t * t * t + 1) + start;
}
Easing.QuintEaseIn = function(t, start, change, duration) {
    return change * t * t * t * t * t + start;
}
Easing.QuintEaseInOut = function(t, start, change, duration) {
    if ((t *= 2) < 1) {
        return change * 0.5 * t * t * t * t * t + start;
    }
    return change * 0.5 * ((t -= 2) * t * t * t * t + 2) + start;
}
Easing.QuintEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.QuintEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.QuintEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.ElasticEaseOut = function(t, start, change, duration) {
    if(t === 1) {
        return start + change;
    }
    
    var p = duration * 0.3;
    var s = p * 0.25;
    
    return (change * Math.pow(2, -10 * t) * Math.sin((t * duration - s) * (2 * Math.PI) / p) + change + start);
}
Easing.ElasticEaseIn = function(t, start, change, duration) {
    if(t === 1) {
        return start + c;
    }
    
    var p = duration * 0.3;
    var s = p * 0.25;
    
    return -(change * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * duration - s) * (2 * Math.PI) / p)) + start;
}
Easing.ElasticEaseInOut = function(t, start, change, duration) {
    if((t *= 2) === 2) {
        return start + c;
    }
    
    var p = duration * 0.45;
    var s = p * 0.25;
    
    if(t < 1)
        return -0.5 * (change * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * duration - s) * (2 * Math.PI) / p)) + start;
    return change * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * duration - s) * (2 * Math.PI) / p) * 0.5 + change + start;
}
Easing.ElasticEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.ElasticEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.ElasticEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.BounceEaseOut = function(t, start, change, duration) {
    if (t < 0.36363) {
        return change * (7.5625 * t * t) + start;
    }
    else if(t < 0.72726) {
        return change * (7.5625 * (t -= 0.545445) * t + 0.75) + start;
    }
    else if(t < 0.909075) {
        return change * (7.5625 * (t -= 0.8181675) * t + 0.9375) + start;
    }
    else {
        return change * (7.5625 * (t -= 0.95452875) * t + 0.984375) + start;
    }
}
Easing.BounceEaseIn = function(t, start, change, duration) {
    return change - Easing.BounceEaseOut(1 - t, 0, change, duration) + start;
}
Easing.BounceEaseInOut = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.BounceEaseIn(t * 2, 0, change, duration) * 0.5 + start;
    }
    return Easing.BounceEaseOut(t * 2 - 1, 0, change, duration) * 0.5 + change * 0.5 + start;
}
Easing.BounceEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.BounceEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.BounceEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}
Easing.BackEaseOut = function(t, start, change, duration) {
    return change * ((t = t - 1) * t * (2.70158 * t + 1.70158) + 1) + start;
}
Easing.BackEaseIn = function(t, start, change, duration) {
    return change * t * t * (2.70158 * t - 1.70158) + start;
}
Easing.BackEaseInOut = function(t, start, change, duration) {
    var s = 1.70158;
    if((t *= 2) < 1) {
        return change * 0.5 * (t * t * (((s *= 1.525) + 1) * t - s)) + start;
    }
    return change * 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + start;
}
Easing.BackEaseOutIn = function(t, start, change, duration) {
    if(t < 0.5) {
        return Easing.BackEaseOut(t * 2, start, change * 0.5, duration);
    }
    return Easing.BackEaseIn((t * 2) - 1, start + change * 0.5, change * 0.5, duration);
}