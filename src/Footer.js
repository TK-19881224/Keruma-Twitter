import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="text-center text-sm text-gray-500 mt-10 py-4">
      <div className="space-x-4">
        <Link to="/terms" className="hover:underline">
          利用規約
        </Link>
        <Link to="/privacy" className="hover:underline">
          プライバシーポリシー
        </Link>
      </div>
      <div className="mt-2">© {new Date().getFullYear()} YourAppName</div>
    </footer>
  );
};

export default Footer;