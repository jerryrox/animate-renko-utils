/**
 * Utility class that provides interaction with the canvas.
 * 
 * Addess "renko.canvasUtility" to use this class.
 */
class CanvasUtility {

    /**
     * Saves the specified canvas element to a JPEG image with full dimensions.
     * @param {object} c 
     * @param {string} imageType 
     * @param {string} fileName 
     */
    saveAsImage(c, imageType, fileName) {
        if(renko.isNullOrUndefined(c)) {
            c = canvas;
        }
        if(renko.isNullOrUndefined(imageType)) {
            imageType = "jpeg";
        }

        if(renko.isIE() || renko.isEdge())
        {
            window.navigator.msSaveBlob(c.msToBlob(), fileName);
        }
        else
        {
            if(renko.isMobileDevice() && renko.isSafari())
            {
                window.open(c.toDataURL("image/" + imageType));
            }
            else
            {
                var link = document.createElement("a");
                document.body.appendChild(link);
                link.href = c.toDataURL("image/" + imageType);
                link.download = fileName;
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    /**
     * Saves the specified canvas element within the rect of values between 0~1.
     * Rect[0], Rect[1] are the ratios from 0 to 1, indicating the starting position.
     * Rect[2], Rect[3] are the ratios from 0 to 1, indicating the size from starting position.
     * @param {object} c 
     * @param {Array<number>} rect 
     * @param {string} imageType
     * @param {string} fileName 
     */
    saveAsImageCrop(c, rect, imageType, fileName) {
        if(renko.isNullOrUndefined(c)) {
            c = canvas;
        }
        if(renko.isNullOrUndefined(rect)) {
            rect = [0, 0, 1, 1];
        }
        if(renko.isNullOrUndefined(this.hiddenCanvas)) {
            this.hiddenCanvas = document.createElement("canvas");
            this.hiddenCanvas.setAttribute("id", "hiddenCanvas");
            this.hiddenCanvas.style.display = "none";
        }

        var hiddenCanvas = this.hiddenCanvas;
        rect[0] = c.width * rect[0];
        rect[1] = c.height * rect[1];
        rect[2] = c.width * rect[2];
        rect[3] = c.height * rect[3];

        hiddenCanvas.width = rect[2];
        hiddenCanvas.height = rect[3];
        hiddenCanvas.getContext("2d").drawImage(c, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);

        this.saveAsImage(hiddenCanvas, imageType, fileName);
    }
}
renko.canvasUtility = new CanvasUtility();