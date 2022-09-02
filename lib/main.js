"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const axios_1 = __importDefault(require("axios"));
const node_fetch_1 = __importDefault(require("node-fetch"));
function getBundlers(assets) {
    return __awaiter(this, void 0, void 0, function* () {
        let linux = [
            assets.filter((asset) => asset.name.endsWith(".AppImage.tar.gz"))[0][`browser_download_url`],
            "_signature_",
        ];
        let mac = [
            assets.filter((asset) => asset.name.endsWith(".app.tar.gz"))[0][`browser_download_url`],
            "_signature_",
        ];
        let win = [
            assets.filter((asset) => asset.name.endsWith(".msi.zip"))[0][`browser_download_url`],
            "_signature_",
        ];
        let sig_data = [
            assets.filter((asset) => asset.name.endsWith(".AppImage.tar.gz.sig"))[0][`browser_download_url`],
            assets.filter((asset) => asset.name.endsWith(".app.tar.gz.sig"))[0][`browser_download_url`],
            assets.filter((asset) => asset.name.endsWith(".msi.zip.sig"))[0][`browser_download_url`],
        ];
        for (let i = 0; i < sig_data.length; i++) {
            let resp = yield axios_1.default.get(sig_data[i], {
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
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, node_fetch_1.default)("https://api.github.com/repos/arandomusernametouse/trivia-app/releases/latest")
                .then((json) => json.json())
                .then((data) => __awaiter(this, void 0, void 0, function* () {
                const files = yield getBundlers(data.assets);
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
            }));
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
            }
        }
    });
}
run();
