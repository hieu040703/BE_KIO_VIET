#!/bin/bash
0 * * * * /root/bk.sh >> /root/backup.log 2>&1
5 * * * * /root/rclone.sh >> /root/rclone.log 2>&1