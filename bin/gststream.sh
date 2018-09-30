#!/bin/sh
gst-launch-1.0 v4l2src ! 'video/x-raw,width=800,height=600,framerate=24/1' \
  ! omxh264enc target-bitrate=1000000 control-rate=1 \
  ! 'video/x-h264,profile=high' ! h264parse \
  ! rtph264pay config-interval=1 pt=96 ! udpsink host=127.0.0.1 port=8004
