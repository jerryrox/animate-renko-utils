/**
 * Helper class which helps conversion of hexadecimal colors to float values.
 * 
 * Access renko.hexColor to use this class.
 */
class HexColor {

    // this.byteReciprocal;

    constructor() {
        this.byteReciprocal = 1 / 255;
    }

    /**
     * Converts specified string of hexadecimal color into an object containing r, g, b, a values from 0~1.
     * @param {string} hex
     */
    create(hex) {
        if(hex.startsWith("#")) {
            hex = hex.substring(1);
        }
        hex = hex.toLowerCase();

        var hexToNumber = this.hexToNumber;
        var color = { r:255, g:255, b:255, a:255 };

        switch(hex.length) {
            case 3: {
                color.r = hexToNumber(hex.charCodeAt(0));
                color.r = color.r * 16 + color.r;
                color.g = hexToNumber(hex.charCodeAt(1));
                color.g = color.g * 16 + color.g;
                color.b = hexToNumber(hex.charCodeAt(2));
                color.b = color.b * 16 + color.b;
                break;
            }
            case 4: {
                color.r = hexToNumber(hex.charCodeAt(0));
                color.r = color.r * 16 + color.r;
                color.g = hexToNumber(hex.charCodeAt(1));
                color.g = color.g * 16 + color.g;
                color.b = hexToNumber(hex.charCodeAt(2));
                color.b = color.b * 16 + color.b;
                color.a = hexToNumber(hex.charCodeAt(3));
                color.a = color.a * 16 + color.a;
                break;
            }
            case 6: {
                color.r = hexToNumber(hex.charCodeAt(0)) * 16 + hexToNumber(hex.charCodeAt(1));
                color.g = hexToNumber(hex.charCodeAt(2)) * 16 + hexToNumber(hex.charCodeAt(3));
                color.b = hexToNumber(hex.charCodeAt(4)) * 16 + hexToNumber(hex.charCodeAt(5));
                break;
            }
            case 8: {
                color.r = hexToNumber(hex.charCodeAt(0)) * 16 + hexToNumber(hex.charCodeAt(1));
                color.g = hexToNumber(hex.charCodeAt(2)) * 16 + hexToNumber(hex.charCodeAt(3));
                color.b = hexToNumber(hex.charCodeAt(4)) * 16 + hexToNumber(hex.charCodeAt(5));
                color.a = hexToNumber(hex.charCodeAt(6)) * 16 + hexToNumber(hex.charCodeAt(7));
                break;
            }
            default: {
                console.log("HexColor.create - Invalid string was given: " + hex);
                break;
            }
        }

        color.r *= this.byteReciprocal;
        color.g *= this.byteReciprocal;
        color.b *= this.byteReciprocal;
        color.a *= this.byteReciprocal;
        return color;
    }

    /**
     * (Internal)
     * Converts specified char code to number value.
     * @param {number} char
     * @returns {number}
     */
    hexToNumber(char) {
        if(char < 58) return char - 48;
        else if(char > 64 && char < 71) return char - 55;
        else if(char > 96 && char < 103) return char - 87;
        return 0;
    }
}
renko.hexColor = new HexColor();