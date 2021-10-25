import React from 'react';
import {SvgXml} from 'react-native-svg';

const xml = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" fill="currentColor">
<g >
	<g >
		<path  d="M486.4,25.6h-76.8V0H102.4v25.6H25.6C10.24,25.6,0,35.84,0,51.2v61.44c0,58.88,43.52,107.52,102.4,115.2v2.56
			c0,74.24,51.2,135.68,120.32,151.04L204.8,435.2h-58.88c-10.24,0-20.48,7.68-23.04,17.92L102.4,512h307.2l-20.48-58.88
			c-2.56-10.24-12.8-17.92-23.04-17.92H307.2l-17.92-53.76c69.12-15.36,120.32-76.8,120.32-151.04v-2.56
			c58.88-7.68,102.4-56.32,102.4-115.2V51.2C512,35.84,501.76,25.6,486.4,25.6z M102.4,176.64c-28.16-7.68-51.2-33.28-51.2-64V76.8
			h51.2V176.64z M307.2,256L256,227.84L204.8,256l12.8-51.2l-38.4-51.2h53.76L256,102.4l23.04,51.2h53.76l-38.4,51.2L307.2,256z
			 M460.8,112.64c0,30.72-23.04,58.88-51.2,64V76.8h51.2V112.64z"/>
	</g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>
`;

const Trophy = ({size, color}) => {
  return <SvgXml width={size} height={size} xml={xml} fill={color} />;
};

export default Trophy;
