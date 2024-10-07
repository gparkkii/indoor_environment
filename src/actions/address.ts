import { LATLNG } from '../constants/latlng';

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

// 주어진 좌표와 가장 가까운 location을 찾는 함수
function findClosestLocation(latitude: number, longitude: number) {
    let closestLocation = LATLNG[0];
    let minDistance =
        Math.abs(LATLNG[0].latitude - latitude) +
        Math.abs(LATLNG[0].longitude - longitude);

    LATLNG.forEach((location) => {
        const latDiff = Math.abs(location.latitude - latitude);
        const lonDiff = Math.abs(location.longitude - longitude);
        const totalDiff = latDiff + lonDiff;

        if (totalDiff < minDistance) {
            minDistance = totalDiff;
            closestLocation = location;
        }
    });

    return closestLocation;
}

export async function getGeocoder(address: string): Promise<{
    location: string;
    id: number;
    latitude: number;
    longitude: number;
} | null> {
    try {
        const response = await fetch(
            `/api/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&refine=true&simple=false&format=xml&type=road&key=A399B687-B71F-39A6-B2AB-3EEAA5C2CC37&address=${address}`,
            {
                method: 'GET',
            }
        );

        const data = await response.text();

        const longitude = parseXML(data, 'x');
        const latitude = parseXML(data, 'y');

        const closestLocation = findClosestLocation(
            parseFloat(latitude),
            parseFloat(longitude)
        );

        return closestLocation;
    } catch (e) {
        console.error(e);
    }
    return null;
}
