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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_chromium_1 = require("playwright-chromium");
const express_1 = __importDefault(require("express"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const dotenv_1 = __importDefault(require("dotenv"));
const googleapis_1 = require("googleapis");
const shelljs_1 = __importDefault(require("shelljs"));
const readline_1 = __importDefault(require("readline"));
const fs = __importStar(require("fs"));
const posix_1 = __importDefault(require("path/posix"));
const discord_webhook_node_1 = require("discord-webhook-node");
dotenv_1.default.config();
const app = (0, express_1.default)();
const hook = new discord_webhook_node_1.Webhook((_a = process.env.DISCORD) !== null && _a !== void 0 ? _a : 'undefined');
hook.success('success', 'test');
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.post('/', (req, res) => {
    const file = req.body.zipFile;
    if (!file) {
        res.status(400).json({ error: 'Skinpack was not provided.' });
        return;
    }
    const buffer = Buffer.from(file, 'base64');
    const zip = new adm_zip_1.default(buffer);
    fs.existsSync('temp') && fs.rmSync('temp', { recursive: true, force: true });
    fs.mkdirSync('temp');
    zip.extractAllToAsync('temp', true, false, (e) => {
        if (e) {
            res.status(500).json({ error: 'Encountered an error while extracting the skinpack.' });
            return;
        }
    });
    res.status(200).json({ success: 'Skinpack is being binded to the app, you will be notified via the webhook when the task is complete.' });
    return main();
});
app.listen(5050, () => console.log('[Skinpacker] : listening to requests'));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const device = playwright_chromium_1.devices['Galaxy S9+'];
        const browser = yield playwright_chromium_1.chromium.launch({ chromiumSandbox: false });
        const context = yield browser.newContext(Object.assign({ acceptDownloads: true }, device));
        const page = yield context.newPage();
        try {
            yield page.goto('https://mcpehub.org/download-mcpe/', { timeout: 60000 });
            const value = yield page.locator(`:nth-match(span[class=\"transparent-grey regular\"], 1)`).textContent();
            if (value == null)
                throw new Error("version is null");
            if (value.split("").filter(x => x == ".").length != 3)
                throw new Error("version is invalid");
            const version = value.substring(1, value.length - 1);
            console.log(`[Skinpacker] : downloading minecraft pe official v${version}`);
            yield page.click(`:nth-match(a:has-text("СКАЧАТЬ"), 2)`);
            const downloadPromise = page.waitForEvent('download');
            yield page.click('a:has-text("Скачать бесплатно")');
            const download = yield downloadPromise;
            yield download.saveAs('temp/unmodified.apk');
            console.log(`[Skinpacker] : download complete`);
            console.log(`[Skinpacker] : decompiling the apk`);
            shelljs_1.default.exec(`apktool d temp/unmodified.apk -o temp/output -f`);
            // modify files here
            console.log(`[Skinpacker] : modifying files`);
            fs.rmSync('temp/output/assets/skin_packs/persona', { recursive: true, force: true });
            fs.mkdirSync('temp/output/assets/skin_packs/persona');
            fs.readdirSync('temp/persona').forEach(x => {
                fs.renameSync(posix_1.default.join(`temp/persona/${x}`), `temp/output/assets/skin_packs/persona/${x}`);
            });
            console.log(`[Skinpacker] : rebuilding the apk`);
            shelljs_1.default.exec(`apktool b temp/output -o temp/modified.apk`);
            console.log('Skinpacker] : signing the apk');
            shelljs_1.default.exec('jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore skinpacker.keystore temp/modified.apk skinpacker  -storepass skinpacker123');
            console.log(`[Skinpacker] : build complete`);
            console.log(`[Skinpacker] : preparing to upload to drive`);
            const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
            oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
            const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
            const fileSize = fs.statSync(`temp/modified.apk`).size;
            const upload = yield drive.files.create({
                requestBody: {
                    name: `minecraft-pe-${version}-official-4D-skinpack.apk`,
                    parents: ['1ji5nWh7qGpC6hBeAeVNxAAbCaSgB9IMp'],
                    mimeType: 'application/vnd.android.package-archive',
                },
                media: {
                    mimeType: 'application/vnd.android.package-archive',
                    body: fs.createReadStream(`temp/modified.apk`),
                },
            }, {
                onUploadProgress: evt => {
                    const progress = (evt.bytesRead / fileSize) * 100;
                    readline_1.default.clearLine(process.stdout, 0);
                    readline_1.default.cursorTo(process.stdout, 0, undefined);
                    process.stdout.write(`[Skinpacker] : uploading to drive (${Math.round(progress)}%)`);
                },
            });
            if (upload.data.id == null)
                throw new Error("file upload failed");
            yield drive.permissions.create({ fileId: upload.data.id, requestBody: { role: 'reader', type: 'anyone' } });
            const url = yield drive.files.get({ fileId: upload.data.id, fields: 'webContentLink' });
            // hook.success("MCSkinpacker", `Skinpack request -> ${url.data.webContentLink ?? 'file not found'}`)
            const IMAGE_URL = 'https://homepages.cae.wisc.edu/~ece533/images/airplane.png';
            hook.setUsername('MCSkinpacker');
            hook.setAvatar(IMAGE_URL);
            hook.send("Hello shameel!");
            hook.send("Hello there!");
        }
        catch (e) {
            console.log(e.message);
        }
        finally {
            fs.existsSync('temp') && fs.rmSync('temp', { recursive: true, force: true });
            return;
        }
    });
}
;
