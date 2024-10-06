import { NextRequest, NextResponse } from 'next/server';

const parseXML = (xml: string, tagName: string) => {
    const startTag = `<${tagName}>`;
    const endTag = `</${tagName}>`;
    const start = xml.indexOf(startTag) + startTag.length;
    const end = xml.indexOf(endTag);
    let value = xml.substring(start, end);

    if (value.startsWith('<![CDATA[') && value.endsWith(']]>')) {
        value = value.substring(9, value.length - 3);
    }

    return value;
};

export async function GET(req: NextRequest): Promise<Response> {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    const BASE_URL = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&refine=true&simple=false&format=xml&type=road&key=A399B687-B71F-39A6-B2AB-3EEAA5C2CC37`;

    const response = await fetch(`${BASE_URL}&address=${address}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.text();

    const longitude = parseXML(data, 'x');
    const latitude = parseXML(data, 'y');

    return NextResponse.json({ latitude, longitude });
}
