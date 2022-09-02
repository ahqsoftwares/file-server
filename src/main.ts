import * as core from "@actions/core";
import * as fs from "fs";
import axios from "axios";
import fetch from "node-fetch";

async function getBundlers(assets: any) {
  let linux = [
    assets.filter((asset: any) => asset.name.endsWith(".AppImage.tar.gz"))[0][
      `browser_download_url`
    ],
    "_signature_",
  ];
  let mac = [
    assets.filter((asset: any) => asset.name.endsWith(".app.tar.gz"))[0][
      `browser_download_url`
    ],
    "_signature_",
  ];
  let win = [
    assets.filter((asset: any) => asset.name.endsWith(".msi.zip"))[0][
      `browser_download_url`
    ],
    "_signature_",
  ];

  let sig_data = [
    assets.filter((asset: any) =>
      asset.name.endsWith(".AppImage.tar.gz.sig")
    )[0][`browser_download_url`],
    assets.filter((asset: any) => asset.name.endsWith(".app.tar.gz.sig"))[0][
      `browser_download_url`
    ],
    assets.filter((asset: any) => asset.name.endsWith(".msi.zip.sig"))[0][
      `browser_download_url`
    ],
  ];

  for (let i = 0; i < sig_data.length; i++) {
    let resp: any = await axios.get(sig_data[i], {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(resp.data, "utf-8");
    switch (i) {
      case 0:
        linux[1] = buffer.toString();
        break;
      case 1:
        mac[1] = buffer.toString();
        break;
      default:
        win[1] = buffer.toString();
    }
  }

  return { linux, mac, win };
}

async function run(): Promise<void> {
  try {
    fetch(
      "https://api.github.com/repos/arandomusernametouse/trivia-app/releases/latest"
    )
      .then((json) => json.json())
      .then(async (data: any) => {
        const files: any = await getBundlers(data.assets);
        const json = {
          version: String(data.tag_name),
          notes: "Please update to ensure latest features!",
          platforms: {
            "windows-x86_64": {
              signature: files.win[1],
              url: files.win[0],
            },
            "linux-x64_64": {
              signature: files.linux[1],
              url: files.linux[0],
            },
            "darwin-x86_64": {
              signature: files.mac[1],
              url: files.mac[0],
            },
            "darwin-aarch64": {
              signature: files.mac[1],
              url: files.mac[0],
            },
          },
        };

        fs.writeFileSync("./update_info.json", JSON.stringify(json));
      });
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
