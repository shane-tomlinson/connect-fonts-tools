# connect-fonts-tools

A collection of tools to create [connect-fonts](https://github.com/shane-tomlinson/connect-fonts) and npm compatible packages.

## Usage

### Set up generic author/package maintainer information

Run `scripts/setup` to set up generic author information that can be used to create multiple font packs.

### Create a Font Pack

`scripts/create_fontpack` creates a connect-fonts compatible font pack from the .ttf files in a source directory. If you have already run `scripts/setup`, creating a font pack is easy:

```bash
<path_to_connect_fonts_tools>/scripts/create_fontpack --pn <pack_name> --sp <source_path> --tp <target_path>
```


If the font pack is for public use, additional parameters can be specified that will be placed inside the font pack's package.json and README.md files.

```bash
<path_to_connect_fonts_tools>/scripts/create_fontpack --pn <pack_name> --ph <pack_homepage_url> --pr <pack_repo_url> --pb <pack_bugtracker_url> --sp <source_path> --tp <target_path>
```

Once the pack is created, it can be published to npm:

```bash
cd <font_pack_directory>
npm publish
```

The font pack can then be installed from npm:
```bash
npm install <pack_name>
```

If the font pack is not to be published to the npm repository, it can be installed to another local project directory:

```bash
cd <target_project_dir>
npm install <font_pack_directory>
```

### Subset an already installed font pack

`scripts/subset` can be used to subset an already installed font pack into fonts that are locale-optimised.

```bash
cd node_modules/<font_directory>/fonts/default
<path_to_connect_fonts_tools>/script/subset --ss=<subsets> --sp <font_name or .> --tp ../ -o --wf
```

### Other tools
Tools exist to create individual portions of a font pack or npm module.

* `create_index` - create an index.js for use by connect-fonts
* `create_license` - create LICENSE
* `create_package_json` - create package.json for use by npm
* `create_readme` - create README.md file that contains font, author, license and repo information.
* `create_webfonts` - create .woff, .svg, and .eot fonts from a .ttf file
* `display_directory_metadata` - read and display the common metadata embedded in the .ttf files in a directory
* `display_file_metadata` - read and display the metadata embedded in a single .ttf file
* `normalize_filenames` - normalize all the filenames. Lowercases all filenames, expand -it to -italics, remove -webfont
* `subset` - subset a .ttf font into smaller, locale specific fonts

## Requirements

`create_fontpack` and `subset` make use of [FontForge](http://fontforge.org/).

FontForge can be installed in Mac OSX with Homebrew by typing `brew install fontforge`.
In Linux or Windows, see the directions provided by the [Open Font Library](http://openfontlibrary.org/en/guidebook/how_to_install_fontforge).


## Author:
* Shane Tomlinson
* shane@shanetomlinson.com
* stomlinson@mozilla.com
* set117@yahoo.com
* https://shanetomlinson.com
* http://github.com/stomlinson
* http://github.com/shane-tomlinson
* @shane_tomlinson

## Credits:
subset.py comes from [Google Font Directory](http://code.google.com/p/googlefontdirectory/) and is licensed under the Apache 2.0 license. Its authors are Raph Levien and Dave Crossland.

## Getting involved:
MOAR font packs!

Any updates to connect-fonts-tools are appreciated. All submissions will be reviewed and considered for merge.

## License:
This software is available under version 2.0 of the MPL:

  https://www.mozilla.org/MPL/

subset.py, from [Google Font Directory](http://code.google.com/p/googlefontdirectory/), is licensed under the Apache 2.0 license.

  http://www.apache.org/licenses/LICENSE-2.0

