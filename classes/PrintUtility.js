class PrintUtility {

    printCanvas() {
        var mywindow = window.open('', 'PRINT', 'height=' + renko.appHeight + ',width=' + renko.appWidth);
        if(renko.isNullOrUndefined(mywindow))
            return;

        mywindow.document.write('<html><head><title>' + document.title + '</title>');
        mywindow.document.write("<script>window.onload = function() { window.focus(); window.print(); }</script>");
        mywindow.document.write('</head><body style="padding:0; margin:0;">');
        mywindow.document.write('<image src="' + canvas.toDataURL("image/jpeg") + '" style="width:100vw; height:auto; position:absolute; left:0; right:0;"></image>');
        mywindow.document.write('</body></html>');
        mywindow.document.close();
    }
}
renko.printUtility = new PrintUtility();