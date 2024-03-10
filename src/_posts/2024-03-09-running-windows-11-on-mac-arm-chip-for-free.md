---
title: Running Windows 11 On Mac Arm Chip For Free
categories: []
date: 2024-03-09
description: |
  A blog post describing how to run Windows 11 on a Mac M1 / M2 / ARM chip.
published: true
---

Running Windows 11 on MacOS for ARM Architecture is more work than I ever expected.

Bootcamp? Dead.

Parallels? Expensive.

VMWare? Same as parallels.

VirtualBox? Doesn't support M* / ARM chips.

Enter: QEMU.

The problem with QEMU is their CLI rivals that of FFMPEG, ImageMagick, or any other
C-based library that has been around forever. The CLI is full of many options and magical incantations.
So to side step this, we'll use a GUI called "UTM"

<https://mac.getutm.app/>

Once you've downloaded UTM. Open up the `.dmg`, drag it into Applications, and then open it.

![Picture of UTM start screen](/images/utm-start-screen.png)

You'll notice we don't have a `.iso` file to run. And if you visit the documentation for Windows 11, it'll tell you to download a tool called [Crystal Fetch](https://github.com/TuringSoftware/CrystalFetch)

Docs for Windows 11: <https://docs.getutm.app/guides/windows/>

[Crystal Fetch Download](https://github.com/TuringSoftware/CrystalFetch/releases/latest/download/CrystalFetch.dmg)

After downloading and extracting the `.dmg`, you should see the following screen for Crystal Fetch.

![Picture of Crystal Fetch Startup Screen](/images/crystal-fetch-screen.png)

Click the "Download" button in the bottom right corner to start downloading the Windows 11 ISO.

<%= render Alert.new(type: :info) do %>
  Sometimes the crystal fetch download doesn't go where you want. If you can't find the downloads, check this location:

  `~/Library/Containers/llc.turing.CrystalFetch/Data/Library/Caches/`

  For possible downloads.
<% end %>

Now that you've installed the `.iso` for Windows 11, go back to UTM and select "Create a new virtual machine".

The next step is important. I could not get "Emulate" to work on my Mac M1. Instead, make sure to choose "Virtualize".

![Picture of "Virtualize"](/images/utm/virtualize.png)

Then select "Windows"

![Picture of choosing Windows](/images/utm/windows.png)

At the next screen, you will choose the ISO image by clicking the "browse" button.

![Choose ISO image](/images/utm/choose-iso-image.png)

The next few pictures will outline the setup I chose. I left everything as the default, except for storage size which I bumped up to 100gb because many blog posts recommended it.

![Picture of hardware screen](/images/utm/hardware.png)

![Picture of storage screen](/images/utm/storage.png)

![Picture of shared directory screen](/images/utm/shared-directory.png)

![Picture of summary screen](/images/utm/summary.png)

Once you've made it through the setup, you should be back at the start screen of UTM. From this screen, you should then be able start your virtualizer by clicking on the play button.

![Picture of play button](/images/utm/play-button.png)

When your virtualizer boots up you should see a screen like this that say "Press any key to boot from CD/DVD". Press any key and you should be able to skip the next few steps around shell setup.

![Picture of any key to boot](/images/utm/any-key-to-boot.png)

If you missed the "Press any key to boot screen", you may end up in a shell that looks like the following:

![Picture of shell screen](/images/utm/shell-screen.png)

If you end up here, type: `exit` into the shell, and then go to "Boot Manager", and then select the first option.

![Picture of boot manager screen](/images/utm/boot-manager.png)

![Picture of choosing first option](/images/utm/select-qemu-harddisk.png)

Assuming everything went well for you, you should end up at the Windows 11 Setup Screen like below.

Follow the instructions for installation on the screen.

![Picture of initial windows setup screen](/images/utm/setup-screen.png)

Assuming everything went well, you should end up with Windows 11 working inside of UTM / QEMU!

![Picture of final windows setup screen](/images/utm/final-screen.png)

Good luck, and enjoy your new found power! Please also considering donating to UTM, QEMU, and CrystalFetch, without whom, the above wouldn't be possible.
