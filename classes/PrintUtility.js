class PrintUtility {

    printCanvas() {
        const mywindow = window.open('', 'PRINT', `height=${renko.appHeight},width=${renko.appWidth}`);

        mywindow.document.write('<html><head><title>' + document.title  + '</title>');
        mywindow.document.write('</head><body style="padding:0; margin:0;">');
        mywindow.document.write(`<image src="${canvas.toDataURL("image/jpeg")}" style="width:100vw; height:auto; position:absolute; left:0; right:0;"></image>`);
        mywindow.document.write('</body></html>');
    
        mywindow.document.close();
        mywindow.focus();
        
        mywindow.onload = function() {
            mywindow.print();
            mywindow.close();
        }
    }

    printFromUrl(url) {
        const newWindow = window.open(url, "PRINT", `height=${renko.appHeight},width=${renko.appWidth}`);
        newWindow.onload = function() {
            newWindow.print();
            newWindow.close();
        };
    }

    printFromHtml(source) {
        const mywindow = window.open('', 'PRINT', `height=${renko.appHeight},width=${renko.appWidth}`);

        mywindow.document.write(source);
        mywindow.document.close();
        mywindow.focus();
        
        mywindow.onload = function() {
            mywindow.print();
            mywindow.close();
        }
    }
}
renko.printUtility = new PrintUtility();