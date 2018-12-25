/**
 * A class that provides RNG feature.
 */
class Random {

    sign() {
        return Math.random() < 0.5 ? -1 : 1;
    }

    range(min, max) {
        return Math.random() * (max - min) + min;
    }

    insideUnitCircle() {
        var point = this.onUnitCircle();
        var magnitude = Math.random();
        return [point[0] * magnitude, point[1] * magnitude];
    }

    onUnitCircle() {
        var x = this.range(-1, 1);
        var y = this.sign() * Math.sqrt(1 - x*x);
        if(Math.random() < 0.5) {
            return [x, y];
        }
        else {
            return [y, x];
        }
    }
}
renko.random = new Random();