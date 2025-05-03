# [Nexus](https://github.com/aarontburn/nexus-core): Steam Monkey

<img src="./src/assets/icon.png" alt="Steam Monkey Icon" width="200"/>

A module for [Nexus](https://github.com/aarontburn/nexus-core) to "embed" Steam as a Nexus module...

And by "embed", this just takes your Steam window and monkeys it around.



<p align="center">
  <img src="./assets/image.png" alt="Steam Monkey Sample" width="1000"/>
</p>

## Required Dependencies
### Module Dependencies
You will need the following modules installed into Nexus.
- [**Monkey Core**](https://github.com/aarontburn/nexus-monkey-core)

### Application Dependencies
The following applications need to be installed to your computer.
- [**Steam**](https://store.steampowered.com/about/)

## Installation
1. Download and install all dependencies.
2. Download the latest release `.zip`. 
3. In Nexus, navigate to **Settings** > **Import Module**
4. Select the downloaded `.zip` file to install.


## Usage
- On startup (or when the `Locate window` button is pressed), Steam Monkey will look for your open Steam window, and, if found within 10 seconds, will start monkeying the window into Nexus.
- By providing a path to your Steam executable in the Settings, you unlock the following features:
  -  Opening the Steam app while it's already embedded into Nexus will swap to the Steam Monkey module.
  -  The `Locate window` button will start a new instance of Steam if one isn't found.



## Limitations:
- The Steam icon will remain on the taskbar (unlike other Monkey apps), but when pressed, this will activate Nexus regardless.
