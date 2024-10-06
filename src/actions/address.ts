import { LATLNG } from '../constants/latlng';

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
        const response = await fetch(`/api/geocoding?address=${address}`, {
            headers: { 'Content-Type': 'application/json' },
        });
        const { latitude, longitude } = await response.json();
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        const closestLocation = findClosestLocation(lat, lon);

        return closestLocation;
    } catch (e) {
        console.error(e);
    }
    return null;
}
