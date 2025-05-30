// ShareButtons.js
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  LineShareButton,
  LineIcon,
} from "react-share";

import { ReactComponent as XIcon } from "./x-icon.svg"; // ✅ SVGアイコン（自分で追加）

const ShareButtons = ({ url, title }) => {
    console.log("ShareButtons 受け取りURL:", url); // ← 追加
  return (
    <div className="flex gap-4 mt-4">
      <TwitterShareButton url={url} title={title}>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-black flex items-center justify-center">
          <XIcon className="w-5 h-5 text-white" />
        </div>
      </TwitterShareButton>
      <FacebookShareButton url={url} quote={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <LineShareButton url={url} title={title}>
        <LineIcon size={32} round />
      </LineShareButton>
    </div>
  );
};

export default ShareButtons; // ✅ default export