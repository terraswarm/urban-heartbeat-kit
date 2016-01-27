Intel Edison Gateway Setup from Scratch
=======================================

1. Download the latest version of [Ubilinux](http://www.emutexlabs.com/ubilinux).
At the time of making this guide it is
[150309](http://www.emutexlabs.com/files/ubilinux/ubilinux-edison-150309.tar.gz).
Ubilinux is a Debian version for the Edison.

    Note: 150309 is a quite old version that runs kernel version 3.10 that came
    out in June 2013. We're hoping for a newer version to be
    [released soon](http://www.emutexlabs.com/support-forums/ubilinux/84-new-ubilinux-version).

2. Untar Ubilinux.

        mkdir ubilinux
        mv ubilinux-edison-150309.tar.gz ubilinux
        cd ubilinux
        tar xf ubilinux-edison-150309.tar.gz

3. Flash Ubilinux to the Edison. Plug the Gateway into your computer with
the right micro USB connected (the one inbetween the two other USB headers
on the board. Make sure the switch near the USB headers is flipped to the left.

        cd toFlash
        sudo ./flashall.sh
        
4. Plug in a micro USB cable to the left micro USB port. Connect to
the edison over UART with something like:

        miniterm.py /dev/ttyUSB0 115200

4. Login with

        user: edison
        pass: edison

5. Change password:

        passwd

6. Become root to install sudo

        su
        apt-get install sudo

7. Allow edison to sudo:

        usermod -a -G sudo edison
        # exit su with ctrl+d

8. Install dependencies

        sudo apt-get install vim bluetooth bluez libbluetooth-dev libudev-dev


Remaining Setup
---------------

See the
[shared instructions](https://github.com/terraswarm/urban-heartbeat-kit/blob/master/docs/gateway-setup-scratch-common.md).





Copying image
-------------

Found some good instructions
[here](https://communities.intel.com/message/258584#258584)

