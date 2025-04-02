rm leoiot-loading.webm
ffmpeg -framerate 1 -i leoiot-loading-%d.png -vcodec libvpx -acodec libvorbis -auto-alt-ref 0 leoiot-loading.webm
