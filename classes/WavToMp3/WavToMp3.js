class WavToMp3 {

    constructor() {
        this.convertInternal = this.convertInternal.bind(this);
        this.resultBlob = null;
    }

    getBlob() {
        return this.resultBlob;
    }

    getBlobUrl() {
        return window.URL.createObjectURL(this.resultBlob);
    }

    convert(blob, callback) {
        const instance = this;
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            instance.convertInternal(this.result, callback);
        });
        reader.readAsArrayBuffer(blob);
    }

    convertInternal(reader, callback) {
        var arrayBuffer = reader;
        var buffer = new Uint8Array(arrayBuffer);
        var data = this.parseWav(buffer);

        var config = {
            mode : 0,
            channels: 2,
            samplerate: data.sampleRate,
            bitrate: data.bitsPerSample
        };

        var mp3codec = Lame.init();
        Lame.set_mode(mp3codec, config.mode || Lame.MONO);
        Lame.set_num_channels(mp3codec, config.channels || 2);
        Lame.set_num_samples(mp3codec, config.samples || -1);
        Lame.set_in_samplerate(mp3codec, config.samplerate || 44100);
        Lame.set_out_samplerate(mp3codec, config.samplerate || 44100);
        Lame.set_bitrate(mp3codec, config.bitrate || 192);
        Lame.init_params(mp3codec);

        var array = this.uint8ArrayToFloat32Array(data.samples);
        var mp3data = Lame.encode_buffer_ieee_float(mp3codec, array, array);

        this.resultBlob = new Blob([mp3data.data], {type: "audio/mp3"});

        Lame.encode_flush(mp3codec);
        Lame.close(mp3codec);
        mp3codec = null;

        callback();
    }

    parseWav(wav) {
        function readInt(i, bytes) {
            var ret = 0,
                shft = 0;

            while (bytes) {
                ret += wav[i] << shft;
                shft += 8;
                i++;
                bytes--;
            }
            return ret;
        }
        if (readInt(20, 2) != 1) {
            throw 'Invalid compression code, not PCM';
        }
        return {
            sampleRate: readInt(24, 4),
            bitsPerSample: readInt(34, 2),
            samples: wav.subarray(4)
        };
    }
      
    uint8ArrayToFloat32Array(u8a) {
        var f32Buffer = new Float32Array(u8a.length);
        for (var i = 0; i < u8a.length; i++) {
            var value = u8a[i<<1] + (u8a[(i<<1)+1]<<8);
            if (value >= 0x8000) {
                value |= ~0x7FFF;
            }
            f32Buffer[i] = value / 0x8000;
        }
        return f32Buffer;
    }
}


/* TEST SCRIPT */
var ac = new AudioCombiner();
ac.addFiles([
	"./1.MP3",
	"./2.MP3",
	"./3.MP3",
	"./4.MP3",
	"./5.MP3",
	"./6.MP3",
	"./7.MP3",
	"./8.MP3",
	"./9.MP3",
	"./10.MP3",
	"./11.MP3",
	"./12.MP3",
	"./13.MP3",
	"./14.MP3",
	"./15.MP3",
	"./16.MP3",
]);
ac.combineAudio(function(isSuccess) {
	if(!isSuccess) {
		return;
    }
    const converter = new WavToMp3();
    converter.convert(ac.getBlob(), function() {
        var aud = document.getElementById("myAudio");
        aud.src = converter.getBlobUrl();
        aud.play();
    });
});