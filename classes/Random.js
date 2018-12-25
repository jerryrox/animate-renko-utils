/**
 * A class that provides RNG feature.
 */
class Random {

    /**
     * Returns a value of either -1 or 1.
     */
    sign() {
        return Math.random() < 0.5 ? -1 : 1;
    }

    /**
     * Returns a random value between min and max.
     * @param {number} min 
     * @param {number} max 
     */
    range(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Returns an array (length 2) of random values inside a unit circle.
     */
    insideUnitCircle() {
        var point = this.onUnitCircle();
        var magnitude = Math.random();
        return [point[0] * magnitude, point[1] * magnitude];
    }

    /**
     * Returns an array (length 2) or random values on the edge of a unit circle.
     */
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