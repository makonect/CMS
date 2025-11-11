import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon
} from 'react-share';

const SocialShare = ({ title, url }) => {
  const shareText = `Check out this article: ${title}`;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 mr-2">Share:</span>
      <FacebookShareButton url={url} quote={shareText}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={shareText}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={url} title={shareText}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
    </div>
  );
};

export default SocialShare;