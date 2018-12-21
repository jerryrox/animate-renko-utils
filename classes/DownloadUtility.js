/**
 * Class that handles downloading of things while supporting multiple platforms.
 * 
 * Access "renko.downloadUtility" to use this class.
 */
class DownloadUtility {

    /**
     * Requests download of specified canvas as file name.
     * @param {Object} canvas 
     * @param {string} imageType
     * @param {string} fileName 
     */
    downloadCanvasImage(canvas, imageType, fileName) {
        if(renko.isIE() || renko.isEdge()) {
            this.handleDownload_ie_edge(canvas.msToBlob(), fileName);
        }
        else if(renko.isMobileDevice() && renko.isSafari()) {
            this.handleDownload_mobileSafari(canvas.toDataURL("image/" + imageType));
        }
        else {
            this.handleDownload_default(canvas.toDataURL("image/" + imageType), fileName);
        }
    }

    /**
     * Requests download of specified blob objects as file name.
     * @param {Object} blob
     * @param {string} fileName
     */
    downloadBlob(blob, fileName) {
        if(renko.isIE() || renko.isEdge()) {
            this.handleDownload_ie_edge(blob, fileName);
        }
        else if(renko.isMobileDevice() && renko.isSafari()) {
            this.handleDownload_mobileSafari(window.URL.createObjectURL(blob));
        }
        else {
            this.handleDownload_default(window.URL.createObjectURL(blob), fileName);
        }
    }

    /**
     * Internal function that handles download process for IE and Edge.
     */
    handleDownload_ie_edge(blob, fileName) {
        window.navigator.msSaveBlob(blob, fileName);
    }

    /**
     * Internal function that handles download process for mobile Safari.
     */
    handleDownload_mobileSafari(url) {
        window.open(url);
    }

    /**
     * Internal function that handles download process for other browsers.
     */
    handleDownload_default(url, fileName) {
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.href = url;
        link.download = fileName;
        link.click();
        document.body.removeChild(link);
    }
}
renko.downloadUtility = new DownloadUtility();